/*
 *	Graphene >> Changelog Model
 *	Written by Trewbot
 *	Jan 04, 2015
 */

var mongoose = require('mongoose'),
	changeSchema = new mongoose.Schema({
		version		: String,
		date		: String,
		description	: String
	}),
	Change = mongoose.model('Change', changeSchema, 'webClientChanges');
module.exports = Change;