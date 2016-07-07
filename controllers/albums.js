/*
 *	Graphene >> Album Routes
 *	Written by Trevor J Hoglund
 *	2016.07.07
 */
 
module.exports = function(app, Graphene){
	var User			= require('../models/user'),
		Album			= require('../models/album'),
		config			= require('../config.json'),
		fs				= require('fs'),
		sharp			= require('sharp'),
		multer			= require('multer'),
		upload			= multer({dest:'/tmp/'}),
		autoReap		= require('multer-autoreap');
	function getPostedAlbum(req,res,savior){
		Album.findOne({user:req.session.user,name:'Posts'},function(e,a){
			if(!a) Album.create({
				user		: req.session.user,
				name		: 'Posts',
				plainText	: "System created album for storing user&apos;s posted images.",
				richText	: "System created album for storing user&apos;s posted images."
			},function(e,aa){ if(e) return res.send(e);
				savior(aa);
			});
			else savior(a);
		});
	}
	
	//	Info
	app.get('/album/:id',function(req,res){
		Album.findOne({_id:req.params.id},function(e,a){
			var album = {
				id			: a._id,
				user		: a.user,
				name		: a.name,
				plainText	: a.plainText,
				richText	: a.richText,
				images		: []
			}
			for(var i = 0; i < a.images.length; i++) album.images[a.images.length - i - 1] = {
				plainText	: a.images[i].plainText,
				richText	: a.images[i].richText,
				original	: Graphene.img + '/' + a._id + '/' + a.images[i]._id + '/original.' + a.images[i].ext,
				1280		: Graphene.img + '/' + a._id + '/' + a.images[i]._id + '/1280.' + a.images[i].ext,
				500			: Graphene.img + '/' + a._id + '/' + a.images[i]._id + '/500.' + a.images[i].ext
			}
			res.send(album);
		});
	});
	
	//	Upload
	app.post('/upload/img',upload.single('image'),autoReap,function(req,res){
		var savior = function(album){
			if(!req.file){
				console.log("NO IMAGES SENT");
				return res.send("Must send image");
			}
			fs.readFile(req.file.path, function(e,i){ if(e) return res.send(e);
			album.images.push({
				ext	: req.file.mimetype.split('/')[1],
				plainText : 'An Image',
				richText  : 'An Image'
			});
			album.save(function(e,album){
				var newim	= album.images[album.images.length-1],
					path	= Graphene.imgDir + '/' + album._id + '/' + newim._id + '/original.' + newim.ext;
				fs.mkdir(Graphene.imgDir + '/' + album._id,function(e){
				if(e && e.code !== 'EEXIST') return res.send(e);
				fs.mkdir(Graphene.imgDir + '/' + album._id + '/' + newim._id,function(e){
				if(e && e.code !== 'EEXIST') return res.send(e);
				fs.writeFile(path,i,function(e){ if(e) return res.send(e);
					sharp(path).resize(1280,null).toFile(Graphene.imgDir + '/' + album._id + '/' + newim._id + '/1280.' + newim.ext,function(e,i){
					sharp(path).resize(500,null).toFile(Graphene.imgDir + '/' + album._id + '/' + newim._id + '/500.' + newim.ext,function(e,i){
						res.send({
							original	: Graphene.img + '/' + album._id + '/' + newim._id + '/original.' + newim.ext,
							1280		: Graphene.img + '/' + album._id + '/' + newim._id + '/1280.' + newim.ext,
							500			: Graphene.img + '/' + album._id + '/' + newim._id + '/500.' + newim.ext
						});
					});
					});
				});
				});
				});
			});
			});
		};
		getPostedAlbum(req,res,savior);
	});
	app.post('/upload/webm',upload.single('webm'),autoReap,function(req,res){
		var savior = function(album){
			if(!req.file) return res.send("Must send image");
			fs.readFile(req.file.path, function(e,i){ if(e) return res.send(e);
				album.images.push({
					ext	: 'webm',
					plainText : 'A WebM Video',
					richText  : 'A WebM Video'
				});
				album.save(function(e,album){
					var newim	= album.images[album.images.length-1],
						path	= Graphene.imgDir + '/' + album._id + '/' + newim._id + '/original.' + newim.ext;
					fs.mkdir(Graphene.imgDir + '/' + album._id,function(e){
						if(e && e.code !== 'EEXIST') return res.send(e);
					fs.mkdir(Graphene.imgDir + '/' + album._id + '/' + newim._id,function(e){
						if(e && e.code !== 'EEXIST') return res.send(e);
					fs.writeFile(path,i,function(e){ if(e) return res.send(e);
						res.send({
							original	: Graphene.img + '/' + album._id + '/' + newim._id + '/original.' + newim.ext
						});
					});
					});
					});
				});
			});
		};
		getPostedAlbum(req,res,savior);
	});
}