/*
 *	Graphene >> Post Routes
 *	Written by Trevor J Hoglund
 *	2016.12.28
 */

module.exports = function(app, Graphene, Notification){
	//	Variables
	var Post			= require('../models/post'),
		User			= require('../models/user'),
		Note			= require('../models/notification'),
		Feed			= require('../models/feed'),
		config			= require('../config.json'),
		marked			= require('marked'),
		Album			= require('../models/album'),
		fs				= require('fs'),
		sharp			= require('sharp'),
		multer			= require('multer'),
		upload			= multer({dest:'/tmp/'}),
		autoReap		= require('multer-autoreap'),
		sse				= require('connect-sse')(),
		http			= require('http'),
		https			= require('https'),
		cheerio			= require('cheerio'),
		request			= require('request'),
		SC				= require('node-soundcloud'),
		renderer		= new marked.Renderer(),
		events			= require('events'),
		Comments		= new events.EventEmitter(),
		Tags			= new events.EventEmitter(),
		Posts			= new events.EventEmitter();
	Comments.setMaxListeners(0);
	Tags.setMaxListeners(0);
	Posts.setMaxListeners(0);
	SC.init({
		client_id	: config.soundcloudAPIKey
	});
	renderer.heading	= function(text,level){for(var i = 1; i < level; i++) text = '#' + text; return text;};	//	Kill header rendering
	renderer.image		= function(href,title,text){
		var img = (!new RegExp(Graphene.img + "/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)/original.webm").test(href)
			? ('<a lightbox onclick=\'_g.pu.lightbox(' +
				(new RegExp(Graphene.img + "/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)/1280.jpeg").test(href)
					? '\"api\",\"' + Graphene.api + '/album/' + href.split(Graphene.img)[1].split('/')[1] + '\",\"images.*.1280\",\"' + href + '\"'
					: '\"object\",\"{\\"pages\\":[\\"' + href + '\\"]}\",\"pages.*\",0') +
				');\'><img src="' + href + '"' + (text?' alt="' + text + '"':'') + (title?' title="' + title + '"':'') + '></a>')
			: '<iframe src="/player?src=' + href + '"></iframe>');
		return img;
	};
	marked.setOptions({
		renderer	: renderer,
		sanitize	: true
	});
	
	//	Create/Change
	app.post('/post', function(req,res){
		if(req.session.user){
			User.findOne({_id:req.session.user}, function(e,u){
				var plainText	= req.body.text;
				var richText	= (~plainText.indexOf('@html') && u.rank >= 10)
									? plainText.replace('@html','') // CHAOS XD
									: marked(plainText),
					regex		= Graphene.hashtagRegExp,
					regexu		= /@(\w+)/g,
					tags		= [],
					users		= [],
					result;
				while(result	= regex.exec(richText)) tags[tags.length] = result[1].toLowerCase();
				while(result	= regexu.exec(richText)) users[users.length] = result[1].toLowerCase();
				var post		= new Post({
						user		: req.session.user,
						at			: req.body.set,
						richText	: richText
							.replace(/<a/g,'<a target="_blank"')
							.replace(Graphene.hashtagRegExp2, '$1<a href="' + Graphene.url + '/tag/$2">#$2</a>')
							.replace(/(\s+|^|\>)@(\w+)/gm, '$1<a href="' + Graphene.url + '/user/$2">@$2</a>')
							.replace(/<p><a target="_blank" href="https:\/\/vimeo.com\/([0-9]+)&?(.*)">(.*)<\/a><\/p>/,'<div class="post-video"><iframe src="//player.vimeo.com/video/$1?$2"></iframe></div>')
							.replace(/<p><a target="_blank" href="https:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9-_]+)&?(.*)">(.*)<\/a><\/p>/,'<div class="post-video"><iframe src="https://www.youtube.com/embed/$1?$2"></iframe></div>')
							.replace(/<p>\/bandcamp album (.*)<\/p>/g, '<iframe style="border:0;" src="https://bandcamp.com/EmbeddedPlayer/album=$1/size=large/bgcol=ffffff/linkcol=444444/artwork=small/transparent=true/" seamless>Bandcamp Embed</iframe>')
							.replace(/<p>\/map (.*)<\/p>/g, function(){
								return '<iframe frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q='
								       + encodeURIComponent(arguments[1])
									   + '&key='
									   + config.googleMapsEmbedAPIKey
									   + '" allowfullscreen></iframe>';
							}),
						plainText	: plainText,
						tags		: tags,
						users		: users,
						followers	: [req.session.user]
					});
				if(plainText.length > 0){
					post.type = "text";
				} else return res.send("Oh, I see, we're sending empty posts now... how am I ever supposed to fill the void in my life if all you send is more emptiness?");
				post.save(function(e,p){
					if(!e){
						//Fire event listeners
						Posts.emit(""+u._id);
						for(var i = 0; i < tags.length; i++) Tags.emit(""+tags[i]);
						for(var i = 0; i < users.length; i++) Posts.emit("@"+users[i]);
						res.send("");
						console.log(Graphene.time() + u.userName + " (" + u._id + ") created post " + p._id + ".");
						User.find({username:{$in:users}},function(e,u){
							if(e) return console.log(Graphene.time() + e);
							for(var i = 0; i < u.length; i++){
								if(""+u[i]._id == req.session.user) continue;
								var note = new Note({
									recipient	: ""+u[i]._id,
									sender		: req.session.user,
									type		: "attag",
									data		: [
										p._id
									],
									read		: !1
								});
								note.save();
								Notification.emit(""+u[i]._id);
								Posts.emit("@"+u[i]._id);
							}
						});
					}else{
						res.send("Error creating post.");	
						console.log(Graphene.time() + "Error creating post.");
					}
				});
			});
		} else return res.send("You didn't even bother logging into an account... ok... that's fine... I didn't really like this site either...");
	});
	app.post('/post/:id/comment', function(req,res){
		if(!req.session.user) return res.send("Must be logged in to comment.");
		if(req.body.text == '' || typeof req.body.text !== 'string') return res.send("Comments shouldn't be blank.");
		Post.findOne({_id:req.params.id}, function(e,post){
			if(e) return res.send(e);
			post.comments.push({
				user		: req.session.user,
				plainText	: req.body.text,
				richText	: marked(req.body.text).replace(/(\s+|^|\>)#(\w+)/gm, '$1<a href="' + Graphene.url + '/tag/$2">#$2</a>').replace(/(\s+|^|\>)@(\w+)/gm, '$1<a href="' + Graphene.url + '/user/$2">@$2</a>')
			});
			if(req.session.user != post.user && !~post.followers.indexOf(req.session.user) && !~post.blockers.indexOf(req.session.user))
				post.followers.push(req.session.user);
			post.save(function(e,p){
				if(e) return res.send(e);
				res.send("Comment posted.");
				for(var i = 0; i < post.followers.length; i++){
				if(post.followers[i] != req.session.user){
					var note = new Note({
						recipient	: post.followers[i],
						sender		: req.session.user,
						type		: "comment",
						data		: [
							post._id,
							post.comments[post.comments.length-1]._id
						],
						read		: !1
					});
					note.save();
					Notification.emit(""+post.followers[i]);
				}
				}
				Comments.emit(""+p._id,""+p._id);
			});
		});
	})
	app.delete('/post/:id', function(req,res){
		if(!req.session.user) return res.send("");
		User.findOne({_id:req.session.user}, function(e,u){if(e) return res.send(e);
		Post.findOne({_id:req.params.id}, function(e,p){if(e || p == null) return res.send(e);
			if(p.user !== req.session.user) return false;
			Post.remove({_id:req.params.id}, function(e){if(e) return res.send(e);
				console.log(Graphene.time() + u.userName + " (" + u._id + ") deleted post " + p._id + ".");
				Note.remove({data:req.params.id}, function(e){if(e) return res.send(e);
					Posts.emit(""+req.session.user);
					for(var i = 0; i < p.users.length; i++) Posts.emit("@"+p.users[i]);
					return res.send("Your post is gone now... just like she is...");
				});
			});
		});
		});
	});
	app.delete('/post/:post/comment/:comment',function(req,res){
		if(!req.session.user) return res.send("Must be logged in!");
		Post.findOne({_id:req.params.post},function(e,p){
			if(e) return res.send(e);
			var c = p.comments.id(req.params.comment);
			if(c == null || c.user !== req.session.user) return res.send("");
			c.remove();
			p.save(function(e,p){
				if(e) return res.send(e);
				else {
					Comments.emit(""+p._id,""+p._id);
					res.send(".");
				}
			});
		});
	});
	
	//	Interact
	app.post('/post/:id/favorite',function(req,res){
		if(!req.session.user) return res.send("Must be logged in!");
		Post.findOne({_id:req.params.id},function(e,p){
			if(e) return res.send(e);
			p.ratings.push({
				user		: req.session.user,
				downVote	: !1
			});
			p.save(function(e,p){
				if(e) return res.send(e);
				res.send();
			});
		});
	});
	
	//	Info
	app.get('/posts', function(req,res){
		var cont = function(e,p){
			if(e) return res.send(e);
			var posts = [];
			if(p.length == 0)
				return res.send(['only']);
			for(var i = 0; i < p.length; i++)
				posts[posts.length] = p[i]._id;
			if(p.length < req.query.amount)
				posts[posts.length] = 'last';
			res.send(posts);
		}
		if(req.query.set == 'dash' && req.query.data == 'home') {
			User.findOne({_id:req.session.user},function(e,u){if(e) return res.send(e);
				Graphene.getFollowing(req.session.user,null,function(e){
					Post.find(
						req.query.start && req.query.start != 'default'
							? {_id:{$lt:req.query.start},$or:[{user:{$in:e}},{users:u.username}]}
							: {$or:[{user:{$in:e}},{users:u.username}]}
					).sort('-_id').limit(+req.query.amount).exec(cont);
				});
			});
		} else if(req.query.set == 'feed' && req.session.user){
			Graphene.getFollowing(req.session.user,req.query.data,function(e){
				Post.find(
					req.query.start && req.query.start != 'default'
						? {_id:{$lt:req.query.start},user:{$in:e}}
						: {user:{$in:e}}
				).sort('-_id').limit(+req.query.amount).exec(cont);
			});
		} else if(req.query.set == 'tag'){
			Post.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},tags:req.query.data.toLowerCase()}
					: {tags:req.query.data.toLowerCase()}
			).sort('-_id').limit(+req.query.amount).exec(cont);
		} else if(req.query.set == 'user'){
			User.findOne({_id:req.query.data},function(e,u){if(e) return res.send(e);
				Post.find(
					req.query.start && req.query.start != 'default'
						? {_id:{$lt:req.query.start},$or:[{user:req.query.data},{users:u.username}]}
						: {$or:[{user:req.query.data},{users:u.username}]}
				).sort('-_id').limit(+req.query.amount).exec(cont);
			});
		} else if(req.query.set == 'userPosts'){
			Post.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},user:req.query.data}
					: {user:req.query.data}
			).sort('-_id').limit(+req.query.amount).exec(cont);
		} else if(req.query.set == 'search'){
			Post.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},$text:{$search:req.query.data}}
					: {$text:{$search:req.query.data}}
			).sort('-_id').limit(+req.query.amount).exec(cont);
		} else res.send(['only']);
	});
	app.get('/post/:id', function(req,res){
		Post.findOne({_id:req.params.id}, function(e,p){if(e) return res.send(e);
		if(!p) return res.send("The post you're looking for, just like my will to live, doesn't exist.");
		User.findOne({_id:p.user}, function(e,u){
			var post = {
				user		: {
					//name	: u.nameHandle ? u.userName : u.firstName + " " + u.lastName,
					name	: u.nameHandle ? u.userName : u.name,
					userName: u.userName,
					id		: u._id,
					url		: Graphene.url + "/user/" + u.userName,
					avatar	: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-36.jpg",
					avatarColor : u.avatarColor,
					colorAvatar : u.colorAvatar
				},
				url			: Graphene.url + "/post/" + p._id,
				id			: p._id,
				type		: p.type,
				tags		: p.tags,
				time		: p._id.getTimestamp().getTime(),
				editable	: u._id == req.session.user,
				plainText	: p.plainText,
				richText	: p.richText,
				followers	: p.followers,
				preview		: Graphene.getWords(p.richText,3),
				commentCount: p.comments.length,
				commentList	: [],
				commentable	: req.session.user ? true : false 
			}
			Post.findOne({_id:req.params.id}, {comments: {$slice:-5}}, function(e,p){if(e) return res.send(e);
				for(var i = 0, cu = []; i < p.comments.length; i++) if(!~cu.indexOf(p.comments[i].user)) cu[cu.length] = p.comments[i].user;
				User.find({_id:{$in:cu}},function(e,uu){if(e) return res.send(e);
					for(var l = 0; l < p.comments.length; l++) post.commentList[l] = {
						richText	: p.comments[l].richText,
						plainText	: p.comments[l].plainText,
						id			: p.comments[l]._id,
						time		: p.comments[l]._id.getTimestamp().getTime()
					}
					for(var j = 0; j < uu.length; j++)
						for(var k = 0; k < p.comments.length; k++)
							if(uu[j]._id == p.comments[k].user) post.commentList[k].user = {
								//name	: uu[j].nameHandle ? uu[j].userName : uu[j].firstName + " " + uu[j].lastName,
								name	: uu[j].nameHandle ? uu[j].userName : uu[j].name,
								userName: uu[j].userName,
								id		: uu[j]._id,
								url		: Graphene.url + "/user/" + uu[j].userName,
								avatar	: Graphene.img + "/" + uu[j].avatar + "/" + uu[j].avatarHash + "-36.jpg",
								avatarColor : uu[j].avatarColor,
								colorAvatar : uu[j].colorAvatar
							};
					res.send(post);
				});
			});
		});
		});
	});
	app.get('/post/:id/feed', sse, function(req,res){
		req.socket.setTimeout(31536e6);
		var call	= function(){
			Post.findOne({_id:req.params.id}, function(e,p){if(e) return;
				for(var i = 0, list = []; i < p.comments.length; i++)
					list[list.length] = p.comments[i]._id;
				res.json({
					id		: p._id,
					count	: p.comments.length,
					list	: list
				});
			});
		};
		Comments.on(req.params.id,call);
		req.on('close', function(){
			Comments.removeListener(req.params.id,call);
		});
	});
	app.get('/posts/listen/:ids/:set/:setData', sse, function(req,res){
		req.socket.setTimeout(31536e6);
		try{
			var ids		= JSON.parse(req.params.ids);
		}catch(e){
			return res.send(e);
		}
		var users	= [],
			comCall	= function(postID){
				Post.findOne({_id:postID}, function(e,p){if(e) return;
					for(var i = 0, list = []; i < p.comments.length; i++)
						list[list.length] = p.comments[i]._id;
					res.json({
						type	: 'comment',
						id		: p._id,
						count	: p.comments.length,
						list	: list
					});
				});
			},
			posCall	= function(){
				res.json({
					type	: 'post'
				});
			};
		for(var i = 0; i < ids.length; i++) Comments.on(ids[i],comCall);
		
		if(req.params.set == 'dash' && req.params.setData == 'home') {
			Graphene.getFollowing(req.session.user,null,function(e){
				users = e;
				for(var i = 0; i < users.length; i++) Posts.on(""+users[i],posCall);
				Posts.on("@"+req.session.user,posCall);
			});
		} else if(req.params.set == 'feed' && req.session.user){
			Graphene.getFollowing(req.session.user,req.params.setData,function(e){
				users = e;
				for(var i = 0; i < users.length; i++) Posts.on(""+users[i],posCall);
			});
		} else if(req.params.set == 'tag'){
			Tags.on(""+req.params.setData.toLowerCase(),posCall);
		} else if(req.params.set == 'user'){
			Posts.on(""+req.params.setData,posCall);
			Posts.on("@"+req.params.setData,posCall);
		} else if(req.params.set == 'userPosts'){
			Posts.on(""+req.params.setData,posCall);
		}
		
		req.on('close', function(){
			for(var i = 0; i < ids.length; i++) Comments.removeListener(ids[i],comCall);
			if(req.params.set == 'dash' && req.params.setData == 'home') {
				for(var i = 0; i < users.length; i++) Posts.removeListener(""+users[i],posCall);
			} else if(req.params.set == 'feed' && req.session.user){
				for(var i = 0; i < users.length; i++) Posts.removeListener(""+users[i],posCall);
			} else if(req.params.set == 'tag'){
				Tags.removeListener(req.params.setData,posCall);
			} else if(req.params.set == 'user'){
				Posts.removeListener(req.params.setData,posCall);
			}
		});
	});
	app.post('/post/:id/comments', function(req,res){
		Post.findOne({_id:req.params.id}, function(e,p){if(e) return res.send(e);
			var index = p.comments.length - 1;
			if(req.body.start !== 'default')
				for(var i = 0; i < p.comments.length; i++)
					if(p.comments[i]._id == req.body.start) index = i - 1;
			for(var j = 0, cl = []; j < req.body.amount; j++)
				if(req.body.before){
					if(index - j >= 0) cl[cl.length] = p.comments[index - j];
				}else{
					if(index + j < p.comments.length) cl[cl.length] = p.comments[index + j];
				}
			for(var k = 0, cu = []; k < p.comments.length; k++)
				if(!~cu.indexOf(p.comments[k].user)) cu[cu.length] = p.comments[k].user;
			User.find({_id:{$in:cu}},function(e,uu){if(e) return res.send(e);
				for(var l = 0, cs = []; l < cl.length; l++) cs[l] = {
					richText	: cl[l].richText,
					plainText	: cl[l].plainText,
					id			: cl[l]._id,
					time		: cl[l]._id.getTimestamp().getTime()
				};
				for(var m = 0; m < uu.length; m++)
					for(var n = 0; n < cl.length; n++)
						if(uu[m]._id == cl[n].user) cs[n].user = {
							//name	: uu[m].nameHandle ? uu[m].userName : uu[m].firstName + " " + uu[m].lastName,
							name	: uu[m].nameHandle ? uu[m].userName : uu[m].name,
							userName: uu[m].userName,
							id		: uu[m]._id,
							url		: Graphene.url + "/user/" + uu[m].userName,
							avatar	: Graphene.img + "/" + uu[m].avatar + "/" + uu[m].avatarHash + "-36.jpg",
							avatarColor : uu[m].avatarColor,
							colorAvatar : uu[m].colorAvatar
						};
				res.send(cs);
			});
		});
	});

	//	Feeds
	app.post('/user/:user/follow',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			//	Get default feed (supposed to be the first one in the array...)
			if(u.feeds[0] == void 0) return res.send("Feed does not exist.");
			if(!~u.feeds[0].users.indexOf(req.params.user)) u.feeds[0].users.push(req.params.user);
			u.save(function(e,u){
				if(e) return res.send(e);
				else res.send("");
			});
		});
	});
	app.post('/user/:user/unfollow',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			//	Remove from all feeds
			for(var i = 0; i < u.feeds.length; i++){
				var indx = u.feeds[i].users.indexOf(req.params.user);
				if(indx > -1) u.feeds[i].users.splice(indx,1);
			}
			u.save(function(e,u){
				if(e) res.send(e);
				else res.send("");
			});
			
		});
	});
	app.post('/feed/:id/add/:user',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			
			//	I really can't be bothered to finish this script at the moment
			//	Sep 18, 2015
			
			var feed = u.feeds.id(req.params.id);
			if(feed == void 0) return res.send("Feed does not exist.");
			if(!~feed.users.indexOf(req.params.user)) feed.users.push(req.params.user);
			u.save(function(e,u){
				if(e) return res.send(e);
				else res.send("");
			});
		});
	});
	app.post('/feed/:id/remove/:user',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			var feed = u.feeds.id(req.params.id);
			if(feed == void 0) return res.send("Feed does not exist.");
			var indx = feed.users.indexOf(req.params.user);
			if(indx > -1) feed.users.splice(indx,1);
			u.save(function(e,u){
				if(e) res.send(e);
				else res.send("");
			});
			
		});
	});
	app.post('/feed/new/:name',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			u.feeds.push({
				name : req.params.name,
				index : u.feeds.length,
				color : '#444444',
				default : false,
				users : []
			});
			u.save(function(e,u){
				if(e) return res.send(e);
				res.send("");
			});
		});
	});
	app.post('/feed/:id/rename/:name',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			var feed = u.feeds.id(req.params.id);
			if(feed == void 0) return res.send("Feed does not exist.");
			feed.name == req.params.name;
			u.save(function(e,u){
				if(e) return res.send(e);
				else res.send("");
			});
		});
	});
	app.delete('/feed/:id',function(req,res){
		if(!req.session.user) return res.send("Must be logged in.");
		User.findOne({_id:req.session.user},function(e,u){
			if(e) return res.send(e);
			if(!u.feeds.id(req.params.id)) return res.send("Invalid feed!");
			if(u.feeds.id(req.params.id).default) return res.send("Cannot delete default feed!");
			var feed = u.feeds.id(req.params.id).remove();
			u.save(function(e,u){
				if(e) return res.send(e);
				else res.send("");
			});
		});
	});
};