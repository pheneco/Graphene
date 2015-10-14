/*
 *	Graphene >> Feed Model
 *	Written by Trewbot
 *	Jul 13, 2015
 */

var mongoose	= require('mongoose'),
	Feed		= new mongoose.Schema({
		name	: String,
		index	: Number,
		color	: String,
		default	: Boolean,
		users	: [String]
	});
module.exports	= Feed;