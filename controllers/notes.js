/*
 *	Graphene >> Notifications Routes
 *	Written by Trewbot
 *	Sep 18, 2015
 */

module.exports = function(app, Graphene, Notification){
	//	Variables
	var Note			= require('../models/notification'),
		Post			= require('../models/post'),
		User			= require('../models/user');
	
	//	How did any of this ever get done? I don't do fucking anything ever.
	//	Aug 21, 2015
	
	//	Routes
	app.get('/notes', function(req,res){
	Note.find({recipient:req.session.user},null,{sort:{date:-1}},function(e,n){
			if(e) return res.send(e);
			var users	= [req.session.user],
				posts	= [];
			// This does loopy loop stuff
			for(var i = 0; i < n.length; i++)
				users	= users.concat([n[i].sender]),
				posts	= posts.concat([n[i].data[0]]);
				//	This could work out anyway... they don't need to be unique do they?
			Post.find({_id:{$in:posts}},function(e,p){ if(e) return res.send(e);
				for(var h = 0; h < p.length; h++)
					users.concat(p[h].user);
				User.find({_id:{$in:users}},function(e,u){ if(e) return res.send(e);
					var checked	= [],	//	Checked Strings
						checker = {},
						notes	= [],
						y		= 0;	//	Completed Notifications
					for(var i = 0; i < n.length; i++){
						var ck	= n[i].type + ';' +  n[i].data[0] + ';' + n[i].read;
						if(!~checked.indexOf(ck)){
							checked.push(ck);
							checker[ck] = [""+n[i]._id];
							notes[y]	= {
								type	: n[i].type,
								data	: n[i].data[0],
								read	: n[i].read,
								time	: n[i]._id.getTimestamp().getTime(),
								owner	: [],
								users	: [],
								senders	: []
							}
							//	Weeks, I have been working on this for fucking weeks... anxiety, man.
							//	Jul 22, 2015
							for(var j = 0; j < p.length; j++)
								if(p[j]._id == n[i].data[0]) notes[y].post = Graphene.collect(p[j]._doc,{
									preview		: Graphene.getWords(p[j].richText,3)
								}), j = p.length - 1;
							notes[y].yours = req.session.user == notes[y].post.user;
							//	^^ This sould only run for post notifications... which is all of them at the moment
							for(var k = 0; k < n.length; k++)
								if(n[k].type + ';' +  n[k].data[0] + ';' + n[k].read == ck) notes[y].senders.push(n[k].sender);
							for(var l = 0; l < u.length; l++){
								u[l].password	= "";
								if(~notes[y].senders.indexOf(""+u[l]._id)) notes[y].users.push(Graphene.collect(u[l]._doc,{
									user		: u[l].userName,
									name		: u[l].nameHandle ? u[l].userName : u[l].firstName + " " + u[l].lastName,
									avatar		: Graphene.img + "/" + u[l].avatar + "/36.jpg",
									avatarFull	: Graphene.img + "/" + u[l].avatar + "/200.jpg",
									url			: Graphene.url + "/user/" + u[l].userName
								}));
								if(""+u[l]._id == notes[y].post.user) notes[y].owner = Graphene.collect(u[l]._doc,{
									user		: u[l].userName,
									name		: u[l].nameHandle ? u[l].userName : u[l].firstName + " " + u[l].lastName,
									avatar		: Graphene.img + "/" + u[l].avatar + "/36.jpg",
									avatarFull	: Graphene.img + "/" + u[l].avatar + "/200.jpg",
									url			: Graphene.url + "/user/" + u[l].userName
								});
							}
							y++;
						} else checker[ck][checker[ck].length] = ""+n[i]._id;
					}
					for(var z = 0; z < notes.length; z++)
						if(notes[z]) notes[z].ids = checker[notes[z].type + ';' +  notes[z].data + ';' + notes[z].read];
					res.send(notes);
				});
			});
			//	Fascist bullshit...
			//	Jul 15, 2015
		});
	});
	app.post('/notes/:ids/read', function(req,res){
		//	Just get a JSON array of ids, mark them as read:true
		console.log("Reading notes: "+req.params.ids);
		Note.update({_id:{$in:req.params.ids.split(',')}},{$set:{read:true}},{multi:true},function(e){
			if(e) return res.send(e);
			res.send(true);
		});
	});
	app.delete('/notes/:ids', function(req,res){
		//	JSON [] -> delete with mongoose thing
		Note.remove({_id:{$in:req.params.ids.split(',')}}, function(e,n){
			if(e) return res.send(e);
			res.send(true);
		})
	});
	app.get('/notes/stream', function(req,res){
		
		//	These streams are a pain in the ass
		//	Sep 15, 2015
		
		req.socket.setTimeout(31536e6);
		res.writeHead(200, {
			'Content-Type'	: 'text/event-stream',
			'Cache-Control'	: 'no-cache',
			'Connection'	: 'keep-alive'
		});
		var call	= function(){
			Note.find({recipient:req.session.user,read:false},function(e,n){
				if(e) return 0;
				var checked	= [],	//	Checked Strings
					checker = {},
					y		= 0;	//	Completed Notifications
				for(var i = 0; i < n.length; i++){
					var ck	= n[i].type + ';' +  n[i].data[0] + ';' + n[i].read;
					if(!~checked.indexOf(ck)){
						checked.push(ck);
						checker[ck] = [""+n[i]._id];
						y++;
					} else checker[ck][checker[ck].length] = ""+n[i]._id;
				}
				res.write("data: " + y + "\n\n");
			});
		}
		Notification.on(""+req.session.user,call);
		res.write("\n");
		req.on('close', function(){
			Notification.removeListener(""+req.session.user,call);
		});
	});
}