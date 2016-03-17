/*
 *	Graphene >> Drafts Model
 *	Written by Trevor J Hoglund
 *	Mar 17, 2016
 */

var mongoose	= require('mongoose'),
	draftSchema	= new mongoose.Schema({
		user		: String,
		name		: String,
		plainText	: String,
		lastEdit	: Number
	});
var Draft		= mongoose.model('Draft', draftSchema, 'drafts');
module.exports	= Draft;