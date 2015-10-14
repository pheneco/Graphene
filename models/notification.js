/*
 *	Graphene >> Notification Model
 *	Written by Trewbot
 *	Jul 04, 2015
 */
 
var mongoose	= require('mongoose'),
	noteSchema	= new mongoose.Schema({
		recipient	: String,
		sender		: String,
		type		: String,
		data		: [String],
		read		: Boolean
	}),
	Note		= mongoose.model('Note', noteSchema, 'notes');
module.exports	= Note;