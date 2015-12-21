/*
 *	Graphene >> Post Routes
 *	Written by Trewbot
 *	Dec 20, 2015
 */

module.exports = function(app, Graphene, Notification){
	//	Variables
	var Post			= require('../models/post'),
		User			= require('../models/user'),
		Note			= require('../models/notification'),
		Feed			= require('../models/feed'),
		config			= require('../config.json'),
		marked			= require('marked'),
		fs				= require('fs'),
		sse				= require('connect-sse')(),
		http			= require('http'),
		https			= require('https'),
		cheerio			= require('cheerio'),
		request			= require('request'),
		renderer		= new marked.Renderer(),
		events			= require('events'),
		Comments		= new events.EventEmitter(),
		Tags			= new events.EventEmitter(),
		Posts			= new events.EventEmitter();
	Comments.setMaxListeners(0);
	Tags.setMaxListeners(0);
	Posts.setMaxListeners(0);
	renderer.heading	= function(text,level){for(var i = 1; i < level; i++) text = '#' + text; return text;}	//	Kill header rendering
	marked.setOptions({
		renderer	: renderer,
		sanitize	: true
	});
	
	//	Create/Change
	app.post('/post', function(req,res){
		if(req.session.user){
			User.findOne({_id:req.session.user}, function(e,u){
				var plainText	= req.body.text,
					test,link;
				if(test			= plainText.match(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])\n/)){
					link		= test[1];
					plainText	= plainText.replace(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])\n/,'');
				}
				var richText	= (~plainText.indexOf('@html') && u.rank >= 10)
									? plainText.replace('@html','') // CHAOS XD
									: marked(plainText),
					regex		= /#(\w+)/g,
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
							.replace(/(\s+|^|\>)#(\w+)/gm, '$1<a href="' + Graphene.url + '/tag/$2">#$2</a>').replace(/(\s+|^|\>)@(\w+)/gm, '$1<a href="' + Graphene.url + '/user/$2">@$2</a>')
							.replace(/\/map\((.*)\)/g, function($1){
								return '<iframe frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q='
								       + encodeURIComponent($1)
									   + '&key='
									   + config.googleMapsEmbedAPIKey
									   + '" allowfullscreen></iframe>';
							}),
						plainText	: plainText,
						tags		: tags,
						users		: users,
						followers	: [req.session.user]
					});
				if(req.body.type == "text"){
					if(plainText.length > 0){
						post.type = "text";
					} else return res.send("Post cannot be empty!");
					if(link) post.type = "link", post.content = link;
				} else if(req.body.type == "image"){
					post.type = "image";
				} else if(req.body.type == "link") {
					if(!req.body.content.match(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/)) return res.send("Invalid URL!");
					post.type = "link";
					post.content = req.body.content;
				}else return res.send("Invalid post type!");
				post.save(function(e,p){
					if(!e){
						//Fire event listeners
						Posts.emit(""+u._id);
						for(var i = 0; i < tags.length; i++) Tags.emit(""+tags[i]);
						for(var i = 0; i < users.length; i++) Posts.emit("@"+users[i]);
						res.send("");
						User.find({username:{$in:users}},function(e,u){
							if(e) return console.log(e);
							for(var i = 0; i < u.length; i++){
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
						console.log("Error creating post.");	
					}
				});
			});
		} else return res.send("Must be logged in to post!");
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
		Post.findOne({_id:req.params.id}, function(e,p){if(e || p == null) return res.send(e);
			if(p.user !== req.session.user) return false;
			Post.remove({_id:req.params.id}, function(e){if(e) return res.send(e);
			Note.remove({data:req.params.id}, function(e){if(e) return res.send(e);
				Posts.emit(""+req.session.user);
				for(var i = 0; i < p.users.length; i++) Posts.emit("@"+p.users[i]);
				return res.send("Post deleted succesfully!");
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
					).sort('-_id').limit(req.query.amount).exec(cont);
				});
			});
		} else if(req.query.set == 'feed' && req.session.user){
			Graphene.getFollowing(req.session.user,req.query.data,function(e){
				Post.find(
					req.query.start && req.query.start != 'default'
						? {_id:{$lt:req.query.start},user:{$in:e}}
						: {user:{$in:e}}
				).sort('-_id').limit(req.query.amount).exec(cont);
			});
		} else if(req.query.set == 'tag'){
			Post.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},tags:req.query.data.toLowerCase()}
					: {tags:req.query.data}
			).sort('-_id').limit(req.query.amount).exec(cont);
		} else if(req.query.set == 'user'){
			User.findOne({_id:req.query.data},function(e,u){if(e) return res.send(e);
				Post.find(
					req.query.start && req.query.start != 'default'
						? {_id:{$lt:req.query.start},$or:[{user:req.query.data},{users:u.username}]}
						: {$or:[{user:req.query.data},{users:u.username}]}
				).sort('-_id').limit(req.query.amount).exec(cont);
			});
		} else if(req.query.set == 'userPosts'){
			Post.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},user:req.query.data}
					: {user:req.query.data}
			).sort('-_id').limit(req.query.amount).exec(cont);
		} else if(req.query.set == 'search'){
			Post.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},$text:{$search:req.query.data}}
					: {$text:{$search:req.query.data}}
			).sort('-_id').limit(req.query.amount).exec(cont);
		} else res.send(['only']);
	});
	app.get('/post/:id', function(req,res){
		Post.findOne({_id:req.params.id}, function(e,p){if(e) return res.send(e);
		if(!p) return res.send("Post does not exist.");
		User.findOne({_id:p.user}, function(e,u){
			var post = {
				user		: {
					name	: u.nameHandle ? u.userName : u.firstName + " " + u.lastName,
					userName: u.userName,
					id		: u._id,
					url		: Graphene.url + "/user/" + u.userName,
					avatar	: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-36.jpg"
				},
				url			: Graphene.url + "/post/" + p._id,
				id			: p._id,
				type		: p.type,
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
								name	: uu[j].nameHandle ? uu[j].userName : uu[j].firstName + " " + uu[j].lastName,
								userName: uu[j].userName,
								id		: uu[j]._id,
								url		: Graphene.url + "/user/" + uu[j].userName,
								avatar	: Graphene.img + "/" + uu[j].avatar + "/" + uu[j].avatarHash + "-36.jpg"
							};
					//	THIS IS WHERE POST TYPE HANDLING WILL GO
					if(post.type == 'link') {
						var tweet,fakku;
						if(tweet = p.content.match(/twitter.com\/(.+)\/status\/(.+)/)){
							post.twitterLink = true;
							return request('https://api.twitter.com/1/statuses/oembed.json?id=' + tweet[2] + '&size=large&border=off&done=null', function(error, response, body){
								if(error) post.error = 'link', res.send(post);
								post.link = JSON.parse(body).html;
								res.send(post);
							});
						} else if(fakku = p.content.match(/fakku.net\/(manga|doujinshi)\/(.+)/)){
							post.fakkuLink = true;
							return request('https://api.fakku.net/' + fakku[1] + '/' + fakku[2] + '/read', function(error,response,body){
								if(error) post.error = 'link', res.send(post);
								try{
									post.fakkuinfo = JSON.parse(body);
									post.fakkuapi = 'https://api.fakku.net/' + fakku[1] + '/' + fakku[2] + '/read';
									res.send(post);
								}catch(e){
									post.error = 'link';
									res.send(post);
								}
								//I can use the fucking source files for WHATEVER I WANT
								//note to self: https://www.youtube.com/watch?v=vwOds8z2wwE
							});
						} else if(p.content.match(/soundcloud.com\/(.+)\/(.+)/)){
							post.soundcloudLink = true;
							post.link = p.content;
							return res.send(post);
						} else return request({
								url		: p.content,
								method	: 'HEAD'
							}, function(error, head){
								if(head.headers['content-type'].match(/video\//)) {
									post.videoLink = true;
									post.link = p.content;
									return res.send(post);
								}
								if(head.headers['content-type'].match(/image\//)) {
									post.imageLink = true;
									post.link = p.content;
									return res.send(post);
								}
								if(head.headers['content-length'] > 125000){
									post.regularLink = true;
									post.link = p.content;
									res.send(post);
								} else request(p.content, function(error, response, body){
									if(error) post.error = 'link', res.send(post);
									var m = cheerio.load(body)('meta'), meta = {};
									for(var n = 0; n < m.length; n++)
										meta[m[n].attribs.name] = m[n].attribs.content;
									if(meta['twitter:player']){
										post.embedLink = true;
										post.link = meta['twitter:player'];
									} else {
										post.regularLink = true;
										post.link = p.content;
									}
									res.send(post);
								});
							});
					}
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
							name	: uu[m].nameHandle ? uu[m].userName : uu[m].firstName + " " + uu[m].lastName,
							userName: uu[m].userName,
							id		: uu[m]._id,
							url		: Graphene.url + "/user/" + uu[m].userName,
							avatar	: Graphene.img + "/" + uu[m].avatar + "/" + uu[m].avatarHash + "-36.jpg"
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