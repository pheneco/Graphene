/*
 *	Graphene >> Changelog Routes
 *	Written by Trewbot
 *	Mar 22, 2015
 */

module.exports	= function(app,Graphene){
	var mongoose	= require('mongoose'),
		Change		= require('../models/changelog'),
		ServerChange= require('../models/serverchangelog'),
		User		= require('../models/user'),
		events		= require('events'),
		Changelog	= new events.EventEmitter();
	Changelog.setMaxListeners(0);
	app.get('/changes/stream/:cv', function(req,res){
		req.socket.setTimeout(31536e6);
		res.writeHead(200, {
			'Content-Type'	: 'text/event-stream',
			'Cache-Control'	: 'no-cache',
			'Connection'	: 'keep-alive'
		});
		var call	= function(date, version) {
			res.write("data: " + JSON.stringify({
				d	: date,
				v	: version
			}) + "\n\n");
		}
		Changelog.on('change',call);
		res.write("\n");
		req.on('close', function(){
			Changelog.removeListener('change',call);
		});
		Change.findOne({},{},{sort:{_id:-1}},function(e,c){if(e) return false;
			if(c.version == req.params.cv) call(c.date,c.version);
		});
	});
	app.get('/changes/:app?', function(req,res){
		if(!req.params.app || req.params.app == 'webClient') return Change.find().sort('_id').exec(function(e,c){
			if(!e) return res.send(c);
			else return console.log(Graphene.time() + e);
		});
		if(req.params.app == 'server') return ServerChange.find().sort('_id').exec(function(e,c){
			if(!e) return res.send(c);
			else return console.log(Graphene.time() + e);
		});
	});
	app.post('/change/:app?', function(req,res){
		User.findOne({"_id": req.session.user}, function(e,u){
			if(e) return console.log(Graphene.time() + 'Error finding user from session user id: ' + req.session.user);
			if(u.rank < 10) return res.send("Only cool kids can post changes");
			var o = {
				version		: req.body.version,
				date		: req.body.date,
				description : req.body.description.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
			}, c = req.params.app == 'server' ? new ServerChange(o) : new Change(o);
			c.save(function(e){
				if(e) return res.send("Error saving change.");
				console.log(Graphene.time() + u.userName + " (" + u._id + ") posted change " + req.body.version);
				if(req.params.app == 'webClient') Changelog.emit('change', req.body.date, req.body.version);
				if(req.params.app == 'server') console.log(Graphene.time() + "Restart server to update.");
				res.send("");
			});
		});
	})
}