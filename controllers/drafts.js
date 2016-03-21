/*
 *	Graphene >> Drafts Routes
 *	Written by Trevor J Hoglund
 *	Mar 21, 2016
 */
 
module.exports = function(app, Graphene){
	var User	= require('../models/user'),
		Draft	= require('../models/draft');
	
	//	Routes
	app.get('/drafts',function(req,res){
		Draft.find({user:req.session.user},null,{sort:{date:-1}},function(e,d){
			var drafts = [];
			for(var i = 0; i < d.length; d++)
				drafts[i]	= {
					name	: d[i].name,
					text	: d[i].plainText,
					date	: d[i].lastEdit
				};
			res.send(drafts);
		});
	});
	app.get('/draft/:id',function(req,res){
		//	Get a single draft based on id
	});
	app.post('/drafts/new',function(req,res){
		var draft	= new Draft({
			user		: req.session.user,
			name		: req.body.name,
			plainText	: req.body.text,
			lastEdit	: +(new Date())
		});
		draft.save(function(e){
			if(e) res.send(e);
			else res.send();
		});
	});
}