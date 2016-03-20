/*
 *	Graphene Server s0.5.0
 *	Written by Trevor J Hoglund
 *	Mar 17, 2016
 */

//	Set Up
var root		= __dirname,
	path		= require('path'),
	os			= require('os'),
	fs			= require('fs'),
	config		= require('./config.json'),
	mongoose	= require('mongoose'),
	session		= require('express-session'),
	MongoStore	= require('connect-mongo')(session),
	bodyParser	= require('body-parser'),
	nodemailer	= require('nodemailer'),
	Handlebars	= require('handlebars'),
	entities	= new (require('html-entities').AllHtmlEntities)(),
	app			= require('express')(),
	client		= require('express')(),
	serveStatic = require('serve-static'),
	jade		= require('jade'),
	events		= require('events'),
	User		= require('./models/user'),
	Feed		= require('./models/feed'),
	Post		= require('./models/post'),
	Note		= require('./models/notification'),
	ServerChange= require('./models/serverchangelog'),
	Change		= require('./models/changelog'),
	EmailSrc	= fs.readFileSync('email.html', "utf8"),
	EmailTemp	= Handlebars.compile(EmailSrc),
	dev			= !(typeof process.argv[2] == 'undefined' || process.argv[2] != 'dev'),
	Graphene	= new(function(){
		this.sub			= config.sub;
		this.url			= config.addr.web  + (config.webPort == 80 ? '' : ":" + config.webPort);
		this.api			= config.addr.web + config.apiPort;
		this.img			= config.addr.img;
		this.imgDir			= config.imgDir;
		this.aud			= config.addr.aud;
		this.audDir			= config.audDir;
		this.dev			= dev;
		this.getWords		= function(string,num){
			var a;
			return entities.decode((a = string
				.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,"")
				.replace(/\n/," ")
				.split(" "))
				.splice(0,num)
				.join(" ") + (a.length > num ? "..." : ''));
		}
		this.collect		= function(){
			var ret = {},
				len = arguments.length;
			for(var i = 0; i < len; i++)
				for(p in arguments[i])
					if(arguments[i].hasOwnProperty(p))
						ret[p] = arguments[i][p];
			return ret;
		};
		this.getUserInfo	= function(user,name,callback,req,res){
			Change.findOne({},{},{sort:{_id:-1}},function(e,c){if(e) return res.send(e);
			User.findOne(name?{username:user.toLowerCase()}:{_id:user}, function(e,u){if(e) return res.send(e);if(u==null) return res.send(e);
			Post.find({user:u._id}, function(e,p) { if(e) return res.send(e);
			Post.find({"ratings":{$elemMatch:{field:"user",value:u._id}}}, function(e, uv){ if(e) return res.send(e);
			Graphene.getFollowing(u._id, null, function(uf){
			Graphene.getFollowing(req.session.user?req.session.user:'bypass',null,function(yf){
			User.find({_id:{$in:uf}}, function(e,fu){if(e) return res.send(e);
				var feeds = u.feeds;
				for(var i = 0; i < feeds.length; i++)
					for(var j = 0; j < feeds[i].users.length; j++){
						var id = feeds[i].users[j];
						for(var k = 0; k < fu.length; k++)
							if(""+fu[k]._id == id){
								feeds[i].users[j] = {
									_id			: id,
									userName	: fu[k].userName,
									firstName	: fu[k].firstName,
									lastName	: fu[k].lastName,
									name		: fu[k].nameHandle ? fu[k].userName : fu[k].firstName + " " + fu[k].lastName,
									avatar		: Graphene.img + "/" + fu[k].avatar + "/" + fu[k].avatarHash + "-36.jpg",
									avatarFull	: Graphene.img + "/" + fu[k].avatar + "/" + fu[k].avatarHash + "-200.jpg",
									toCrop		: Graphene.img + "/" + fu[k].avatar + "/500.jpg",
									url			: Graphene.url + "/user/" + fu[k].userName,
								}
								break;
							}
					}
				var follows = [];
				for(var k = 0; k < fu.length; k++)
					follows[k] = {
						_id			: id,
						userName	: fu[k].userName,
						firstName	: fu[k].firstName,
						lastName	: fu[k].lastName,
						name		: fu[k].nameHandle ? fu[k].userName : fu[k].firstName + " " + fu[k].lastName,
						avatar		: Graphene.img + "/" + fu[k].avatar + "/" + fu[k].avatarHash + "-36.jpg",
						avatarFull	: Graphene.img + "/" + fu[k].avatar + "/" + fu[k].avatarHash + "-200.jpg",
						toCrop		: Graphene.img + "/" + fu[k].avatar + "/500.jpg",
						url			: Graphene.url + "/user/" + fu[k].userName,
					}
				u.password = "";
				callback(JSON.stringify(Graphene.collect(u._doc,{
					user		: user,
					name		: u.nameHandle ? u.userName : u.firstName + " " + u.lastName,
					avatar		: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-36.jpg",
					avatarFull	: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-200.jpg",
					toCrop		: Graphene.img + "/" + u.avatar + "/500.jpg",
					url			: Graphene.url + "/user/" + u.userName,
					version		: c.version,
					sVersion	: Graphene.v,
					postCount	: p.length,
					upvoteCount	: uv.length,
					follows		: follows,
					joined		: u._id.getTimestamp().getTime()
				},(req.session.user
					? {following : !!~yf.indexOf(""+u._id)}
					: {following : !1}
				))));
			});
			});
			});
			});
			});
			});
			});
		};
		this.getFollowing	= function(user,feed,callback){
			if(user == 'bypass') return callback([]);
			User.findOne({_id:user},function(e,u){
				if(e) return;
				if(typeof feed == 'string') {
					var feeds	= u.feeds,
						arr		= [];
					for(var i = 0; i < feeds.length; i++)
						if(feeds[i].name == feed) arr = feeds[i].users
					callback(arr);
				} else {
					var feeds	= u.feeds,
						hash	= {},
						arr		= [];
					for(var i = 0; i < feeds.length; i++)
						for(var j = 0; j < feeds[i].users.length; j++)
							if(hash[feeds[i].users[j]]!==true){
								arr[arr.length] = feeds[i].users[j];
								hash[feeds[i].users[j]] = true;
							}
					arr[arr.length] = user;
					callback(arr);
				}
			});
		};
		this.time	= function(){
			var stamp = new Date(),t;
			return stamp.getFullYear()
				+ "."  + ((t=""+(stamp.getMonth()+1)).length==1?"0"+t:t)
				+ "." + ((t=""+stamp.getDate()).length==1?"0"+t:t)
				+ " " + ((t=""+stamp.getHours()).length==1?"0"+t:t)
				+ "." + ((t=""+stamp.getMinutes()).length==1?"0"+t:t)
				+ "." + ((t=""+stamp.getSeconds()).length==1?"0"+t:t)
				+ " ";
		};
	})(),
	mailer		= nodemailer.createTransport({
		service	: config.mailService,
		auth	: {
			user	: config.mailUser,
			pass	: config.mailPass
		}
	}),
	Notification = new events.EventEmitter();
