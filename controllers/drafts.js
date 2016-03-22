/*
 *	Graphene >> Drafts Routes
 *	Written by Trevor J Hoglund
 *	Mar 22, 2016
 */
 
module.exports = function(app, Graphene){
	var User	= require('../models/user'),
		Draft	= require('../models/draft');
	
	//	Routes
	app.get('/drafts',function(req,res){
		Draft.find({user:req.session.user},function(e,d){
			var drafts = [];
			for(var i = 0; i < d.length; i++)
				drafts[i]	= {
					id		: d[i]._id,
					name	: d[i].name,
					text	: d[i].plainText,
					date	: d[i].lastEdit
				};
			res.send(drafts);
		});
	});
	app.get('/draft/:id',function(req,res){
		Draft.findOne({_id:req.params.id},function(e,d){if(e)return res.send(e);
			res.send({
				id		: d._id,
				name	: d.name,
				text	: d.plainText,
				date	: d.lastEdit
			});
		});
	});
	app.post('/drafts/new',function(req,res){
		if(!req.session.user) return res.send("Must be logged in to save drafts");
		User.findOne({_id:req.session.user}, function(e,u){
			var draft	= new Draft({
				user		: req.session.user,
				name		: req.body.name,
				plainText	: req.body.text,
				lastEdit	: +(new Date())
			});
			draft.save(function(e,d){
				if(e) return res.send(e);
				console.log(Graphene.time() + u.userName + " (" + u._id + ") saved draft " + d._id + ".");
				res.send();
			});
		});
	});
}