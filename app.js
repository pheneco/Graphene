/*
 *	Graphene Server s0.5.0
 *	Written by Trevor J Hoglund
 *	2017.01.21
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
	pug			= require('pug'),
	events		= require('events'),
	tumblr		= require('tumblr.js').createClient({
		consumer_key	: config.tumblrAPI.consumerKey,
		consumer_secret	: config.tumblrAPI.consumerSecret,
		token			: config.tumblrAPI.token,
		token_secret	: config.tumblrAPI.tokenSecret
	}),
	User		= require('./models/user'),
	Feed		= require('./models/feed'),
	Post		= require('./models/post'),
	Note		= require('./models/notification'),
	ServerChange= require('./models/serverchangelog'),
	Change		= require('./models/changelog'),
	EmailSrc	= fs.readFileSync('templates/email.hbs', "utf8"),
	EmailTemp	= Handlebars.compile(EmailSrc),
	dev			= !(typeof process.argv[2] == 'undefined' || process.argv[2] != 'dev'),
	Graphene	= new(function(){
		this.sub			= config.sub;
		this.url			= config.addr.web + ':' + config.webPort;
		this.api			= config.addr.web + ':' + config.apiPort;
		this.img			= config.addr.img;
		this.imgDir			= config.imgDir;
		this.aud			= config.addr.aud;
		this.audDir			= config.audDir;
		this.dev			= dev;
		this.hashtagRegExp	= new RegExp([
			'#([\\w',																								//	Word Characters
			'\ud83c\udf00-\udfff\ud83d\udc00-\ude4f\ud83d\ude80-\udeff\u2600-\u26ff',								//	Emoji
			'\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B',	//	Japanese
			']+)'],'g');																							//	End
		this.hashtagRegExp2	= new RegExp([
			'(\\s+|^|\\>)#([\\w',																					//	Word Characters
			'\ud83c\udf00-\udfff\ud83d\udc00-\ude4f\ud83d\ude80-\udeff\u2600-\u26ff',								//	Emoji
			'\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B',	//	Japanese
			']+)'],'gm');																							//	End
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
		this.abbrUserInfo	= (u)=>{
			return {
				_id			: u._id,
				userName	: u.userName,
				literalName	: u.name,
				name		: u.name,
				background	: Graphene.img + "/" + u.background + "/1280.jpg",
				avatar		: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-36.jpg",
				avatarFull	: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-200.jpg",
				toCrop		: Graphene.img + "/" + u.avatar + "/500.jpg",
				url			: Graphene.url + "/user/" + u.userName,
			}
		}
		this.getUserInfo	= function(user,name,callback,q,s){
			Change.findOne(			{},{},{sort:{_id:-1}},							(e,c)=>{	if(e) return s.send(e);
			User.findOne(			name?{username:user.toLowerCase()}:{_id:user},	(e,u)=>{	if(e) return s.send(e);
			Post.find(				{user:u._id},									(e,p)=>{	if(e) return s.send(e);
			Post.find(				{"ratings.user":u._id},							(e,uv)=>{	if(e) return s.send(e);
			Graphene.getFollowing(	u._id, null,									(uf)=>{
			Graphene.getFollowing(	q.session.user ? q.session.user : 'bypass',null,(yf)=>{
			User.find(				{_id:{$in:uf}},									(e,fu)=>{
				if(e) return s.send(e);
				var feeds = u.feeds;
				for(var i = 0; i < feeds.length; i++)
					for(var j = 0; j < feeds[i].users.length; j++)
						for(var k = 0; k < fu.length; k++)
							if(""+fu[k]._id == feeds[i].users[j]){
								feeds[i].users[j] = Graphene.abbrUserInfo(fu[k]);
								break;
							}
				var follows = [];
				for(var k = 0; k < fu.length; k++)
					follows[k] = Graphene.abbrUserInfo(fu[k]);
				u.password = "";
				callback(JSON.stringify(Graphene.collect(
					u._doc,
					Graphene.abbrUserInfo(u),
					{
						user		: u._id,
						version		: c.version,
						sVersion	: Graphene.v,
						postCount	: p.length,
						favoriteCount: uv.length,
						follows		: follows,
						joined		: u._id.getTimestamp().getTime(),
						following	: q.session.user ? !!~yf.indexOf(""+u._id) : !1
					}
				)));
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
		this.time			= function(){
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
mongoose.connect(`mongodb://`+(config.mongo.user==""?``:`${config.mongo.user}:${config.mongo.pass}@`)+`${config.mongo.addr}:${config.mongo.port}/${config.database}`);

//	Enable CORS
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin", req.headers.origin);
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
require('./controllers/drafts')(app, Graphene);
require('./controllers/albums')(app, Graphene);


//	Get Server Version

ServerChange.findOne({},{},{sort:{_id:-1}},function(e,sc){if(e) return console.log(Graphene.time() + e);
	Graphene.v = sc.version;

	//	Listen
	app.listen(config.apiPort, function(){
		var serve = serveStatic(__dirname + '/client', {});
		client.use(serve);
		client.get('/player',function(req,res){
			res.send('<style>*{margin:0;padding:0;}</style><video style="background:black;width:100%;height:100%;" controls src="' + req.query.src + '">');
		});
		client.all('*',function(req,res){
			tumblr.blogPosts('trewbot.tumblr.com',{type:'photo',filter:'raw'},function(err,p){
				var data = pug.renderFile(
					req.path == '/register'
						? __dirname + '/client/register.pug'
						: __dirname + '/client/index.pug',
					{
						localLibraries : config.localLibraries,
						api : config.apiPort,
						img	: p ? p.posts[~~(Math.random()*p.posts.length)].photos[0].original_size.url : '../assets/img/regbg/jpg'
					}
				);
				res.send(data);
			});
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
			console.log(Graphene.time() + "    CDN: " + config.webPort);
			console.log(Graphene.time() + "    API: " + config.apiPort);
			if(Graphene.dev){
				console.log(Graphene.time() + "\x1b[31m\x1b[1mGraphene is running in dev mode.\x1b[39m\x1b[0m");
				console.log(Graphene.time() + "\x1b[31m\x1b[1mAll new users will default to permission level 10 (developer).\x1b[39m\x1b[0m");
				console.log(Graphene.time() + "\x1b[31m\x1b[1mEmails will not be sent for verification.\x1b[39m\x1b[0m");
			}
		});
	});
});
