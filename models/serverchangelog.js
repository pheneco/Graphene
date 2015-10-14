/*
 *	Graphene >> Server Changelog Model
 *	Written by Trewbot
 *	Jan 18, 2015
 */

var mongoose = require('mongoose'),
	changeSchema = new mongoose.Schema({
		version		: String,
		date		: String,
		description	: String
	}),
	Change = mongoose.model('ServerChange', changeSchema, 'serverChanges');
module.exports = Change;