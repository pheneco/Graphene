/*
 *	Graphene >> User Model
 *	Written by Trewbot
 *	Oct 25, 2015
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
		advanced	: [Advanced],
		bio			: String
	});
	userSchema.index({
		username	: 'text',
		firstName	: 'text',
		lastName	: 'text',
		bio			: 'text'
	},{
		name		: 'userIndex',
		weights		: {
			username	: 10,
			firstName	: 4,
			lastName	: 8,
			bio			: 4
		}
	});
var User		= mongoose.model('User', userSchema, 'users');
module.exports	= User;