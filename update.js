/*
 *	Graphene Update Commands
 *	Written by Trewbot
 *	Oct 25, 2015
 */

console.log('running update commands');

var User		= require('./models/user'),
	config		= require('./config.json'),
	mongoose	= require('mongoose'),
	fs			= require('fs'),
	marked		= require('marked'),
	nodemailer	= require('nodemailer'),
	Handlebars	= require('handlebars'),
	EmailSrc	= fs.readFileSync('email.html', "utf8"),
	EmailTemp	= Handlebars.compile(EmailSrc),
	plainText	= fs.readFileSync('update.md', "utf8"),
	richText	= marked(plainText)
	mailer		= nodemailer.createTransport({
		service	: config.mailService,
		auth	: {
			user	: config.mailUser,
			pass	: config.mailPass
		}
	}),
	count		= 0;

console.log('connecting to database');
mongoose.connect('mongodb://localhost/' + config.sub + 'phene');

console.log('adding advanced options');
User.find({},function(e,uu){
	if(e) return console.log(e);
	uu.forEach(function(u){
		if(!u) return ++count;
		
		if(!u.bio) u.bio = "<i>No information available.</i>";
		//	dev version
		// u.save(function(){
			// if(++count == uu.length){
				// console.log('finished update commands');
				// process.exit();
			// }
		// });
		
		//	gra version
		mailer.sendMail({
			from	: 'support@phene.co',
			to		: u.email,
			subject	: 'Graphene Update',
			text	: plainText,
			html	: EmailTemp({
				content : richText,
				prefix	: 'gra'
			})
		},function(e,i){
			if(e) console.log(e);
			u.save(function(){
				if(++count == uu.length){
					console.log('finished update commands');
					process.exit();
				}
			});
		});
	});
});