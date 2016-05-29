/*
 *	Graphene >> Group Model
 *	Written by Trevor J Hoglund
 *	May 25, 2016
 */
 
var mongoose	= require('mongoose'),
	groupSchema	= new mongoose.Schema({
		name		: String,
		plainText	: String,
		richText	: String,
		avatar		: String,
		avatarHash	: String,
		owner		: String,
		users		: [String],
		admins		: [String]
	}),
	Group		= mongoose.model('Group', groupSchema, 'groups');
module.exports	= Group;