Notification.setMaxListeners(0)
mongoose.connect('mongodb://' + config.addr.mongo + '/' + config.database);

//	Enable CORS
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin", config.addr.web  + (config.webPort == 80 ? '' : ":" + config.webPort));
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE');
	next();
});


//	Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//	Sessions
app.use(session({
	secret	: config.sessionSecret,
	resave	: false,
	saveUninitialized: true,
	store	: new MongoStore({mongooseConnection: mongoose.connection}),
	cookie	: {
		maxAge	: 31536e6
	}
}));


//	Routes
app.get('/', function(req,res){res.send("Graphene Server API is running.");});
require('./controllers/changelog')(app, Graphene);
require('./controllers/users')(app, Graphene, EmailTemp, mailer);
require('./controllers/posts')(app, Graphene, Notification);
require('./controllers/notes')(app, Graphene, Notification);


//	Get Server Version

ServerChange.findOne({},{},{sort:{_id:-1}},function(e,sc){if(e) return console.log(Graphene.time() + e);
	Graphene.v = sc.version;
	
	//	Listen
	app.listen(config.apiPort, function(){
		var serve = serveStatic(__dirname + '/client', {
			//	'index': ['index.html'],
			//	'extensions' : ['html']
		});
		client.use(serve);
		client.all('*',function(req,res){
			var data = jade.renderFile(req.path == '/login' ? __dirname + '/client/login.jade' : __dirname + '/client/index.jade',{
				cdn	: config.addr.web + (config.webPort == 80 ? '' : ":" + config.webPort),
				api : config.addr.web + ":" + config.apiPort
			});
			res.send(data);
		});
		client.listen(config.webPort, function(){
			if(!dev)
				mailer.sendMail({
					from	: config.email.support,
					to		: config.email.admin,
					subject	: 'Graphene Server API Running',
					text	: 'Graphene Server API Running\n\n'
							+ 'Server Uptime: '
							+ ~~(os.uptime()/36e2) + 'h'
							+ ~~((os.uptime()%36e2)/60) + 'm'
							+ '\nCPU: ' + os.cpus()[0].model
							+ '\nCores: ' + os.cpus().length + ' @ ' + (~~(os.cpus()[0].speed/100)/10) + 'GHz'
							+ '\nMemory: ' + (~~((os.totalmem()/0x40000000)*100)/100) + 'GB',
					html	: EmailTemp({
						content : 'Graphene Server API Running<br><br>'
								+ 'Server Uptime: '
								+ ~~(os.uptime()/36e2) + 'h'
								+ ~~((os.uptime()%36e2)/60) + 'm'
								+ '<br>CPU: ' + os.cpus()[0].model
								+ '<br>Cores: ' + os.cpus().length + ' @ ' + (~~(os.cpus()[0].speed/100)/10) + 'GHz'
								+ '<br>Memory: ' + (~~((os.totalmem()/0x40000000)*100)/100) + 'GB',
						url		: config.addr.web + ":" + config.webPort
					})
				},function(e,i){
					if(e) console.log(Graphene.time() + e);
				});
			console.log(Graphene.time() + "Graphene server is now running.");
			console.log(Graphene.time() + "    CDN: " + config.addr.web + ":" + config.webPort);
			console.log(Graphene.time() + "    API: " + config.addr.web + ":" + config.apiPort);
		});
	});
});