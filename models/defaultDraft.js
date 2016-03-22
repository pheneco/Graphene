/*
 *	Graphene >> Drafts Model
 *	Written by Trevor J Hoglund
 *	Mar 22, 2016
 */

var mongoose	= require('mongoose'),
	draftSchema	= new mongoose.Schema({
		user		: String,
		plainText	: String,
		lastEdit	: Number
	});
var DefaultDraft= mongoose.model('DefaultDraftDraft', draftSchema, 'defaultDrafts');
module.exports	= DefaultDraft;