/*	
 *	Test JS
 *	Written by Trevor J Hoglund
 *	2016.11.27
 */

window._c	= function(c){return document.getElementsByClassName(c);}
window._i	= function(i){return document.getElementById(i);}
window.addEventListener('load',function(){
	_i('loading-icon').addEventListener('click',function(){
		var form = [
			_c('login-text')[0],
			_c('login-text')[1],
			_c('login-butn')[0],
			_i('login-link')
		];
		for(var i = 0; i < form.length; i++){
			form[i].style.opacity = 0;
			form[i].style.transform = "scale(0.75)";
			form[i].style.transformOrigin = "center";
		}
		var index = (function*(){
			var inx = 0;
			for(;;) yield inx++;
		})();
		function stdStep(){
			var inx = index.next().value;
			form[inx].style.opacity = 1;
			form[inx].style.transform = "scale(1)";
			window.setTimeout(step.next().value,130);
		}
		_i('login-container').style.display = 'block';
		_i('login-container').style.opacity = 1;
		var steps = [
			function(){
				var ldic			= _i('loading-icon');
				ldic.style.width	= "40px";
				ldic.style.height	= "40px";
				ldic.style.left		= "calc(50vw - 20px)";
				ldic.style.top		= "calc(50vh - 155px)";
				window.setTimeout(step.next().value,300);
			},
			stdStep,
			stdStep,
			stdStep,
			stdStep
		];
		var step = (function*(s){
			for(var i = 0; i < s.length; i++) yield s[i];
		})(steps);
		step.next().value();
	});
	_c('login-butn')[0].addEventListener('click',function(){
		var form = [
			_c('login-text')[0],
			_c('login-text')[1],
			_c('login-butn')[0],
			_i('login-link')
		];
		var index = (function*(){
			var inx = 0;
			for(;;) yield inx++;
		})();
		function stdStep(){
			var inx = index.next().value;
			form[inx].style.opacity = 0;
			form[inx].style.transform = "scale(0.75)";
			window.setTimeout(step.next().value,50);
		}
		var steps = [
			stdStep,
			stdStep,
			stdStep,
			stdStep,
			function(){
				var ldic			= _i('loading-icon'),
					ldng			= _i('loading');
				ldic.style.position	= "fixed";
				ldic.style.left		= "10px";
				ldic.style.top		= "50px";
				ldng.style.left		= "-220px";
				ldng.style.top		= "40px";
				ldng.style.width	= "270px";
				ldng.style.height	= "60px";
				window.setTimeout(step.next().value,300);
			},
			function(){
				var ldic			= _i('loading-icon'),
					ldng			= _i('loading');
				ldng.style.display	= "none";
				ldic.style.position	= "absolute";
				ldic.style.left		= "calc(50vw - 125px)";
				ldic.style.top		= "calc(50vh - 125px)";
				ldic.style.width	= "250px";
				ldic.style.height	= "250px";
				ldng.style.left		= "0px";
				ldng.style.top		= "0px";
				ldng.style.width	= "100%";
				ldng.style.height	= "100%";
			},
		],
		step = (function*(s){
			for(var i = 0; i < s.length; i++) yield s[i];
		})(steps);
		step.next().value();
	});
});