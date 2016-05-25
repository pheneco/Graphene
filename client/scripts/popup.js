/*
 *	Graphene Popup
 *	Written by Trevor J Hoglund
 *	Apr 25, 2016
 */

function _i(i){return document.getElementById(i);}
function _c(c){return document.getElementsByClassName(c);}
Element.prototype._c = function(c){return this.getElementsByClassName(c);}
Element.prototype.parentAnchor = function () {
	var t = this;
	if (t == null)
		return false;
	while (t.tagName.toLowerCase() !== 'html') {
		if (typeof t.href == 'string')
			return t;
		t = t.parentElement;
	}
	return false;
}
ajax = function(url, type, header, ops){
	var r = new XMLHttpRequest(),
	o = ops || {};
	r.open(type, url, !0);
	r.withCredentials = typeof o.cred == 'boolean' ? o.cred : !0;
	r.setRequestHeader("Content-type", o.type || "application/x-www-form-urlencoded");
	r.send(header);
	typeof o.load == 'function' && r.addEventListener('load', function(){o.load(r);});
	typeof o.change == 'function' && (r.onreadystatechange = o.change);
	return r;
}

if(typeof Graphene !== 'object'){
	var Graphene = new(function(){
		this.pop = true;
		this.v = '';
		this.url = 'http://gra.phene.co';
	})(),
		_g = Graphene;
}

var __cms__ = document.createElement("style");
__cms__.innerHTML	 = '#popup {position:relative;width:500px;height:auto;margin:auto;background:#fff;vertical-align:middle;}';
__cms__.innerHTML	+= '#popup-shade {position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1000;display:inline-flex;}';
__cms__.innerHTML	+= '#popup-title {padding:6px;background:#f8f8f8;width:488px;text-align:center;}';
__cms__.innerHTML	+= '#popup-content {padding:10px;}';
__cms__.innerHTML	+= '#popup-confirm {position:relative;width:410px;margin:20px auto auto;}';
__cms__.innerHTML	+= '#popup-yes {background:#444444;margin-right:10px;}';
__cms__.innerHTML	+= '#popup-no {background:#ddd;}';
__cms__.innerHTML	+= '.popup-option {cursor:pointer;padding:8px;width:184px;text-align:center;text-transform:uppercase;color:#FFF;display:inline-block;}';
__cms__.innerHTML	+= '.popup-button {padding:6px;width:200px;background:#444444;color:#fff;margin:auto;margin-top:10px;font-weight:bold;text-align:center;cursor:pointer;}';
__cms__.innerHTML	+= '#lightbox {position:relative;min-width:500px;height:auto;margin:auto;background:#fff;vertical-align:middle;}';
__cms__.innerHTML	+= '#lightbox-shade {position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1000;display:inline-flex;}';
__cms__.innerHTML	+= '#lightbox-view {position:relative;min-width:500px;background:#000;display:inline-flex;min-width:500px;min-height:500px;}';
__cms__.innerHTML	+= '#lightbox-image {margin:auto;vertical-align:middle;display:block;}';
__cms__.innerHTML	+= '#lightbox-comments {width:300px;text-align:top;}';
__cms__.innerHTML	+= '#lightbox-prev {position:absolute;cursor:pointer;z-index:1;height:100%;top:0;right:0;}';
__cms__.innerHTML	+= '#lightbox-next {position:absolute;cursor:pointer;z-index:1;width:150px;height:100%;top:0;left:0;}';
__cms__.innerHTML	+= '#lightbox table {border:0;padding:0;margin:0;}';
__cms__.innerHTML	+= '#lightbox td {border:0;padding:0;}';
document.documentElement.appendChild(__cms__);

