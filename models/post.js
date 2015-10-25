/*
 *	Graphene >> Post Model
 *	Written by Trewbot
 *	Oct 25, 2015
 */
 
var mongoose	= require('mongoose'),
	Rating		= new mongoose.Schema({
		user		: String,
		downVote	: Boolean
	}),
	Vote		= new mongoose.Schema({
		user		: String,
		vote		: Number
	}),
	Comment		= new mongoose.Schema({
		user		: String,
		richText	: String,
		plainText	: String
	}),
	postSchema	= new mongoose.Schema({
		user		: String,
		at			: String,
		type		: String,
		richText	: String,
		plainText	: String,
		content		: String,
		location	: String,
		tags		: [String],
		users		: [String],
		ratings		: [Rating],
		comments	: [Comment],
		votes		: [Vote],		//For polls
		followers	: [String],
		blockers	: [String]
	});
	postSchema.index({
		plainText	: 'text',
		tags		: 'text',
		users		: 'text'
	},{
		name		: 'postIndex',
		weights		: {
			plainText	: 7,
			tags		: 10,
			users		: 5
		}
	});
var Post		= mongoose.model('Post', postSchema, 'posts');
module.exports	= Post;