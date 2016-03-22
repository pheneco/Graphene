/*
 *	Graphene >> Drafts Routes
 *	Written by Trevor J Hoglund
 *	Mar 22, 2016
 */
 
module.exports = function(app, Graphene){
	var User	= require('../models/user'),
		Draft	= require('../models/draft');
		DefaultDraft = require('../models/defaultDraft');
	
	//	Default
	app.get('/drafts/default',function(req,res){
		DefaultDraft.findOne({user:req.session.user},function(e,d){if(e)return res.send(e);
			res.send(d ? {
				text	: d.plainText,
				date	: d.lastEdit
			} : {
				text	: '',
				date	: 0
			});
		});
	});
	app.post('/drafts/default',function(req,res){
		DefaultDraft.findOne({user:req.session.user},function(e,d){if(e)return res.send(e);
			if(d)
				DefaultDraft.update({user:req.session.user}, {
					plainText	: req.body.text,
					lastEdit	: +(new Date())
				}, {upsert: true}, function(e){
					if(e) res.send(e);
					else res.send();
				});
			else
				(new DefaultDraft({
					user		: req.session.user,
					plainText	: req.body.text,
					lastEdit	: +(new Date())
				})).save(function(e,d){
					if(e) return res.send(e);
					res.send();
				});
		});
	});
	
	//	User Defined
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
	app.delete('/draft/:id',function(req,res){
		if(!req.session.user) return res.send("");
		User.findOne({_id:req.session.user}, function(e,u){if(e) return res.send(e);
		Draft.findOne({_id:req.params.id}, function(e,d){if(e || d == null) return res.send(e);
			if(d.user !== req.session.user) return res.send("You can't delete another user's drafts!");
			Draft.remove({_id:req.params.id}, function(e){if(e) return res.send(e);
				console.log(Graphene.time() + u.userName + " (" + u._id + ") deleted draft " + d._id + ".");
				res.send();
			});
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