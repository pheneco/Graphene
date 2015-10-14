/*
 *	Graphene >> User Model
 *	Written by Trewbot
 *	Oct 13, 2015
 */

var mongoose	= require('mongoose'),
	Feed		= require('../models/feed'),
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
		feeds		: [Feed]
	}),
	User		= mongoose.model('User', userSchema, 'users');
module.exports	= User;