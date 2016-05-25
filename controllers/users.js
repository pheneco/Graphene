/*
 *	Graphene >> Users Routes
 *	Written by Trevor J Hoglund
 *	Mar 20, 2016
 */

module.exports	= function(app, Graphene, EmailTemp, mailer){
	var User	= require('../models/user'),
		ServerChange = require('../models/serverchangelog'),
		Feed	= require('../models/feed'),
		Post	= require('../models/post'),
		Change	= require('../models/changelog'),
		Album	= require('../models/album'),
		fs		= require('fs'),
		sharp	= require('sharp'),
		multer	= require('multer'),
		upload	= multer({dest:'/tmp/'}),
		autoReap= require('multer-autoreap'),
		bcrypt	= require('bcrypt-nodejs'),
		striptags = require('striptags');
	
	//	Accounts
	app.post('/user/new', function(req,res){
		User.count({userName:{$regex: new RegExp("^" + req.body.username + "$", "i")}}, function(e,c){
			if(!e){
				if(c==0){
					//Check if proper email here
					User.count({email:{$regex: new RegExp("^" + req.body.email + "$", "i")}}, function(e,c){
						if(!e){
							if(c==0){
								var nu = new User({
									userName	: req.body.username,
									username	: req.body.username.toLowerCase(),
									//firstName	: req.body.firstname,
									//lastName	: req.body.lastname,
									firstName	: 'DEPRECATED',
									lastName	: 'DEPRECATED',
									name		: req.body.name,
									email		: req.body.email,
									password	: bcrypt.hashSync(req.body.password),
									activated	: false,
									avatar		: 'default',
									avatarHash	: '0',
									background	: 'default',
									rank		: Graphene.dev?10:1,
									accent		: '#444444',
									nameHandle	: false,
									feeds		: [{
										name	: 'Default',
										index	: 0,
										color	: '#444444',
										default	: true,
										users	: []
									}],
									advanced	: [{
										emailNotes	: true,
										hoverColors	: false,
										eventStream	: true
									}],
									bio			: '<i>No information available.</i>',
									colorAvatar	: false,
									avatarColor	: '#444444'
								});
								nu.save(function(e,u){
									if(!e){
										console.log(Graphene.time() + req.body.username + " (" + u._id + ") registered.");
										if(!Graphene.dev)
											mailer.sendMail({
												from	: 'support@phene.co',
												to		: req.body.email,
												subject	: 'Activate Graphene Account',
												text	: 'To activate your Graphene account go to ' + Graphene.api + '/activate/' + u._id + '/' + encodeURIComponent(bcrypt.hashSync(u._id)) + '\nNote: Graphene w0.4.0 is a preview release, all content on the site is subject to spontaneous removal. This applies especially to posts, seeing as plans for w0.5.0 include restructuring them.',
												html	: EmailTemp({
													content : 'To activate your Graphene account click here: <a style="margin-top:10px;text-align:center;display:block;width:490px;padding:5px;background:#444;color:white;text-decoration:none;" href="' + Graphene.api + '/activate/' + u._id + '/' + encodeURIComponent(bcrypt.hashSync(u._id)) + '">ACTIVATE</a><br><span style="color:red">Note: Graphene w0.4.0 is a preview release, all content on the site is subject to spontaneous removal. This applies especially to posts, seeing as plans for w0.5.0 include restructuring them.</span>',
													prefix	: Graphene.sub
												})
											},function(e,i){
												if(e) console.log(Graphene.time() + e);
											});
										req.session.user = u._id;
										res.redirect(Graphene.url);
									}else{
										console.log(Graphene.time() + e);
										res.send("0");
									}
								})
							} else res.send("A user with the email address \'" + req.body.email + "\' already exists.");
						} else console.log(Graphene.time() + "Error checking user database for email address.");
					});
				} else res.send("A user with the name \'" + req.body.username + "\' already exists.");
			} else console.log(Graphene.time() + "Error checking user database for username.");
		});
	});
	app.post('/login', function(req,res){
		User.count({email:{$regex: new RegExp("^" + req.body.email + "$", "i")}}, function(e,c){
			if(!e){
				if(c==1){
					User.find({email:{$regex: new RegExp("^" + req.body.email + "$", "i")}}, function(e,u){
						if(!e){
							if(bcrypt.compareSync(req.body.password, u[0].password)) {
								console.log(Graphene.time() + u[0].userName + " ("+ (req.session.user = u[0]._id) + ") logged in");
								res.redirect(Graphene.url);
							} else res.redirect(Graphene.url + '/login?fail');
						} else console.log(Graphene.time() + "Error retrieving user information from database.");
					});
				} else res.redirect(Graphene.url + '/login?fail');
			} else console.log(Graphene.time() + "Error checking user database for email address.");
		});
	});
	app.get('/logout', function(req,res){
		req.session.destroy();
		res.redirect(Graphene.url);
	});
	app.post('/settings', function(req,res){
		User.update({_id:req.session.user}, {
			//firstName	: req.body.firstName,
			//lastName	: req.body.lastName,
			name		: req.body.name,
			nameHandle	: req.body.nameHandle,
			accent		: req.body.accent,
		}, {upsert: true}, function(e){
			if(e) res.send(e);
			else res.send("");
		});
	});
	app.post('/settings/advanced', function(req,res){
		User.update({_id:req.session.user}, {
			advanced	: [{
				emailNotes	: req.body.emailNotes,
				hoverColors	: req.body.hoverColors,
				eventStream	: req.body.eventStream
			}]
		}, {upsert: true}, function(e){
			if(e) res.send(e);
			else res.send("");
		});
	});
	app.post('/password', function(req,res){
		User.findOne({_id:req.session.user},function(e,u){
			if(!bcrypt.compareSync(req.body.oldPass, u.password)) return res.send("Incorrect password!");
			if(req.body.newPass !== req.body.newPass2) return res.send("Passwords do not match!")
			User.update({_id:req.session.user}, {
				password : bcrypt.hashSync(req.body.newPass)
			}, {upsert: true}, function(e){
				if(e) res.send(e);
				else res.send("");
			});
		});
	});
	app.get('/activate/:user/:code',function(req,res){
		if(bcrypt.compareSync(req.params.user, req.params.code)) User.findOne({_id:req.params.user},function(e,u){
			if(e) return res.send(e);
			if(u==null) return res.send('User Does Not Exist');
			u.activated = true;
			u.rank = 2;
			u.save(function(e,u){
				if(e) return res.send(e);
				else{
					console.log(Graphene.time() + u.userName + " (" + u._id + ") activated their account.");
					res.redirect(Graphene.url);
				}
			});
		});
	});
	app.post('/user/avatar/new',upload.single('avatar'),autoReap,function(req,res){
		if(!req.session.user) return res.send("Must be logged in");
		var savior = function(album){
			if(!req.file) return res.send("Must send image");
			fs.readFile(req.file.path, function(e,i){ if(e) return res.send(e);
			album.images.push({
				ext	: req.file.mimetype.split('/')[1],
				plainText : 'An Avatar',
				richText  : 'An Avatar'
			});
			album.save(function(e,album){
			var newim	= album.images[album.images.length-1],
				path	= Graphene.imgDir + '/' + album._id + '/' + newim._id + '/original.' + newim.ext;
			fs.mkdir(Graphene.imgDir + '/' + album._id,function(e){
				if(e && e.code !== 'EEXIST') return res.send(e);
				fs.mkdir(Graphene.imgDir + '/' + album._id + '/' + newim._id,function(e){
				if(e && e.code !== 'EEXIST') return res.send(e);
				fs.writeFile(path,i,function(e){ if(e) return res.send(e);
					User.findOne({_id:req.session.user},function(e,u){ if(e) return res.send(e);
					u.avatar = '' + album._id + '/' + newim._id;
					u.avatarHash = '0';
					u.save(function(e,uu){ if(e) return res.send(e);
					sharp(path).resize(200,200).crop(sharp.gravity.center).toFile(Graphene.imgDir + '/' + album._id + '/' + newim._id + '/' + u.avatarHash + '-200.jpg',function(e,i){
					sharp(path).resize(36,36).crop(sharp.gravity.center).toFile(Graphene.imgDir + '/' + album._id + '/' + newim._id + '/' + u.avatarHash + '-36.jpg',function(e,i){
					sharp(path).resize(500,null).toFile(Graphene.imgDir + '/' + album._id + '/' + newim._id + '/500.jpg',function(e,i){
						console.log(Graphene.time() + u.userName + " (" + u._id + ") uploaded an avatar (" + newim._id + ").");
						res.send('Success!');
					});
					});
					});
					});
					});
				});
				});
			});
			});
			});
		};
		Album.findOne({user:req.session.user,name:'Avatars'},function(e,a){
			if(!a) Album.create({
				user		: req.session.user,
				name		: 'Avatars',
				plainText	: "System created album for storing user&apos;s avatars.",
				richText	: "System created album for storing user&apos;s avatars."
			},function(e,aa){ if(e) return res.send(e);
				savior(aa);
			});
			else savior(a);
		});
	});
	app.post('/user/avatar/crop',function(req,res){
		if(!req.session.user) return res.send("Must be logged in");
		if(!(req.body.left && req.body.top && req.body.width && req.body.height)){ return res.send("Invalid values"); console.log(Graphene.time() + "Invalid values");}
		User.findOne({_id:req.session.user},function(e,u){ if(e) return res.send(e);
		u.avatarHash = "" + req.body.left + req.body.top + req.body.width + req.body.height;
		u.save(function(e,uu){ if(e) return res.send(e);
		sharp(Graphene.imgDir + '/' + u.avatar + '/500.jpg').extract(~~req.body.top,~~req.body.left,~~req.body.width,~~req.body.height).resize(200,200).crop(sharp.gravity.center).toFile(Graphene.imgDir + '/' + u.avatar + '/' + u.avatarHash + '-200.jpg',function(e,i){
		sharp(Graphene.imgDir + '/' + u.avatar + '/' + u.avatarHash + '-200.jpg').resize(36,36).crop(sharp.gravity.center).toFile(Graphene.imgDir + '/' + u.avatar + '/' + u.avatarHash + '-36.jpg',function(e,i){
			Album.findOne({user:req.session.user,name:'Avatars'},function(e,a){
				var avt = a.images[a.images.length-1];
				avt.crops.push({
					top		: req.body.top,
					left	: req.body.left,
					height	: req.body.height,
					width	: req.body.width
				});
				a.save(function(e,aa){ if(e) return res.send(e);
					res.send('Success!');
				});
			});
		});
		});
		});
		});
	});
	app.post('/user/avatar/color',function(req,res){
		User.findOne({_id:req.session.user},function(e,u){ if(e) return res.send(e);
		User.update({_id:req.session.user}, {
			avatarColor	: req.body.avatarColor,
			colorAvatar	: req.body.colorAvatar
		}, {upsert: true}, function(e){
			if(e) res.send(e);
			else{
				if(req.body.colorAvatar) console.log(Graphene.time() + u.userName + " (" + u._id + ") changed avatar color to " + req.body.avatarColor);
				res.send("");
			}
		});
		});
	});
	app.post('/user/bio/set', function(req,res){
		User.findOne({_id:req.session.user},function(e,u){ if(e) return res.send(e);
		User.update({_id:req.session.user}, {
			bio			: striptags(req.body.bio)
		}, {upsert: true}, function(e){
			if(e) res.send(e);
			else{
				console.log(Graphene.time() + u.userName + " (" + u._id + ") changed bio information.");
				res.send("");
			}
		});
		});
	});
	
	//	Info
	app.get('/session', function(req,res){
		if(req.session.user)
			Graphene.getUserInfo(req.session.user,false,function(u){
				res.send(u);
			},req,res);
		else
			Change.findOne({},{},{sort:{_id:-1}},function(e,c){if(e) return res.send(e);
				res.send(JSON.stringify({
					rank		: 0,
					user		: 0,
					advanced	: [{
						emailNotes	: true,
						hoverColors	: false,
						eventStream	: true
					}],
					version		: c.version,
					sVersion	: Graphene.v,
					accent		: "#444444",
					colorAvatar	: true,
					avatarColor	: "#444444"
				}));
			});
	});
	app.get('/users', function(req,res){
		var cont = function(e,u){
			if(e) return res.send(e);
			var users = [];
			if(u.length == 0)
				return res.send(['only']);
			for(var i = 0; i < u.length; i++)
				users[users.length] = ""+u[i]._id;
			if(u.length < req.query.amount)
				users[users.length] = 'last';
			res.send(users);
		}
		if(req.query.set == 'search'){
			User.find(
				req.query.start && req.query.start != 'default'
					? {_id:{$lt:req.query.start},$text:{$search:req.query.data}}
					: {$text:{$search:req.query.data}}
			).sort('-_id').limit(+req.query.amount).exec(cont);
		} else res.send(['only']);
	});
	app.get('/user/:user', function(req,res){
		Graphene.getUserInfo(req.params.user,true,function(u){
			res.send(u);
		},req,res);
	});
	app.get('/user/:user/byId', function(req,res){
		Graphene.getUserInfo(req.params.user,false,function(u){
			res.send(u);
		},req,res);
	});
	app.get('/user/:user/getId', function(req,res){
		User.findOne({username:req.params.user.toLowerCase()}, function(e,u){
			if(e || u == null) return res.send(e);
			res.send(u._id);
		})
	});
	app.get('/test/userName', function(req,res){
		User.count({userName:{$regex: new RegExp("^" + req.body.username + "$", "i")}}, function(e,c){
			if(!e) res.send(c==0?"open":"taken");
			else res.send(e);
		});
	});
	app.get('/test/email', function(req,res){
		User.count({email:{$regex: new RegExp("^" + req.body.email + "$", "i")}}, function(e,c){
			if(!e) res.send(c==0?"open":"taken");
			else res.send(e);
		});
	});
}