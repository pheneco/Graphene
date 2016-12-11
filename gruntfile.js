/*
 *	Graphene Gruntfile
 *	Written by Trevor J Hoglund
 *	2016.12.10
 */
 
module.exports = function(grunt){
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		sass : {
			dist : {
				options : {
					outputStyle	: 'compressed'
				},
				files : [{
					expand	: true,
					cwd		: 'styles/',
					src		: ['*.scss'],
					dest	: 'client/assets',
					ext		: '.css'
				}]
			}
		},
		autoprefixer : {
			compile : {
				files : {
					'client/assets/accent.css' : 'client/assets/accent.css',
					'client/assets/material.css' : 'client/assets/material.css'
				}
			}
		},
		// Uglify doesnt support ES6 because ITS ONLY A YEAR AND A HALF OLD
		// uglify : {
			// options : {
				// banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy.mm.dd") %> */',
				// quoteStyle : 0
			// },
			// dynamic_mappings : {
				// files : [{
					// expand	: true,
					// cwd		: 'lib/',
					// src		: ['*.js'],
					// dest	: 'client/assets',
					// ext		: '.min.js'
				// }]
			// }
		// },
		watch : {
			sass : {
				files : ['styles/*.scss'],
				tasks : ['sass','autoprefixer']
			},
			// uglifier : {
				// files : ['lib/*.js'],
				// tasks : ['uglifier']
			// }
		}
	});
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['sass','autoprefixer'/*,'uglify'*/]);
};