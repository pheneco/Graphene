/*
 *	Graphene >> User Model
 *	Written by Trewbot
 *	Oct 17, 2015
 */

var mongoose	= require('mongoose'),
	Feed		= require('../models/feed'),
	Advanced	= new mongoose.Schema({
		emailNotes	: Boolean,
		hoverColors	: Boolean,
		eventStream	: Boolean
	}),
	userSchema	= new mongoose.Schema({
		userName	: String,
		username	: String,
		firstName	: String,
		lastName	: String,
		email		: String, 
		password	: String,
		activated	: Boolean,
		avatar		: String,
		avatarHash	: String,
		background	: String,
		rank		: Number,
		accent		: String,
		nameHandle	: Boolean,
		feeds		: [Feed],
		advanced	: [Advanced]
	}),
	User		= mongoose.model('User', userSchema, 'users');
module.exports	= User;