_g.pu = (_g.popup = {
	lbOpen		: !1,
	lbBase		: document.URL.split('://')[0] + '://' + document.domain,
	lbBack		: document.URL,
	lbSrc		: '',
	lbLayt		: '',
	lbInfo		: {},
	lbList		: [],
	lbIndx		: 0,
	open		: function(ops){
		var fhtm = '<div id="popup-shade"><div style="' + (typeof ops.width == 'string' ? 'width:' + (parseInt(ops.width) + 20) + 'px;' : '') + '" id="popup">' + (typeof ops.title == 'string' ? '<div id="popup-title" style="' + (typeof ops.titleColor == 'string' ? 'background:' + ops.titleColor + ';' : '') + (typeof ops.titleTextColor == 'string' ? 'color:' + ops.titleTextColor + ';' : '') + (typeof ops.width == 'string' ? 'width:' + (parseInt(ops.width) + 8) + 'px;' : '') + '">' + ops.title + '</div>' : '') + '<div id="popup-content" style="' + (typeof ops.textCenter == 'boolean' && ops.textCenter ? 'text-align:center' : '') + '">' + ops.text + (typeof ops.confirm == 'boolean' && ops.confirm ? '<div id="popup-confirm"><div id="popup-yes" class="popup-option" onclick="' + ops.onyes + 'gra_pu_close();">Yes</div><div id="popup-no" class="popup-option" onclick="gra_pu_close();">No</div></div>' : '') + '</div></div></div>';
		document.body.insertAdjacentHTML('afterbegin', fhtm);
		window.setTimeout(function(){
			window.addEventListener('click', function grapopClick(e){
				if(_i('popup') == null){
					window.removeEventListener('click', grapopClick);
					return;
				}
				var rect = _i('popup').getBoundingClientRect();
				if(e.clientY > rect.bottom || e.clientY < rect.top || e.pageX > rect.right || e.pageX < rect.left){
					_i('popup-shade').remove();
					window.removeEventListener('click', grapopClick);
				}
			});
		}, 0);
	},
	lightbox	: function(type,source,layout,index){
		_g.pu.lbBack = document.URL;
		_g.pu.lbIndx = index;
		_g.pu.lbSrc  = source;
		_g.pu.lbLayt = layout;
		var open = function(){
			layout = layout.split('.');
			for(var i = 0, click = !1, list = _g.pu.lbInfo[source]; i < layout.length; i++){
				if(!click && layout[i] !== '*') list = list[layout[i]];
				else {
					click = !0;
					if(layout[i] == '*'){if(list.length == null) list = Object.keys(list).map(function(k){return list[k]});}
					else for(var j = 0; j < list.length; j++) list[j] = list[j][layout[i]];
				}
			}
			_g.pu.lbList = list;
			if(_g.pu.lbIndx < 0) _g.pu.lbIndx = 0;
			if(_g.pu.lbIndx >= list.length) _g.pu.lbIndx = list.length - 1;
			var img = new Image();
			img.src = _g.pu.lbList[_g.pu.lbIndx];
			img.onload = function(){
				var wh = window.innerHeight,
					ww = window.innerWidth,
					ih = img.height,
					iw = img.width,
					lbw,
					lbh,
					j,
					lbe = _i('lightbox'),
					lbv = _i('lightbox-view');
				
				if(iw > (j = Math.max(500, ww - 100))) lbw = j, lbh = (j / iw) * ih;
				else lbw = iw, lbh = ih;
				
				if(lbh > (j = wh - 100)) lbw = (j / ih) * iw, lbh = j;

				var olbi = _i('lightbox-image');
				if(olbi !== null) olbi.remove();

				if(lbv.style.width == '' || parseInt(lbv.style.width) < lbw) lbv.style.width = lbw + "px";
				if(lbv.style.height == '' || parseInt(lbv.style.height) < lbh) lbv.style.height = lbh + "px";
				_i('lightbox-prev').style.width = parseInt(lbv.style.width) - 150 + "px";
				_i('lightbox-prev').parentAnchor().onclick = function(){_g.pu.lightbox('api',_g.pu.lbSrc,_g.pu.lbLayt,++_g.pu.lbIndx)};
				_i('lightbox-next').parentAnchor().onclick = function(){_g.pu.lightbox('api',_g.pu.lbSrc,_g.pu.lbLayt,--_g.pu.lbIndx)};
				
				var lbm = document.createElement('img');
				lbm.src = img.src;
				lbm.id = 'lightbox-image';
				lbm.style.width = lbw + 'px';
				lbm.style.height = lbh + 'px';
				lbv.insertBefore(lbm, lbv.children[0]);
			}
		};
		
		if(!_g.pu.lbOpen){
			var lb = document.createElement('div');
			lb.id = 'lightbox-shade';
			lb.innerHTML = '<div id="lightbox"><table><tr><td style="font-size:0px;"><div id="lightbox-view"><a lightbox><div id="lightbox-next"></div></a><a lightbox><div id="lightbox-prev"></div></a></div></td>' + /* '<td style="vertical-align:top;"><div id="lightbox-comments"><div class="post-header"><a><img class="post-avatar"></a><div class="post-name"><a><b>Loading...</b></a></div><div class="post-time"><a>Loading...</a></div></div><div class="post-content"><br><br><br><br><br><br></div></div></td>' + */ '</tr></table></div>';
			document.body.insertBefore(lb, document.body.children[0]);
			window.setTimeout(function(){
				window.addEventListener('click', _g.pu.lbClick);
			}, 500);
			_g.pu.lbOpen = !0;
		} else var lb = _i('lightbox-shade');
		
		if(type == 'api'){
			if(typeof _g.pu.lbInfo[source] == 'undefined') new ajax(source, 'GET', '', {cred:false,load:function(res){
				_g.pu.lbInfo[source] = JSON.parse(res.response);
				open();
			}}); else open();
		}
	},
	lbClick : function(e){
		if(_i('lightbox') == null){
			window.removeEventListener('click', _g.pu.lbClick);
			return;
		}
		var rect = _i('lightbox').getBoundingClientRect();
		if(e.clientY > rect.bottom || e.clientY < rect.top || e.pageX > rect.right || e.pageX < rect.left){
			_g.pu.lbOpen = !1;
			_i('lightbox-shade').remove();
			window.removeEventListener('click', _g.pu.lbClick);
		}
	},
	changes	: [
		["v0.1.0.0001","Mar 23, 2015","Moved popup script to separate file."],
		["v0.1.0.0002","Mar 23, 2015","Added lightbox framework."],
		["v0.1.0.0003","Mar 23, 2015","Added lightbox base url."],
		["v0.1.0.0004","Mar 23, 2015","Added lightbox default back URL."],
		["v0.1.0.0005","Mar 23, 2015","Added AJAX to Graphene."],
		["v0.1.0.0006","Mar 23, 2015","Added lightbox parameters."],
		["v0.1.0.0007","Mar 23, 2015","Added lightbox AJAX calling to get lists."],
		["v0.1.0.0008","Mar 24, 2015","Added lightbox layout parsing."],
		["v0.1.0.0009","Mar 24, 2015","Added lightbox opening script."],
		["v0.1.0.0010","Mar 24, 2015","Fixed API calls having credentials set to true."],
		["v0.1.0.0010","Mar 24, 2015","Added lightbox navigation."],
		["v0.1.0.0010","Mar 24, 2015","Fixed _g.pu.lbIndx being below 0."],
		["v0.1.0.0010","Mar 24, 2015","Fixed lightbox navigation direction."],
		["v0.1.0.0011","Mar 24, 2015","Added lightbox closing script."],
		["v0.1.0.0012","May 15, 2015","Changed lightbox naviagtion links' actions to onclick rather than href."],
		["v0.1.0.0012","May 15, 2015","Added lightbox keyboard navigation (a,d,up,down,left,right)."],
		["v0.1.0.0012","May 15, 2015","Fixed lightbox behavior varying between Chrome and Firefox."],
		["v0.1.0.0012","May 15, 2015","Fixed lightbox naviagtion keys not including a preventDefault() clause."],
		["v0.1.0.0013","Nov 14, 2015","Fixed key commands for back."],
		["v0.1.1.0014","Nov 15, 2015","Added styling"],
		["v0.1.1.0015","Dec 22, 2015","Added required functions for standalone"],
		["v0.1.1.0016","Dec 22, 2015","Fixed references to document.body for standalone"],
		["v0.1.1.0017","Dec 22, 2015","Added lightbox styling"],
		["v0.1.1.0018","Dec 31, 2015","Removed extraneous details"],
		["p0.1.1.0019","Apr 25, 2016","Added changelog as array"]
	]
});

window.addEventListener('keyup', function(e){
	if(_g.pu.lbOpen){
		e.preventDefault();
		~[39,40,68].indexOf(e.keyCode) ? _g.pu.lightbox('api',_g.pu.lbSrc,_g.pu.lbLayt,++_g.pu.lbIndx) : ~[37,38,65].indexOf(e.keyCode) ? _g.pu.lightbox('api',_g.pu.lbSrc,_g.pu.lbLayt,--_g.pu.lbIndx) : !1;
	}
});