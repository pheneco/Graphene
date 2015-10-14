/*
 *	Graphene >> Album Model
 *	Written by Trewbot
 *	Oct 12, 2015
 */
 
var mongoose	= require('mongoose'),
	Crop		= new mongoose.Schema({
		top			: Number,
		left		: Number,
		height		: Number,
		width		: Number
	}),
	Image		= new mongoose.Schema({
		ext			: String,
		plainText	: String,
		richText	: String,
		crops		: [Crop]
	}),
	albumSchema	= new mongoose.Schema({
		user		: String,
		name		: String,
		plainText	: String,
		richText	: String,
		images		: [Image]
	}),
	Album		= mongoose.model('Album', albumSchema, 'albums');
module.exports	= Album;