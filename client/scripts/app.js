/*
 *	Graphene Web Client w0.5.0
 *	Written by Trevor J Hoglund
 *	2016.06.27
 */

   (function bippity(){
		window._c = function(c){return document.getElementsByClassName(c);}
		window._h = function(i){return Handlebars.compile(_i(i+'-template').innerHTML)};
		window._i = function(i){return document.getElementById(i);}
    })();
    function boppity(){
		Element.prototype._c = function(c){return this.getElementsByClassName(c);}
		Element.prototype.fitContent = function(){
			var l = ['change','cut','paste','drop','keydown'];
			for(var i in l) this.addEventListener(l[i], resize.bind(this), !1);
		}
		HTMLTextAreaElement.prototype.insertAtCaret = function(text){
			text = text || '';
			if(document.selection){
				this.focus();
				var sel		= document.selection.createRange();
				sel.text	= text;
			}else if(this.selectionStart || this.selectionStart === 0){
				var start	= this.selectionStart,
					end		= this.selectionEnd;
				this.value = this.value.substring(0, start) + text + this.value.substring(end, this.value.length);
				this.selectionStart = start + text.length;
				this.selectionEnd = start + text.length;
			}else this.value += text;
		};
		Handlebars.registerHelper('ifCond', function(u,s,v,o){
			return eval(u + s + v) ? o.fn(this) : o.inverse(this);
		});
		Handlebars.registerHelper('strCompare', function(u,v,o){
			return u == v ? o.fn(this) : o.inverse(this);
		});
		SC.initialize({
			client_id	: '19ae8fa1aae0ba94bf94e017aa5651de'
		});
		String.prototype.isEmail = function(){return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(this);}
		window.ajax = function(url, type, header, ops){
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
		window.greenText = function(){
			var p = document.getElementsByTagName('p');
			for(i in p)
				if(p[i].textContent&&p[i].textContent[0]==">")
					p[i].style.color = "green";
		}
		window.pageview = function(ctx){
			ga('set', {
				page	: ctx.path,
				title	: _g.page
			});
			ga('send', 'pageview');
			window.setTimeout(_g.b.update,500);
		}
		window.resize = function(){
			window.setTimeout((function(){
				var t = this,
					c = t.cloneNode();
				t.parentNode.insertBefore(c, t);
				c.style.height = 'auto';
				c.value = t.value;
				t.style.height = (c.scrollTop + c.scrollHeight + 20) + 'px';
				t.parentNode.removeChild(c);
			}).bind(this), 0);
		}
		window.scrollToPos = function(){
			// Arguments: positions to, time, incremements 
			var idst = (dist = arguments[0] - (cpos = document.documentElement.scrollTop || scrollY)) / (inum = (time = arguments[1] || 500) / (inc = arguments[2] || 10)),i=-1;
			window.scrollBy(0, dist % inum);
			while((++i)<inum) setTimeout(function(){window.scrollBy(0, idst)}, i * inc);
		}
		window.twttr = (function(d, s, id){
			var t,
				js,
				fjs = d.getElementsByTagName(s)[0];
			if(d.getElementById(id)) return;
			js 		= d.createElement(s);
			js.id 	= id;
			js.src 	= "https://platform.twitter.com/widgets.js";
			fjs.parentNode.insertBefore(js, fjs);
			return window.twttr || (t = {
				_e : [],
				ready : function(f){
					t._e.push(f)
				}
			});
		}(document, "script", "twitter-wjs"));
		//	This is the thing that does everything important
		window.addEventListener('load', function(){
		new ajax(_g.api + "/session", "GET", "", {
			change	: function(r){
				if(r.target.status !== 200) {
					if(_g.b.error) return;
					_g.b.error						= !0;
					var le							= _i('loading');
					_i('loading-bar').id			= 'loading-error-bar';
					_i('loading-error-bar').style.width	= "100%";
					_i('loading-error').innerHTML	= "Error " + r.target.status + " " + r.target.statusText;
					le.style.opacity				= '1';
					le.style.display				= '';
					document.body.style.overflow	= 'hidden';
				};
			},
			load	: function(r){
				_g.session = JSON.parse(r.responseText);
				_g.v		= _g.session.version;
				_g.user		= _g.session.user;
				_g.lvl		= _g.session.rank;
				_g.t.update(_g.session.accent);
				// var lnk = document.getElementsByTagName('link');
				// lnk[lnk.length-1].href = '/assets/img/fav.php?c=' + _g.session.accent.replace('#','');
				_g.t.search();
				if(_g.session.user) _g.n.open();
				page();
				_g.cn.recheck(_g.session.v);
				_g.n.check();
				window.addEventListener('scroll', function(){
					var cf = _c('column-fix');
					for(var i = 0; i < cf.length; i++)
						cf[i].style.top = ((document.documentElement.scrollTop) ? document.documentElement.scrollTop : scrollY) + "px";
					if((_g.p.loaded && _g.p.needLoad && !_g.p.loading && _g.p.loadMore) && (((document.documentElement.scrollTop) ? document.documentElement.scrollTop : scrollY) > (document.body.scrollHeight - 600 - window.innerHeight))){
						_g.b.toLoad = 0;
						_g.p.list(20);
					}
				});
				window.addEventListener('mousemove',_g.u.hovercard);
			}
		});
		});
    }

	_g		= (Graphene 	= new(function(url,api,name){
		this.url	= url;
		this.api	= api;
		this.name	= name;
		this.temps	= {};
		this.time	= function(unix){
			var ago = ~~(+new Date / 1e3) - (unix / 1e3),
				num = {1:'',60:' second',3600:' minute',86400:' hour',2678400:' day'},
				k	= Object.keys(num),
				s;
			for(var i in num)
				if(ago < +i) return ago > 0 ? (s = ~~(ago / k[k.indexOf(""+i)-1])) + num[i] + (s != 1 ? 's' : '') : 'Right Now!';
			var stamp = new Date(+unix);
			return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][stamp.getMonth()] + ' ' + stamp.getDate() + ', ' + stamp.getFullYear();
		};
		this.toggle = function(el){
			var tv = el.getAttribute("toggled");
			el.innerHTML = tv == 'true' ? el.getAttribute("off") : el.getAttribute("on");
			el.setAttribute("toggled", tv == 'true' ? 'false' : 'true');
		}
		setInterval(function(){
			var ts = _c('timestamp');
			for(var i = 0; i < ts.length; i++)
				if(!isNaN(parseInt(ts[i].getAttribute('unix-time')))) ts[i].innerHTML = Graphene.time(ts[i].getAttribute('unix-time'));
		}, 1e3);
	})(url,api,name));boppity();
	_g.a	= (_g.audio		= {	//	Reservation (module)
		
	});
	_g.b	= (_g.bar		= {
		toLoad : 0,
		loaded : 0,
		error  : !1,
		update : function(){
			if(this.error) return;
			if(!this.toLoad) this.toLoad = 1, this.loaded = 1;
			var sl	= _i('side-loading'),
				lb	= _i('loading-bar'),
				le	= _i('loading'),
				lr	= this.loaded / this.toLoad;
			sl.style.height		= Math.min(lr,1) * 100 + "%";
			lb.style.width		= Math.min(lr,1) * 100 + "%";
			sl.style.display	= (lr >= 1) ? 'none' : 'block';
			if(lr >= 1){
				window.setTimeout(function(){
					_i('loading').style.opacity = '0';
					window.setTimeout(function(){
						document.getElementsByTagName('html')[0].style.overflowY = 'scroll'
						_i('loading').style.display = 'none'
					}, 310);
					document.body.style.overflow = '';
				}, 2500);
			} else if(le.style.display !== 'none'){
				document.getElementsByTagName('html')[0].style.overflowY = 'auto'
				document.body.style.overflow = 'hidden';
			}
		},
		fix		: function(){
			if(!_g.b.error) return;
			_g.b.error = !1;
			_i('loading-error-bar').id = 'loading-bar';
			_i('loading-error').innerHTML = "";
		}
	});
	_g.c	= (_g.comments	= {
		posting : !1,
		loading : !1,
		visible : [],
		streams : {},
		load	: function(id, after, amount){
			if(this.loading) return;
			this.loading = !0;
			var post = _i('post-' + id),
				cmts = post._c('comment'),
				last = (cmts.length > 1 && !after) ? cmts[0].getAttribute('comment-id') : 'default';
			new ajax(_g.api + '/post/' + id + '/comments', 'POST', JSON.stringify({
				start	: last,
				amount	: amount,
				before	: !after
			}), {
				type	: 'application/json',
				load	: function(r){
					var ret = JSON.parse(r.response);
					for(var i in ret)
						ret[i].owner = ret[i].user.id == _g.session.user,
						ret[i].post = id,
						ret[i].timestamp = _g.time(ret[i].time);
					if(after)
						for(var i = ret.length - 1; i >= 0; i--)
							cmts[cmts.length - 1].insertAdjacentHTML('beforebegin', Handlebars.partials.comment(ret[i]));
					else
						for(var i in ret)
							cmts[0].insertAdjacentHTML('beforebegin', Handlebars.partials.comment(ret[i]));
					_g.c.loading = !1;
					post._c('comment-more')[0].style.display = (post._c('comment').length-1 == (+post._c('comment-num')[0].innerHTML)) ? 'none' : 'block';
					twemoji.parse(document.body);
				}
			});
		},
		key		: function(e,id){
			if(e.keyCode == 13) _g.c.post(id);
		},
		post	: function(id){
			if(this.posting) return;
			this.posting = !0;
			new ajax(_g.api + '/post/' + id + '/comment', 'POST', JSON.stringify({
				text	: _i("comment-content-" + id).value
			}), {
				type	: 'application/json',
				load	: function(r){
					// _g.c.load(id, !0, 1);
					window.setTimeout(function(){_g.c.posting = !1;},5e3);
					_i("comment-content-" + id).value = '';
				}
			});
		}, 
		delete	: function(post,comment){
			new ajax(_g.api + '/post/' + post + '/comment/' + comment, 'DELETE', '', {});
		},
		handle	: function(e){
			var i = JSON.parse(e.data),
				e = _i('post-'+i.id),
				c = e._c('comment'),
				l = [],
				x;
			e._c('comment-num')[0].innerHTML = i.count;
			for(var j = 0; j < c.length - 1; j++) l[l.length] = c[j].getAttribute('comment-id');
			//	remove client elements not recognized by server
			for(var k = 0; k < l.length; k++) if(!~i.list.indexOf(l[k])) _i('comment-' + l[k]).remove();
			//	load any new comments
			if((x = i.list.length - 1 - i.list.indexOf(l[l.length-1])) > 0) _g.c.load(i.id,!0,x);
		},
		toggle	: function(id, focus){
			var cpp = _i('post-' + id),
				ccr = cpp._c('post-comments')[0];
			if(ccr.style.display == 'none'){
				ccr.style.display = 'block';
				cpp._c('post')[0].className += ' post-active';
				if(typeof focus !== 'boolean' || focus) window.setTimeout(function(){ccr._c('comment-textbox')[0].focus();}, 0);
			} else {
				ccr.style.display = 'none';
				cpp._c('post post-active')[0].className = 'post';
				cpp._c('post post-expanded post-active')[0].className = 'post post-expanded';
			}
		}
	});
	_g.ca	= (_g.calendar	= {
		
	});
	_g.cl	= (_g.color		= {	//	Reservation (library)
		
	});
	_g.cn	= (_g.changes	= {
		stream	: {},
		load	: function(ctx,next){
			document.title = _g.page = "Changes | " + _g.name;
			var app = typeof ctx.params.app == 'string' ? ctx.params.app : 'webClient',
				post = _i('changes');
			if(post == null){
				post = document.createElement('div');
				post.id = "changes";
				cont = _i('body');
				cont.appendChild(post);
			}
			post.innerHTML = _g.temps.post({
				user	: {
					name	: "Changes",
					url		: "",
					avatar	: "",
				},
				time	: "Loading...",
				url		: "",
				all		: !0,
				blankPost : !0
			});
			_g.b.toLoad = 3;
			_g.b.loaded = 0;
			_g.b.update();
			if(app.split(".")[0] == "_g"){
				var lib		= app.split(".")[1],
					list	= lib == "menu"
								? _g.m.changes
								:(lib == "crop"
									? _g.x.changes
									: (lib == "popup"
										? _g.pu.changes
										: []));
					_i('changes')._c('post-time')[0].innerHTML = list[list.length-1][0];
					_i('changes')._c('post-content')[0].outerHTML = '<div class="post-inputs"><table id="changelog"></table></div>';
					var tb = _i("changelog"),tr,td;
					for(var i = 0; i < list.length; i++){
						tr = tb.insertRow();
						tr.insertCell().innerHTML = list[i][0];
						tr.insertCell().innerHTML = list[i][2];
						_g.b.loaded = 3;
						_g.b.update();
					}
			} else new ajax(_g.api + "/changes/" + app, "GET", "", {
				change : function(){
					_g.b.loaded++;
					_g.b.update();
				},
				load : function(r){
					var cl = JSON.parse(r.responseText);
					_i('changes')._c('post-time')[0].innerHTML = cl[cl.length - 1].version;
					_i('changes')._c('post-content')[0].outerHTML = '<div class="post-inputs"><table id="changelog"></table></div>';
					var tb = _i("changelog"),tr,td;
					for(var i in cl){
						tr = tb.insertRow();
						tr.insertCell().innerHTML = cl[i].version;
						tr.insertCell().innerHTML = cl[i].description;
					}
					if(_g.lvl < 10) return;
					post = _i('change');
					if(post == null){
						post = document.createElement('div');
						post.id = "change";
						cont = _i('body');
						cont.appendChild(post);
					}
					post.innerHTML = _g.temps.post({
						user	: _g.session,
						time	: "New Change",
						url		: "",
						all		: !0,
						blankPost : !0
					});
					var v1 = cl[cl.length - 1].version.split('.'),
						v2 = v1[0] + "." + v1[1] + "." + v1[2] + ".";
					for(var i = 0; i < 4 - (parseInt(v1[3]) + 1).toString().length; i++) v2 += "0";
						v2 += (parseInt(v1[3]) + 1);
					var d1 = new Date(),
						d2 = (d1.getMonth() + 1) + "/" + d1.getDate() + "/" + d1.getFullYear();
					post._c('post-content')[0].outerHTML = _g.temps.change({
						app		: app,
						version : v2,
						date	: d2
					});
					post._c('post-inputs')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.cn.save(\'' + app + '\')">Save</div></div>');
					scrollToPos(document.documentElement.scrollHeight);
				}
			});
			next();
		},
		save	: function(app){
			new ajax(_g.api + '/change/' + app, 'POST', JSON.stringify({
				version		: _i('change-v').value,
				date		: _i('change-d').value,
				description	: _i('change-ds').value
			}), {
				type : 'application/json',
				load : function(r){
					if(r.responseText !== '')
						_g.pu.open({
							title			: "Error!",
							text			: r.responseText,
							titleColor		: "#ff2727",
							titleTextColor	: "#fff"
						});
					page('/changes/' + app);
				}
			});
		},
		recheck	: function(v){
			if(typeof(EventSource) !== "undefined"){
				_g.cn.stream = new EventSource(_g.api + "/changes/stream/" + _g.v,{withCredentials:true});
				_g.cn.stream.onmessage = function(e){
					var dat = JSON.parse(e.data);
					if(_g.v == dat.v)
						return !1;
					_g.cn.stream.close();
					if(!_i('version')) body.insertAdjacentHTML('afterend', '<div id="version"></div>');
					_i('version').innerHTML = 'Your Graphene version (<i>' + _g.v + '</i>) is out of date. Please <a href="javascript:location.reload();void(0);">reload</a> to update to <a href="' + _g.url + '/changes"><i>' + dat.v + '<i></a>.';
					_g.cn.recheck(dat.v);
				};
			}
		}
	});
	_g.cr	= (_g.creator	= {
		images			: [],
		imageLayout 	: [],
		audioElement	: '',
		audio			: '',
		posting			: !1,
		load			: function(){
			if(!_i('body')) document.body.insertAdjacentHTML('beforeend', '<div id="body"></div>');
			var post = _i('post-new');
			if(post == null){
				post = document.createElement('div');
				post.className = "post-increment";
				post.id = "post-new";
				cont = _i('body');
				cont.insertBefore(post, cont.children[0]);
			}
			_g.session.id = _g.session._id;
			post.innerHTML = _g.temps.post({
				user	: _g.session,
				time	: "Right Now!",
				all		: !0,
				blankPost : !0,
				menu	: !0
			});
			post.setAttribute('post-type', 'text');
			post._c('post-content')[0].innerHTML = _g.temps.creator({url:_g.url});
			post._c('post-content')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.cr.post()">Post</div></div>');
			post.insertAdjacentHTML('afterbegin', '<div class="post-shade"></div>');
			post.style.display = 'block';
			post.style.opacity = '1';
			_i('post-textbox-1').fitContent();
			post._c('post-menu')[0].onclick = post.oncontextmenu = function(e){
				e.preventDefault();
				_g.m.open(e, {
					"Save as Draft" : "_g.cr.drafts.save()",
					"Open Draft"	: "_g.cr.drafts.list()",
					Schedule		: "",
					"Markdown Help"	: ""
				})
			};
			new ajax(_g.api + '/drafts/default', 'GET', '', {load : function(r){
				var draft	= JSON.parse(r.responseText),
					tb		= _i('post-new')._c('post-textbox')[0];
				tb.value	= draft.text;
				resize.bind(tb)();
			}});
			/*
			_i('post-new-image').onchange = this.drop;
			_i('post-new-audio').onchange = this.drop;
			*/
			post.addEventListener('dragover', this.dragover);
			post.addEventListener('drop', this.drop);
			return !0;
		},
		renderImages	: function(){	//	deprecated
			var img, pr
				cre	= _i('post-new'),
				pm	= cre._c('post-mediabox')[0];
			pm.innerHTML = '<div></div>';
			for(var i in this.imageLayout){
				pr = document.createElement('div');
				pr.className = 'post-images-' + this.imageLayout[i].length;
				pm.appendChild(pr);
				for(var j = 0; j < this.imageLayout[i].length; j++){
					img = document.createElement('img');
					img.src = this.images[this.imageLayout[i][j]];
					img.imgId = this.imageLayout[i][j];
					img.oncontextmenu = function(e){
						e.preventDefault();
						_g.m.open(e, {
							Remove : "_g.cr.remove(" + this.imgId + ")",
							"Move Up" : "",
							"Move Down" : ""
						})
					};
					pr.appendChild(img);
				}
			}
		},
		renderLink		: function(){	//	deprecated
			var cre = _i('post-new'),
				pm = cre._c('post-mediabox')[0];
			if(cre.getAttribute('post-type') == 'text'){
				cre.setAttribute('post-type', 'link');
				cre._c('post-medias')[0].style.display = 'none';
				pr = document.createElement('input');
				pr.className = 'post-link';
				pr.placeholder = 'http://www.example.com/';
				pm.appendChild(pr);
				window.setTimeout(pr.focus(), 0);
			}
		},
		dragover		: function(e){	//	deprecated
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
		},
		drop			: function(e){
			var f	= (typeof e.dataTransfer !== 'undefined') ? e.dataTransfer.files[0] : this.files[0],
				d	= new FormData();
			if(!/\/(jpe?g|png|gif)$/i.test(f.type)) return !1;
			if(typeof e.dataTransfer !== 'undefined') e.preventDefault();
			var r = new XMLHttpRequest();
			if(r.upload && f.size <= 6e6){
				r.withCredentials = !0;
				r.open("POST", _g.api + '/upload/img', !0);
				d.append('image',f);
				r.send(d);
				r.onload = function(){
					console.log(r);
					var urls = JSON.parse(r.response);
					_i('post-new')._c('post-textbox')[0].insertAtCaret('![](' + urls[1280] + ')\n');
				}
			}
		},
		remove			: function(id){	//	deprecated
			this.images.splice(id, 1);
			for(var i in this.imageLayout){
				for(var j in this.imageLayout[i]){
					if(this.imageLayout[i][j] == id) this.imageLayout[i].splice(j, 1), j--;
					if(this.imageLayout[i][j] > id) this.imageLayout[i][j]--;
				}
				if(this.imageLayout[i].length == 0) this.imageLayout.splice(i, 1), i--;
			}
			if(this.imageLayout.length == 0){
				var cre	= _('post-new'),
					pm	= cre._c('post-mediabox')[0];
				cre.setAttribute('post-type', 'text');
				pm.innerHTML = '';
			} else this.renderImages();
		},
		post 			: function(){
			if(this.posting) return;
			this.posting = !0;
			if(typeof this.audioElement === 'object') this.audioElement.close();
			this.audioElement = '';
			var cre		= _i('post-new'),
				type	= cre.getAttribute('post-type'),
				shade	= cre._c('post-shade')[0],
				text	= cre._c('post-textbox')[0].value.replace(/\r\n|\r|\n/g, "\n");
			shade.style.display = 'block';
			cre.style.opacity = '0.5';
			new ajax(_g.api + '/post', 'POST', JSON.stringify({
				set		: 'dash',
				type	: type,
				text	: text,
				content	: type == 'image' ? {
					layout	: this.imageLayout,
					images	: this.images
				} : type == 'audio' ? this.audio : type == 'link' ? cre._c('post-link')[0].value : ''
			}), {
				type	: 'application/json',
				load	: function(r){
					if(r.responseText !== '')
						_g.pu.open({
							title			: 'Error!',
							text			: r.responseText,
							titleColor		: '#ff2727',
							titleTextColor	: '#fff'
						});
					_g.cr.posting = !1;
					_g.cr.load();
				}
			})
		},
		drafts			: {
			list		: function(){
				new ajax(_g.api + '/drafts', 'GET', '', {load : function(r){
					var drafts = JSON.parse(r.responseText);
					_g.pu.open({
						title	: "Open Draft",
						text	: '<table class="draft-list"></table><div class="popup-button inactive">Open</div>',
						width	: "500px"
					});
					var tb = _c("draft-list")[0],tr,td;
					for(var i = 0; i < drafts.length; i++){
						tr = tb.insertRow();
						tr.setAttribute('draftId',drafts[i].id);
						tr.setAttribute('tabindex','-1');
						tr.onfocus = function(){
							var btn = _i('popup-content')._c('popup-button')[0];
							btn.className = 'popup-button';
							btn.setAttribute('onmousedown','_g.cr.drafts.open("' + this.getAttribute('draftId') + '")');
						};
						tr.onblur = function(){
							var btn = _i('popup-content')._c('popup-button')[0];
							btn.className = 'popup-button inactive';
							btn.setAttribute('onmousedown','');
						};
						tr.oncontextmenu = function(e){
							e.preventDefault();
							_g.m.open(e,{
								Delete	: "_g.cr.drafts.delete('" + this.getAttribute('draftId') + "')",
								Rename	: ""
							});
						}
						tr.insertCell().innerHTML = drafts[i].name;
						tr.insertCell().innerHTML = '<span class="timestamp" unix-time="' + drafts[i].date + '">' + _g.time(drafts[i].date) + '</span>';
					}
				}});
			},
			open		: function(id){
				_i('popup-shade').remove();
				new ajax(_g.api + '/draft/' + id, 'GET', '', {load : function(r){
					var draft	= JSON.parse(r.responseText),
						tb		= _i('post-new')._c('post-textbox')[0];
					tb.value	= draft.text;
					resize.bind(tb)();
				}});
			},
			save		: function(){
				new ajax(_g.api + '/drafts/new', 'POST', JSON.stringify({
					name : prompt(),
					text : _i('post-new')._c('post-textbox')[0].value
				}), {
					type : 'application/json',
					load : function(){}
				});
			},
			delete		: function(id){
				new ajax(_g.api + '/draft/' + id, 'DELETE', '', {load : function(r){
					_i('popup-shade').remove();
					_g.cr.drafts.list();
				}});
			}
		}
	});
	_g.ct	= (_g.chat		= {	//	Reservation (module)
		
	});
	_g.d	= (_g.data		= {	//	Reservation (module)
		
	});
	_g.de	= (_g.ide		= {	//	Reservation (module)
		
	});
	_g.e	= (_g.editor	= {
		
	});
	_g.g	= (_g.groups	= {
		loaded	: !1,
		info	: {},
		current	: '',
		name	: '',
		page	: function(){},
		list	: function(){},
		load	: function(){},
		join	: function(){},
		leave	: function(){}
	});
	_g.m	= (_g.menu		= {	//	Reservation (library)
		
	});
	_g.n	= (_g.notes		= {
		amount	: 0,
		opened	: !1,
		stream	: {},
		info	: {},
		check	: function(){
			if(!_g.user) return false;
			_g.n.load();
			if(typeof(EventSource) !== "undefined")
				(_g.n.stream = new EventSource(_g.api + '/notes/stream',{withCredentials:true})).onmessage = _g.n.onmsg;
			/* else
				setInterval(function(){
					new ajax(_g.api + '/notes/count', 'GET', '', {load : function(r){
						if(+r.responseText > _g.n.amount){
							_i("notification_sound").play();
							_g.n.amount = +r.responseText;
							_g.n.update();
						}
					}});
				});
			*/
		},
		onmsg	: function(e){
			_i("notification_sound").play();
			_g.n.amount = +e.data;
			_g.n.load();
		},
		update	: function(){
			if(_g.n.amount < 0) _g.n.amount = 0;
			//	_i('side-notes').innerHTML = _g.n.amount;
			//	_i('side-notes').style.display = _g.n.amount == 0 ? 'none' : 'block';
			_g.n.opened ? _i('notes-num').innerHTML = _g.n.amount : null;
		},
		open	: function(){
			if(!_g.n.opened){
				if(!_i('info-column')){
					var nw = document.createElement('div');
					nw.className = 'column thin right';
					pcn = _i('body');
					pcn.insertBefore(nw, pcn.children[0]);
					nw.innerHTML = '<div id="info-column" class="column-fix"></div>';
				}
				_i('info-column').innerHTML += '<div id="notes"><div class="notes-title">Notifications (<span id="notes-num">' + _g.n.amount + '</span> unread)</div><div id="notes-notes"></div></div>';
				// _i('side-notes').style.display = 'none';
				_g.n.opened = !0;
				_g.n.load();
			}
		},
		load	: function(){
			new ajax(_g.api + '/notes', 'GET', '', {load : function(r){
				var info = _g.n.info = JSON.parse(r.responseText);
				_g.n.amount = 0;
				for(var i = 0; i < info.length; i++){
					info[i].names		= info[i].users[0].name + (info[i].users.length == 1
								? ""
								: info[i].users.length == 2
									? " and " + info[i].users[1].name
									: ", " + info[i].users[1].name + ", and " + info[i].users.length == 3
										? info[i].users[2].name
										: (info[i].users.length - 2) + "others") + "",
					info[i].timestamp	= _g.time(info[i].time);
					info[i].link		= _g.url + (info[i].type == 'comment' || info[i].type == 'rating' || info[i].type == 'attag' ? "/post/" + info[i].post._id : info[i].user.url);
					if(!info[i].read) _g.n.amount++;
				}
				_g.n.update();
				if(_g.n.opened){
					if(info.length == 0) _i('notes-notes').innerHTML = '<i>You have no notifications</i>';
					else _i('notes-notes').innerHTML = _g.tp.notes({
						notes	: info
					});
				}
			}});
		},
		read	: function(ids){
			new ajax(_g.api + '/notes/'+ids+'/read', 'POST', '', {
				load	: function(r){
					_g.n.load();
				}
			});
		},
		delete	: function(ids){
			new ajax(_g.api + '/notes/'+ids, 'DELETE', '', {
				load	: function(r){
					_g.n.load();
				}
			});
		}
	});
	_g.p	= (_g.posts		= {
		set			: '',
		setData		: '',
		loadMore	: !0,
		loading		: !1,
		needLoad	: !0,
		loaded		: !1,
		loadNew		: !0,
		voting		: !1,
		updateTime	: !0,
		lbOpen		: !1,
		lbBack		: _g.url,
		audio		: [],
		requests	: {},
		info		: {},
		posts		: [],
		cache		: [],
		list 		: function(amount){
			this.loaded = this.loading = !0;
			if(!_i('posts')) _i('body').insertAdjacentHTML('beforeend', '<div id="posts"></div>');
			var last	= _i('posts').children[_i('posts').children.length - 1],
				lastId	= (last == void 0 || last.id == 'post-new') ? 'default' : last.id.split('-')[1];
			if(lastId !== '0'){
				new ajax(_g.api + '/posts?set=' + this.set + '&amount=' + amount + '&data=' + this.setData + '&start=' + lastId, 'GET', '', {
					load : function(r){
						if(last == void 0)
							_i("posts").innerHTML = "<div id='_post'></div>";
						var pls		= JSON.parse(r.responseText);
						this.posts	= this.posts.concat(pls);
						_g.b.toLoad += pls.length * 3;
						_g.b.loaded = 0;
						for(var i = 0; i < pls.length; i++) this.load(pls[i], 'all', 'a');
						this.loading = !1;
						if(last == void 0) _i("_post").remove();
						_g.p.listen();
					}.bind(this)
				});
			} else this.needLoad = !1;
		},
		load 		: function(id, parts, ba){
			if(id == 'last'){
				if(parts == 'all'){
					_g.b.loaded += 3;
					_g.b.update();
				}
				_i('posts').insertAdjacentHTML('beforeend', '<div class="post" id="post-0">This is the end.</div>');
				return;
			}
			if(id == 'only'){
				if(parts == 'all'){
					_g.b.loaded += 3;
					_g.b.update();
				}
				if(_i('post-0') == null) _i('posts').insertAdjacentHTML('beforeend', '<div class="post" id="post-0">There is nothing here.</div>');
				return;
			}
			var post = _i('post-' + id);
			if(post == null){
				post = document.createElement('div');
				post.className = "post-increment";
				post.id = "post-" + id;
				post.postId = id;
				posts = _i('posts');
				posts.insertBefore(post, posts.children[(ba == 'a') ? posts.children.length : 0]);
			}
			if(parts == 'all') post.innerHTML = _g.temps.post({
				user	: {
					name	: "Loading...",
					url		: "",
					avatar	: "",
				},
				time	: "Loading...",
				url		: "",
				all		: !0,
				blankPost : !0
			});
			new ajax(_g.api + '/post/' + id, 'GET', '', {load:function(r){
				var info  = JSON.parse(r.responseText);
				_g.p.info[id] = info;
				info.all		= parts == 'all';
				info[parts]		= !0;
				info.linkPost	= info.type == 'link';
				info.you		= _g.session;
				info.timestamp	= _g.time(info.time);
				info.loadMore	= info.commentCount > 5 ? 'block' : 'none';
				info.menu		= !0;
				info.enlarge	= ~info.richText.indexOf('<div class="post-video"') && window.innerWidth > 1340;
				for(var i in info.commentList)
					info.commentList[i].owner = info.commentList[i].user.id == _g.session.user,
					info.commentList[i].post = id,
					info.commentList[i].timestamp = _g.time(info.commentList[i].time);
				var template	= _g.temps.post(info);
				if(info.all){
					post.innerHTML = template;
					post._c('post-menu')[0].postId = id;
					post._c('post-menu')[0].onclick = post.oncontextmenu = function(e){
						e.preventDefault();
						var post = this.postId,
							info = _g.p.info[post];
						_g.m.open(e, {
							Comment		: "_g.c.toggle('" + post + "');",
							Delete		: info.editable ? "_g.p.delete('" + post + "');" : "",
							"Unfollow Post"	: ~info.followers.indexOf(_g.session.user) ? "_g.p.unfollow('" + post + "');" : "",
							Edit		: "" //info.editable ? "_g.e.open('" + post + "');" : ""
						})
					};
				}
				else post.getElementsByClassName('post-' + parts)[0].innerHTML = template;
				if((info.all || info.body) && info.soundcloudLink) SC.oEmbed(info.link, {
					maxheight		: 166,
					color			: _g.t.accent.split('#')[1],
					auto_play		: !1,
					show_comments	: !1
				}, function(oEmbed){
					post._c('post-desc')[0].insertAdjacentHTML('beforebegin',"<div class=\"post-embed\">" + oEmbed.html + "</div>");
				});
				if((info.all || info.body) && _g.p.set == 'post')
					document.title = _g.page = info.preview + " | " + _g.name;
				if(info.all && _g.p.set == 'post')
					_g.c.toggle(id);
				Prism.highlightAll();
				twttr.widgets.load();
				twemoji.parse(document.body);
				greenText();
				if(_g.session.advanced[0].hoverColors){
					var a = document.getElementsByTagName('a');
					for(var i in a)
						if(a && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(a[i].innerHTML)){
							a[i].addEventListener('mouseover',function(){
								_g.t.update(this.innerHTML);
							});
							a[i].addEventListener('mouseout',function(){
								_g.t.update(_g.session.accent);
							});
						}
				}
			}}).onreadystatechange = function(){
				_g.b.loaded++;
				_g.b.update();
			};
		},
		delete		: function(id){
			if(!confirm("Are you sure you want to delete this post?")) return !1;
			new ajax(_g.api + '/post/' + id, 'DELETE', '', {
				load	: function(r){
					_g.p.remove(id);
				}
			});
		},
		remove		: function(id){
			var a	= _i("post-" + id),
				b	= a.getBoundingClientRect(),
				t;
			if(((t = document.documentElement.scrollTop) ? t : scrollY) > a.offsetTop)
				window.scrollBy(0, -b.height);
			a.remove();
		},
		unfollow	: function(id){
			
		},
		listen		: function(){ 
			if(!_g.session.advanced[0].eventStream) return !1;
			(_g.p.stream = new EventSource(_g.api + '/posts/listen/' + JSON.stringify(_g.p.posts) + "/" + _g.p.set + "/" + _g.p.setData, {withCredentials:true})).onmessage = function(e){
				var type = JSON.parse(e.data).type;
				if(type == 'comment') _g.c.handle(e);
				if(type == 'post') _g.p.handle(e);
			};
		},
		handle		: function(){
			new ajax(_g.api + '/posts?set=' + _g.p.set + '&amount=' + (_c('post').length * 2) + '&data=' + _g.p.setData + '&start=default', 'GET', '', {
				load : function(r){
					var i = JSON.parse(r.responseText),
						l = _g.p.posts,
						x,n=[],e;
						i.reverse();
						l.reverse();
						//	remove client elements not recognized by server
						for(var k = 0; k < l.length; k++)
							if(!~i.indexOf(l[k])){
								if(e = _i('post-' + l[k])){
									scrollBy(0,-e.scrollHeight);
									e.remove();
								}
								n.push(l[k]);
							};
						
						//	need to remove deleted posts' ids from _g.p.posts
						for(var m = 0; m < n.length; n++) _g.p.posts.splice(_g.p.posts.indexOf(l[k]),1);
						
						//	load any new posts
						if((x = i.length - 1 - i.indexOf(l[l.length-1])) > 0){
							_g.p.posts.push(i[i.length-1]);
							_g.p.load(i[i.length-1],'all','b');
						}
						_g.p.stream.close();
						_g.p.listen();
				}
			});
		},
		enlarge		: function(id){
			var cpp = _i('post-' + id);
			if(cpp._c('post post-active post-expanded').length || cpp._c('post post-expanded').length){
				if(cpp._c('post post-active post-expanded').length)
					cpp._c('post post-active post-expanded')[0].className = 'post post-active';
				else
					cpp._c('post post-expanded')[0].className = 'post';
			} else {
				if(cpp._c('post post-active').length)
					cpp._c('post post-active')[0].className = 'post post-active post-expanded';
				else
					cpp._c('post')[0].className = 'post post-expanded';
			}
		},
		clear		: function(ctx, next){
			var se;
			
			_g.b.fix();

			//	POSTS
			_g.p.set = _g.p.setData = '';
			_g.cr.images = [];
			_g.cr.imageLayout = [];
			if(_g.p.loaded){
				_i('posts').innerHTML = '';
				_g.p.loaded = !1;
			}
			_g.p.posts = [];
			_g.p.needLoad = true;
			
			//	USER PAGES
			if(_g.u.loaded && ctx.path.toLowerCase().indexOf('/user/' + _g.u.name.toLowerCase())){
				//console.log(!ctx.path.toLowerCase().indexOf('/user/' + _g.u.name.toLowerCase()));
				if(se = _i('user')) se.remove();
				_g.u.loaded = !1;
			}
			
			//	HOVERCARDS
			if(_g.u.hovering){
				_g.u.cards[_g.u.card].style.display = 'none';
				_g.u.hovering = !1;
			}
			
			//	STREAMS
			if(typeof _g.p.stream === 'object') _g.p.stream.close();
			
			//	GENERAL ELEMENTS
			var p = [
				'settings',
				'advset',
				'password',
				'feeds',
				'changes',
				'change',
				'post-new',
				'users'
			]
			for(var i in p) if(se = _i(p[i])) se.remove();
			
			_g.s.feedsPg = !1;
			
			//	FIX SIDES
			var cf = _c('column-fix');
			for(var i = 0; i < cf.length; i++)
				cf[i].style.top = 0;
			
			//	MOVING ON
			next();
		}
	});
	_g.pu	= (_g.popup		= {	//	Reservation (library)
		
	});
	_g.rg	= (_g.register	= {
		load	: function(ctx,next){
			_g.b.toLoad = 1;
			_g.b.loaded = 1;
			_g.b.update();
			document.title = _g.page = "Register | " + _g.name;
			if(!_i('body')) document.body.insertAdjacentHTML('beforeend', '<div id="body"></div>');
			var reg			= document.createElement('div');
			reg.id			= "register";
			reg.innerHTML	= _g.temps.post({
				user	: {
					name	: "New User"
				},
				time	: "Register",
				url		: "",
				all		: !0,
				blankPost : !0
			});
			
			reg._c('post-content')[0].innerHTML = _g.temps.reg();
			_i('body').appendChild(reg);
			reg._c('post-content')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.rg.save()">Register</div></div>');	
			next();
		},
		save	: function(){
			new ajax(_g.api + '/user/new', 'POST', JSON.stringify({
				username	: _i('settings-uname').value,
				//firstname	: _i('settings-fname').value,
				//lastname	: _i('settings-lname').value,
				name		: _i('settings-name').value,
				password	: _i('settings-pass').value,
				email		: _i('settings-email').value
			}), {
				type	: 'application/json',
				load	: function(r){
					if(r.responseText !== '1') _g.pu.open({
						title			: "Error!",
						text			: r.responseText,
						titleColor		: "#ff2727",
						titleTextColor	: "#fff"
					});
					else page('/');
				}
			});
		},
		check	: {
			userName	: function(){
				new ajax(_g.api + '/test/userName', 'GET', JSON.stringify({
					username	: _i('settings-uname').value
				}), {
					type	: 'application/json',
					load	: function(r){
						_i('un-taken').style.display = r.responseText == "taken" ? 'inline-block' : 'open';
					}
				});
			},
			email		: function(){
				_i('em-taken').style.display = 'none';
				if(!_i('settings-email').value.isEmail()) return _i('em-false').style.display = 'inline-block';
				_i('em-false').style.display = 'none';
				new ajax(_g.api + '/test/email', 'GET', JSON.stringify({
					username	: _i('settings-email').value
				}), {
					type	: 'application/json',
					load	: function(r){
						_i('em-taken').style.display = r.responseText == "taken" ? 'inline-block' : 'none';
					}
				});
			},
			passwords	: function(){
				_i('ps-nomatch').style.display = _i('settings-pass').value !== _i('settings-pass2').value ? 'inline-block' : 'none';
			}
		},
	});
	_g.s	= (_g.settings	= {
		feedsPg	: !1,
		load	: function(ctx,next){
			_g.b.toLoad = 3;
			_g.b.loaded = 0;
			_g.b.update();
			document.title = _g.page = "Settings | " + _g.name;
			new ajax(_g.api + "/session", "GET", "", {
				change	: function(){
					_g.b.loaded++;
					_g.b.update();
				},
				load	: function(r){
					var sess = _g.session = JSON.parse(r.responseText);
					if(!sess.user) return !1;
					if(!_i('body')) document.body.insertAdjacentHTML('beforeend', '<div id="body"></div>');
					
					var sets		= document.createElement('div');
					sets.id			= "settings";
					sets.innerHTML	= _g.temps.post({
						user	: _g.session,
						time	: "Settings",
						url		: "",
						all		: !0,
						blankPost : !0
					});
					
					sets._c('post-content')[0].innerHTML = _g.temps.sets({
						settings	: [
							{
								name	: "Name",
								input	: [{
									id			: "name",
									placeholder	: "Name",
									value		: sess.literalName
								}]
								/*input	: [
									{
										id			: "fname",
										placeholder	: "First",
										value		: sess.firstName
									},
									{
										id			: "lname",
										placeholder	: "Last",
										value		: sess.lastName
									}
								]*/
							},
							{
								name		: "Display Name",
								id			: "nh",
								toggle		: !0,
								value		: sess.nameHandle,
								//offValue	: sess.firstName + " " + sess.lastName,
								offValue	: sess.literalName,
								onValue		: sess.userName
							},
							{
								name		: "Accent Color",
								id			: "clr",
								color		: sess.accent
							},
							{
								name		: "Theme",
								id			: "theme",
								toggle		: !0,
								value		: _g.session.dark,
								offValue	: "Light Theme",
								onValue		: "Dark Theme"
							}
						],
						save		: '_g.s.save()'
					});
					_i('body').appendChild(sets);
					sets._c('post-content')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.s.save()">Save</div></div><div id="advset-link"><a href="'+_g.url+'/settings/advanced">Advanced Settings</a></div>');
					
					var clr	= new _g.cl.picker(_i('settings-clr'), {
						input	: _i('settings-accent'),
						color	: sess.accent,
						func	: _g.t.update
					});
					_i('settings-theme').addEventListener('click',function(){
						_g.t.dark = (_i('settings-theme').getAttribute('toggled') == "true");
						_g.t.update(_g.t.accent);
					});
					
					var pass		= document.createElement('div');
					pass.id			= "password";
					pass.innerHTML	= _g.temps.post({
						user	: _g.session,
						time	: "Password",
						url		: "",
						all		: !0,
						blankPost : !0
					});
					
					pass._c('post-content')[0].innerHTML = _g.temps.sets({
						settings	: [
							{
								name	: "Old Password",
								input	: [
									{
										id			: "oldPass",
										password	: !0
									}
								]
							},
							{
								name	: "New Password",
								input	: [
									{
										id			: "newPass",
										password	: !0
									}
								]
							},
							{
								name	: "Repeat New Password",
								input	: [
									{
										id			: "newPass2",
										password	: !0
									}
								]
							},
						],
						save		: '_g.s.savePass()'
					});
					_i('body').appendChild(pass);
					pass._c('post-content')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.s.savePass()">Save</div></div>');
				}
			});
			next();
		},
		advanced: function(ctx,next){
			_g.b.toLoad = 3;
			_g.b.loaded = 0;
			_g.b.update();
			document.title = _g.page = "Advanced Settings | " + _g.name;
			new ajax(_g.api + "/session", "GET", "", {
				change	: function(){
					_g.b.loaded++;
					_g.b.update();
				},
				load	: function(r){
					var sess = _g.session = JSON.parse(r.responseText);
					if(!sess.user) return !1;
					var advset		= document.createElement('div');
					advset.id			= "advset";
					advset.innerHTML	= _g.temps.post({
						user	: _g.session,
						time	: "Advanced Settings",
						url		: "",
						all		: !0,
						blankPost : !0
					});
					
					advset._c('post-content')[0].innerHTML = _g.temps.sets({
						settings	: [
							{
								name		: "Email Notifications",
								id			: "t1",
								toggle		: !0,
								value		: _g.session.advanced[0].emailNotes,
								offValue	: "Off",
								onValue		: "On <div style='color:#ccc;display:inline-block;'>(Default)</div>"
							},
							{
								name		: "Color Previews",
								id			: "t2",
								toggle		: !0,
								value		: _g.session.advanced[0].hoverColors,
								offValue	: "Off <div style='color:#ccc;display:inline-block;'>(Default)</div>",
								onValue		: "On"
							},
							{
								name		: "Event Streams",
								id			: "t3",
								toggle		: !0,
								value		: _g.session.advanced[0].eventStreams,
								offValue	: "Off",
								onValue		: "On <div style='color:#ccc;display:inline-block;'>(Default)</div>"
							}
						],
						save		: 'alert("WIP")'
					});
					_i('body').appendChild(advset);
					advset._c('post-content')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.s.saveAdv()">Save</div></div>');
				}
			});
			next();
		},
		feeds	: function(ctx,next){
			var load = !1;
			_g.b.toLoad = 3;
			_g.b.loaded = 0;
			_g.b.update();
			_g.s.feedsPg = !0;
			document.title = _g.page = "Feeds | " + _g.name;
			if(!_i('feeds')){
				load = !0;
				_i('body').insertAdjacentHTML('beforeend', "<div id='feeds'><div id='post-feed' class='post-feed'>" + _g.temps.post({
					user	: {
						name	: "Loading...",
						url		: "",
						avatar	: "",
					},
					time	: "Loading...",
					url		: "",
					all		: !0,
					blankPost : !0
				}) + "</div></div>");
			}
			new ajax(_g.api + "/session", "GET", "", {
				change	: function(){
					_g.b.loaded++;
					_g.b.update();
				},
				load	: function(r){
					var sess = _g.session = JSON.parse(r.responseText);
					if(!sess.user) return !1;
					var feeds	= _i('feeds'),
						edit	= _i('post-feed');
					edit.innerHTML = _g.temps.post({
						user	: sess,
						time	: "Feeds",
						url		: "",
						all		: !0,
						blankPost : !0
					});
					edit._c('post-content')[0].innerHTML = '';
					for(var i = 0; i < sess.follows.length; i++)
						edit._c('post-content')[0].innerHTML += '<div class="feed-user"><a href="' + sess.follows[i].url + '">' + sess.follows[i].name + '</a></div>';
					if(sess.follows.length == 0) edit._c('post-content')[0].innerHTML = '<i>You are so lonely.</i>';
					for(var i = 0; i < sess.feeds.length; i++)
						_g.s.loadFeed(sess.feeds[i])
					if(load) edit.oncontextmenu = function(e){
						e.preventDefault();
						_g.m.open(e,{
							"Create New Feed":"_g.s.newFeed(prompt('New name:'))"
						})
					};
				}
			});
			next();
		},
		loadFeed: function(info){
			if(!_i('feed-'+info._id)){
				var feed	= document.createElement('div');
				feed.id		= 'feed-'+info._id;
				feed.className = 'post-feed';
				feed.feed	= info._id;
				feed.style.position = 'relative';
				feed.innerHTML = _g.temps.post({
					user	: {
						name	: info.name,
						url		: "",
						avatar	: "",
					},
					time	: "Feed",
					url		: info.url,
					all		: !0,
					blankPost : !0
				});
				feed.innerHTML += "<textarea class='feed-drop' style='position:absolute;top:0px;left:0px;border:0px none;width:100%;height:100%;z-index:5;opacity:0;display:none;'></textarea>";
				_i('feeds').appendChild(feed);
				feed.ondragover = function() {
					this._c('feed-drop')[0].style.display = 'block';}
				feed.ondragout  = function() {
					this._c('feed-drop')[0].style.display = 'none';}
				feed._c('feed-drop')[0].oninput = function() {
					_g.u.followLink(this.value,this.parentElement.feed);
					this.value = '';
				}
				feed.oncontextmenu = function(e){
					e.preventDefault();
					var id  = this.feed;
					_g.m.open(e,{
						Rename	: "_g.s.renameFeed('" + id + "',prompt('New name:'))",
						Delete	: "_g.s.deleteFeed('" + id + "')",
						"Create New Feed"	: "_g.s.newFeed(prompt('New name:'))"
					})
				};
			} else {
				var feed = _i('feed-'+info._id);
				feed._c('feed-drop')[0].style.display = 'none';
			}
			feed._c('post-content')[0].innerHTML = "";
			for(var i = 0; i < info.users.length; i++)
				feed._c('post-content')[0].innerHTML += '<div class="feed-user feed-user-r" title="Unfollow ' + info.users[i].name + '" onclick="_g.u.unfollow(\'' + info.users[i]._id + '\',\'' + info._id + '\')">' + info.users[i].name + '</div>';
			if(info.users.length == 0) feed._c('post-content')[0].innerHTML = '<i>This stream is empty.</i>';
		},
		save	: function(){
			new ajax(_g.api + '/settings', 'POST', JSON.stringify({
				//firstName	: _i('settings-fname').value,
				//lastName	: _i('settings-lname').value,
				name		: _i('settings-name').value,
				nameHandle	: _i('settings-nh').getAttribute('toggled'),
				accent		: _i('settings-accent').value,
				dark		: _i('settings-theme').getAttribute('toggled')
			}), {
				type	: 'application/json',
				load	: function(r){
					if(r.responseText !== '') _g.pu.open({
						title			: "Error!",
						text			: r.responseText,
						titleColor		: "#ff2727",
						titleTextColor	: "#fff"
					});
					else _g.pu.open({
						title			: "Saved",
						text			: "Your settings have been saved.",
						titleColor		: "#62ff62",
						titleTextColor	: "#fff"
					});
				}
			});
		},
		saveAdv	: function(){
			new ajax(_g.api + '/settings/advanced', 'POST', JSON.stringify({
				emailNotes	: _i('settings-t1').getAttribute('toggled'),
				hoverColors	: _i('settings-t2').getAttribute('toggled'),
				eventStream	: _i('settings-t3').getAttribute('toggled'),
			}), {
				type	: 'application/json',
				load	: function(r){
					if(r.responseText !== '') _g.pu.open({
						title			: "Error!",
						text			: r.responseText,
						titleColor		: "#ff2727",
						titleTextColor	: "#fff"
					});
					else _g.pu.open({
						title			: "Saved",
						text			: "Your settings have been saved.",
						titleColor		: "#62ff62",
						titleTextColor	: "#fff"
					});
				}
			});
		},
		savePass: function(){
			new ajax(_g.api + '/password', 'POST', JSON.stringify({
				oldPass		: _i('settings-oldPass').value,
				newPass		: _i('settings-newPass').value,
				newPass2	: _i('settings-newPass2').value
			}), {
				type	: 'application/json',
				load	: function(r){
					if(r.responseText !== '') _g.pu.open({
						title			: "Error!",
						text			: r.responseText,
						titleColor		: "#ff2727",
						titleTextColor	: "#fff"
					});
					else {
						_g.pu.open({
							title			: "Success!",
							text			: "Password changed succesfully!",
							titleColor		: "#62ff62",
							titleTextColor	: "#fff"
						});
						page('/settings');
					}
				}
			});
		},
		newFeed	: function(name){
			new ajax(_g.api + '/feed/new/' + name, 'POST', '', {
				load	: function(r){
					if(r.responseText !== '') _g.pu.open({
						title            : "Error!",
						text            : r.responseText,
						titleColor        : "#ff2727",
						titleTextColor    : "#fff"
					});
					if(_g.s.feedsPg) _g.s.feeds();
				}
			});
		},
		renameFeed: function(feed,name){
			new ajax(_g.api + '/feed/' + feed + '/rename/' + name, 'POST', '', {
				load	: function(r){
					if(r.responseText !== '') _g.pu.open({
						title            : "Error!",
						text            : r.responseText,
						titleColor        : "#ff2727",
						titleTextColor    : "#fff"
					});
					if(_g.s.feedsPg) _g.s.feeds();
				}
			});
		},
		deleteFeed:	function(feed){
			new ajax(_g.api + '/feed/' + feed, 'DELETE', '', {
				load	: function(r){
					if(r.responseText !== '') _g.pu.open({
						title            : "Error!",
						text            : r.responseText,
						titleColor        : "#ff2727",
						titleTextColor    : "#fff"
					});
					if(_g.s.feedsPg){
						_i('feed-'+feed).remove();
						_g.s.feeds();
					}
				}
			});
		}
	});
	_g.t	= (_g.theme		= {	
		menuOpen	: !1,
		accent		: '#333333',
		dark		: !1,
		menu		: function(){
			_i("side").style.left = !(this.menuOpen = !this.menuOpen) ? "-200px" : "0px";
		},
		update		: function(c){
			_g.t.accent = c;
			var s = document.styleSheets[1].cssRules,
				r = ['background','borderTopColor','borderLeftColor','borderRightColor','borderBottomColor','color','','background'],
				l = document.getElementsByTagName('link');
			for(i in r) s[++i].style[r[--i]] = c;
			this.accent = c;
			l[l.length-2].disabled = !_g.t.dark;
			document.getElementsByTagName('style')[1].disabled = true;
			_i('hexagon').style.stroke = _i('brandlogocss').sheet.cssRules[0].style.stroke = _g.t.dark ? "#444444" : "#FFFFFF";
		},
		side		: function(ctx, next){
			new ajax(_g.api + "/session", "GET", "", {load : function(r){
				if(_g.session.user) {
					_g.session = JSON.parse(r.responseText);
					_g.t.dark = _g.session.dark;
					_g.t.update(_g.session.accent);
					var o = {
						sections : [
							{
								name	: "Feeds",
								links	: [
									{
										name	: "Home",
										url		: _g.url,
										active	: ctx.path == "/"
									}
								].concat(_g.session.feeds).concat(
									{
										name	: "Edit Feeds",
										url		: _g.url + "/feeds",
										active	: ctx.path == "/feeds"
									}
								)
							},
							{
								name	: "Account",
								links	: [
									{
										name	: _g.session.userName,
										url		: _g.session.url,
										active	: ctx.path == _g.session.url.split(_g.url)[1]
									},
									{
										tabled	: !0,
										name	: "Posts:",
										value	: _g.session.postCount,
										url		: _g.session.url + "/posts",
										active	: ctx.path == _g.session.url.split(_g.url)[1] + "/posts"
									},
									{
										tabled	: !0,
										name	: "Upvotes:",
										value	: _g.session.upvoteCount,
										url		: _g.session.url + "/upvotes",
										active	: ctx.path == _g.session.url.split(_g.url)[1] + "/upvotes"
									},
									{
										name	: "Settings",
										url		: _g.url + "/settings",
										active	: ctx.path == "/settings"
									},
									{
										name	: "Sign Out",
										url		: _g.url + "/logout"
									}
								]
							}
						]
					};
					for(var i = 1; i < o.sections[0].links.length - 1; i++){
						o.sections[0].links[i].url = _g.url + "/feed/" + o.sections[0].links[i].name;
						o.sections[0].links[i].active = ctx.path == "/feed/" + o.sections[0].links[i].name;
					}
				} else {
					var o = {
						sections : [
							{
								name	: "Sign In",
								url		: _g.url + "/login",
								tooltip	: "Sign In"
							}
						]
					}
				}
				_i('side-content').innerHTML = _g.temps.side(o);
				_i('side-version').innerHTML =	"<a href='http://phene.co'>phene.co, 2016<br></a>" +
												"<a href='" + _g.url + "/changes/webClient' title='Web Client'>" + _g.v + "</a> " +
												"<a href='" + _g.url + "/changes/server' title='Server'>" + _g.session.sVersion + "</a> " +
												"<a title='Color Picker'>c0.1.0.0006</a> " +
												"<a href='" + _g.url + "/changes/_g.crop' title='Crop Tool'>" + _g.x.changes[_g.x.changes.length-1][0] + "</a> " +
												"<a href='" + _g.url + "/changes/_g.popup' title='Popup'>" + _g.pu.changes[_g.pu.changes.length-1][0] + "</a> " +
												"<a href='" + _g.url + "/changes/_g.menu' title='Context Menu'>" + _g.m.changes[_g.m.changes.length-1][0] + "</a>";
				_g.b.toLoad = 0;
				next();
			}});
		},
		search		: function(){
			if(!_i('info-column')){
				var nw = document.createElement('div');
				nw.className = 'column thin right';
				pcn = _i('body');
				pcn.insertBefore(nw, pcn.children[0]);
				nw.innerHTML = '<div id="info-column" class="column-fix"></div>';
			}
			_i('info-column').innerHTML += '<div id="search"><div class="notes-title">Search</div><input placeholder="Search something..." id="search-box"></div>';
			window.setTimeout(function(){
				_i('search-box').onkeypress = function(e){
					if(e.keyCode == 13 && this.value != '') page('/search/' + encodeURIComponent(this.value));
				}
			},0);
		}
	});
	_g.tp	= (_g.temps		= {
		post	: _h('post'),
		side	: _h('sidebar'),
		sets	: _h('settings'),
		reg		: _h('register'),
		creator : _h('creator'),
		change	: _h('change'),
		user	: _h('user'),
		notes	: _h('note')
	});Handlebars.registerPartial('comment', _i('comment-template').innerHTML);
	_g.u	= (_g.users		= {
		loaded	: !1,
		info	: {
			name	: {},
			id		: {}
		},
		current	: '',
		name	: '',
		height	: 0,
		x		: {},
		ranks	: [
			'Guest',
			'Registered User',
			'Activated User',
			'Contributor',
			'Creator',
			'Advanced Creator',
			'Beta Tester',
			'Graphene Contributor',
			'Moderator',
			'Administrator',
			'Developer',
			'God'
		],
		set		: '',
		setData	: '',
		hovering: !1,
		card	: '',
		cardSrc	: {},
		cards	: {},
		cardTime: 0,
		page	: function(user,ctx){
			_g.u.name = user;
			new ajax(_g.api + '/user/' + user, 'GET', '', {
				load	: function(r){
					var info = _g.u.info.name[user.toLowerCase()] = JSON.parse(r.response);
					_g.u.info.id[info._id] = _g.u.info.name[user];
					document.title = _g.page = info.name + " | " + _g.name;
					_g.u.current = info.id = info._id;
					info.rankname = _g.u.ranks[info.rank];
					var utmp = _g.temps.user({
						url		: info.url,
						avat	: info.avatarFull,
						toCrop	: info.toCrop,
						clravat	: info.colorAvatar,
						avatclr	: info.avatarColor,
						name	: info.name,
						bio		: info.bio,
						id		: info.id,
						rankname: info.rankname,
						shwfbtn	: _g.session.user && info.id !== _g.session.user,
						shwedit	: _g.session.user && info.id == _g.session.user,
						shwcrp	: _g.session.avatar !== 'http://img.phene.co/default/0-36.jpg',
						fllwng	: info.following,
						links	: [
							{
								tabled	: !0,
								name	: "Posts:",
								value	: info.postCount,
								url		: info.url + "/posts",
								active	: ctx.path == info.url.split(_g.url)[1] + "/posts"
							},
							{
								tabled	: !0,
								name	: "Upvotes:",
								value	: info.upvoteCount,
								url		: info.url + "/upvotes",
								active	: ctx.path == info.url.split(_g.url)[1] + "/upvotes"
							}
						]
					});
					if(!_i('page-column')){
						var nw = document.createElement('div');
						nw.className = 'column slim left';
						pcn = _i('body');
						pcn.insertBefore(nw, pcn.children[0]);
						nw.innerHTML = '<div id="page-column" class="column-fix"></div>';
					}
					if(!_g.u.loaded) _i('page-column').insertAdjacentHTML('afterbegin',utmp);
					else _i('user').outerHTML = utmp;
					if(_g.session.user && info.id == _g.session.user){
						window.setTimeout(function(){
							_i('user-bio-input').onkeypress = function(e){
								this.innerHTML = this.innerText;
								if(e.keyCode == 13 && this.value != ''){
									e.preventDefault();
									new ajax(_g.api + '/user/bio/set', 'POST', 'bio=' + encodeURIComponent(this.innerText),{
										load	: function(){
											page(window.location.pathname);
										}
									});
								}
							}
						},0);
						var avclr = new _g.cl.picker(_i('settings-avatclr'), {
							input	: _i('settings-avatclr-input'),
							color	: _g.session.avatarColor,
							func	: function(clr){
								var c = _c('color-' + _g.session._id);
								for(var i = 0; i < c.length; i++)
									c[i].style.background = clr;
							}
						});
						_i('settings-clravat').addEventListener('click',function(e){
							var tv = e.target.getAttribute("toggled") == 'true',
								a = _c('avatar-' + _g.session._id),
								c = _c('color-' + _g.session._id);
							for(var i = 0; i < a.length; i++)
								a[i].style.display = !tv ? 'none' : 'block';
							for(var i = 0; i < c.length; i++)
								c[i].style.display = tv ? 'none' : 'block';
							_i('imgavatthing').style.display = !tv ? 'none' : 'block';
							_i('clravatthing').style.display = tv ? 'none' : 'block';
							e.target.innerHTML = tv ? e.target.getAttribute("off") : e.target.getAttribute("on");
							e.target.setAttribute("toggled", tv ? 'false' : 'true');
							new ajax(_g.api + '/user/avatar/color', 'POST', "colorAvatar=" + !tv + "&avatarColor=" + _g.session.avatarCvatar);
						});
						_i('settings-avclr-save').addEventListener('click',function(){
							new ajax(_g.api + '/user/avatar/color', 'POST', "colorAvatar=true&avatarColor=" + _i('settings-avatclr-input').value,{
								load	: function(r){
									if(r.responseText !== '') _g.pu.open({
										title			: "Error!",
										text			: r.responseText,
										titleColor		: "#ff2727",
										titleTextColor	: "#fff"
									});
									else _g.pu.open({
										title			: "Saved",
										text			: "Your settings have been saved.",
										titleColor		: "#62ff62",
										titleTextColor	: "#fff"
									});
								}
							});
						});
					}
					_g.t.dark = info.dark;
					_g.t.update(info.accent);
					_g.u.loaded = !0;
				}
			})
		},
		list	: function(amount){
			if(!_i('users')) _i('body').insertAdjacentHTML('afterbegin', '<div id="users"></div>');
			var last	= _i('users').children[_i('users').children.length - 1],
				lastId	= last == void 0 ? 'default' : last.id.split('-')[1];
			if(lastId !== '0'){
				new ajax(_g.api + '/users?set=' + this.set + '&amount=' + amount + '&data=' + this.setData + '&start=' + lastId, 'GET', '', {
					load : function(r){
						if(last == void 0)
							_i("users").innerHTML = "<div id='_u'></div>";
						var u		= JSON.parse(r.responseText);
						// _g.b.toLoad += u.length * 3;
						// _g.b.loaded = 0;
						for(var i = 0; i < u.length; i++)
							this.load(u[i]);
						if(last == void 0) _i("_u").remove();
					}.bind(this)
				});
			} else this.needLoad = !1;
		},
		load	: function(id){
			if(id == 'last' || id == 'only') return;
			new ajax(_g.api + '/user/' + id + '/byId', 'GET', '', {
				// change	: function(){
					// _g.b.loaded++;
					// _g.b.update();
				// },
				load	: function(r){
					var info = JSON.parse(r.response);
					_g.u.info.id[info.username] = info;
					_g.u.info.id[info._id] = info;
					info.rankname = _g.u.ranks[info.rank];
					var utmp = _g.temps.user({
						card	: !0,
						listed	: !0,
						url		: info.url,
						avat	: info.avatarFull,
						toCrop	: info.toCrop,
						clravat	: info.colorAvatar,
						avatclr	: info.avatarColor,
						name	: info.name,
						bio		: info.bio,
						id		: info._id,
						rankname: info.rankname,
						shwfbtn	: _g.session.user && info._id !== _g.session.user,
						shwedit	: !1,
						shwcrp	: !1,
						fllwng	: info.following
					});
					_i('users').innerHTML += '<div class="user listed">'+utmp+'</div>';
					twemoji.parse(document.body);
				}
			})
		},
		follow	: function(user,feed){
			var load = function(r){
				if(r.responseText !== '') _g.pu.open({
						title : "Error!",
						text : r.responseText,
						titleColor : "#ff2727",
						titleTextColor : "#fff"
					});
				if(_g.u.info.id[user]) new ajax(_g.api + '/user/' + _g.u.info.id[user].username, 'GET', '', {
					load	: function(r){
						if(_g.s.feedsPg) _g.s.feeds();
						var info = _g.u.info.name[_g.u.info.id[user].username] = JSON.parse(r.response);
						_g.u.info.id[user] = _g.u.info.name[_g.u.info.id[user].username];
					}
				});
				if(_g.u.loaded && _g.u.current == user) page(window.location.pathname);
			}
			if(typeof feed == 'undefined')
				new ajax(_g.api + '/user/' + user + '/follow', 'POST', '', {
					load	: load
				});
			else
				new ajax(_g.api + '/feed/' + feed + '/add/' + user, 'POST', '', {
					load	: load
				});
		},
		followLink: function(link,feed){
			var p = link.split(_g.url)[1].split('#')[0].split("/");
			if(!(typeof p[1] === 'string' && p[1].toLowerCase() == 'user' && typeof p[2] === 'string')) return !1;
			new ajax(_g.api + '/user/' + p[2], 'GET', '', {
				load : function(r){
					var info = _g.u.info.name[p[2].toLowerCase()] = JSON.parse(r.response);
					_g.u.info.id[info._id] = _g.u.info.name[p[2].toLowerCase()];
					_g.u.follow(info._id,feed);
				}
			});
		},
		unfollow: function(user,feed){
			var load	= function(r){
				if(_g.s.feedsPg) _g.s.feeds();
				if(_g.u.info.id[user]) new ajax(_g.api + '/user/' + _g.u.info.id[user].username, 'GET', '', {
					load	: function(r){
						var info = _g.u.info.name[_g.u.info.id[user].username] = JSON.parse(r.response);
						_g.u.info.id[user] = _g.u.info.name[_g.u.info.id[user].username];
					}
				});
				if(_g.u.loaded && _g.u.current == user) page(window.location.pathname);
			}
			if(typeof feed == 'undefined')
				new ajax(_g.api + '/user/' + user + '/unfollow', 'POST', '', {
					load	: load
				});
			else
				new ajax(_g.api + '/feed/' + feed + '/remove/' + user, 'POST', '', {
					load	: load
				});
		},
		avatar	: function(){
			if(!_g.u.loaded || !_g.session.user || _g.u.current != _g.session.user) return false;
			var xhr		= new XMLHttpRequest(),
				file	= _i('avatinput').files[0],
				data	= new FormData();
			data.append("avatar", file);
			xhr.onreadystatechange = function(e){
				if(this.readyState==4) page(window.location.pathname);
            };
			xhr.open('POST',_g.api+'/user/avatar/new',true);
			xhr.withCredentials = true;
			xhr.send(data);
		},
		crop	: function(img){
			_g.popup.open({
				title	: "Crop Avatar",
				text	: '<div id="crop-avatar" style="width:500px"></div><div class="popup-button" onclick="_g.u.cropSave()">Save</div>',
				width	: "500px"
			});
			_g.u.x = new _g.x(_i('crop-avatar'), img, 'cut', {
				square:true
			});
		},
		cropSave: function(){
			_i('popup-shade').remove();
			new ajax(_g.api + '/user/avatar/crop/', 'POST', JSON.stringify(_g.u.x.getValues()), {
				type	: 'application/json',
				load	: function(r){
					page(window.location.pathname);
				}
			});
		},
		hovercard: function(e){
			if(_g.u.cardTime) window.clearTimeout(_g.u.cardTime);
			if(_g.u.hovering){
				var a = _g.u.cards[_g.u.card].getBoundingClientRect(),
					b = _g.u.cardSrc.getBoundingClientRect();
				if( e.clientY < b.top
				|| (e.clientY < a.top && (e.clientX < b.left || e.clientX > b.right))
				||  e.clientY > a.bottom
				||  e.clientX < a.left
				||  e.clientX > a.right){
					window.setTimeout(function(){_g.u.cards[_g.u.card].style.display = 'none';},500);
					_g.u.cards[_g.u.card].style.opacity = 0;
					_g.u.hovering = !1;
				}
			} else {
				var a,b;
				if(a = e.target.parentAnchor()){
					if(a.host !== _g.url.split('://')[1] || a.hasAttribute('nocard')) return;
					var c = a.href.split(_g.url)[1].split("/");
					if(c[1].toLowerCase() == 'user' && typeof c[2] == 'string')
						_g.u.cardTime = window.setTimeout(function(){
							_g.u.card = c[2].toLowerCase();
							_g.u.hovering = !0;
							if(_g.u.info.name[_g.u.card]) _g.u.loadCard(e);
							else
								new ajax(_g.api + '/user/' + c[2], 'GET', '', {
									load	: function(r){
										var info = _g.u.info.name[c[2].toLowerCase()] = JSON.parse(r.response);
										_g.u.info.id[info._id] = _g.u.info.name[c[2].toLowerCase()];
										_g.u.loadCard(e);
									}
								});
						},750);
				}
			}
		},
		loadCard: function(e){
			var cards, card, info = _g.u.info.name[_g.u.card];
			if(info._id == null) return _g.u.hovering = !1;
			_g.u.cardSrc = e.target;
			if(!(cards = _i('hovercards')))
				_i('body').insertAdjacentHTML('beforebegin', '<div id="hovercards"></div>'),
				cards = _i('hovercards');
			if(!(card = _g.u.cards[_g.u.card])){
				card = document.createElement('div');
				card.id = 'hovercard-' + _g.u.card;
				card.className = 'hovercard';
				card.innerHTML = '';
				_g.u.cards[_g.u.card] = card;
				cards.insertBefore(card, cards.children[0]);
			}
			info.id = info._id;
			info.rankname = _g.u.ranks[info.rank];
			var cont = _g.temps.user({
				url		: info.url,
				card	: !0,
				avat	: info.avatarFull,
				toCrop	: info.toCrop,
				clravat	: info.colorAvatar,
				avatclr	: info.avatarColor,
				name	: info.name,
				bio		: info.bio,
				id		: info.id,
				rankname: info.rankname,
				shwfbtn	: _g.session.user && info.id !== _g.session.user,
				shwedit	: !1,
				shwcrp	: !1,
				fllwng	: info.following
			});
			card.innerHTML = cont;
			card.style.opacity = 0;
			card.style.display = 'block';
			var a = _g.u.cardSrc.getBoundingClientRect(),
				b = _i('body').getBoundingClientRect(),
				c = card.getBoundingClientRect();
			card.style.top = a.bottom + 'px';
			card.style.left = (a.left + (a.width/2)) - (c.width/2) + 'px';
			card.style.opacity = 1;
		}
	});
	_g.ui	= (_g.interface	= {
		columns	: [
			{
				width		: 'slim',	//	210px
				defaultOfSize : !0,
				contains	: [
					'user'
				]
			},
			{
				width		: 'post',	//	500px
				defaultOfSize : !0,
				center		: !0,
				contains	: [
					'posts'
				]
			},
			{
				width		: 'thin',	//	300px
				defaultOfSize : !0,
				contains	: [
					'search',
					'notes'
				]
			}
		],
		blocks	: []
	});
	_g.x	= (_g.crop		= {	//	Reservation (library)
		
	});
	
	page('*', function(ctx,next){
		//	var lnk = document.getElementsByTagName('link');
		//	lnk[lnk.length-1].href = '/assets/img/fav.php?c=' + _g.session.accent.replace('#','');
		if(_i('post-new'))
			new ajax(_g.api + '/drafts/default', 'POST', JSON.stringify({
				text : _i('post-new')._c('post-textbox')[0].value
			}), {
				type : 'application/json',
				load : function(){}
			});
		next();
	});
	page('*', _g.p.clear);
	page('*', _g.t.side);
	page('/', function(ctx,next){
		if(!_g.user) page.redirect('/login');
		else {
			document.title = _g.page = _g.name;
			_g.p.set = 'dash';
			_g.p.setData = 'home';
			_g.cr.load();
			_g.p.list(20);
		}
		next();
	}, pageview);
	page('/login', function(){
		window.location.replace(_g.url + "/login");
	});
	page('/logout', function(){
		window.location.replace(_g.api + "/logout");
	});
	page('/register', _g.rg.load, pageview),
	page('/feed/:name', function(ctx,next){
		if(!_g.user) page.redirect('/login');
		else {
			document.title = _g.page = ctx.params.name + " | " + _g.name;
			_g.p.set = 'feed';
			_g.p.setData = ctx.params.name;
			_g.p.list(20);
		}
		next();
	}, pageview);
	page('/tag/:tag', function(ctx,next){
		document.title = _g.page = "#" + ctx.params.tag + " | " + _g.name;
		_g.p.set = 'tag';
		_g.p.setData = ctx.params.tag;
		_g.p.list(20);
		next();
	}, pageview);
	page('/search/:query', function(ctx,next){
		document.title = _g.page = "Results for \"" + ctx.params.query + "\" | " + _g.name;
		_g.u.set = 'search';
		_g.u.setData = ctx.params.query;
		_g.u.list();
		
		_g.p.set = 'search';
		_g.p.setData = ctx.params.query;
		_g.p.list(20);
		next();
	}, pageview);
	page('/changes/:app?', _g.cn.load, pageview),
	page('/post/:id', function(ctx,next){
		if(!_i('posts')) _i('body').insertAdjacentHTML('beforeend', '<div id="posts"></div>');
		_g.p.set = 'post';
		_g.p.setData = ctx.params.id;
		_g.p.posts = [ctx.params.id];
		_g.b.toLoad = 4;
		_g.b.loaded = 1;
		_g.b.update();
		_g.p.load(ctx.params.id, 'all');
		_g.p.loaded = true;
		_g.p.listen();
		next();
	}, pageview);
	page('/user/:user', function(ctx,next){
		new ajax(_g.api + '/user/' + ctx.params.user + '/getId', 'GET', '', {load:function(r){
			var user = JSON.parse(r.responseText);
			_g.u.page(ctx.params.user,ctx)
			_g.p.set = 'user';
			_g.p.setData = user;
			if(_g.session.user == user) _g.cr.load();
			_g.p.list(20);
		next();
		}});
	}, pageview);
	page('/user/:user/posts', function(ctx,next){
		new ajax(_g.api + '/user/' + ctx.params.user + '/getId', 'GET', '', {load:function(r){
			var user = JSON.parse(r.responseText);
			_g.u.page(ctx.params.user,ctx)
			_g.p.set = 'userPosts';
			_g.p.setData = user;
			if(_g.session.user == user) _g.cr.load();
			_g.p.list(20);
			next();
		}});
	}, pageview);
	page('/user/:user/upvotes', function(ctx,next){
		new ajax(_g.api + '/user/' + ctx.params.user + '/getId', 'GET', '', {load:function(r){
			var user = JSON.parse(r.responseText);
			_g.u.page(ctx.params.user,ctx)
			_g.p.set = 'userPosts';
			_g.p.setData = user;
			_g.p.list(20);
			next();
		}});
	}, pageview);
	page('/settings', _g.s.load, pageview);
	page('/settings/advanced', _g.s.advanced, pageview);
	page('/feeds', _g.s.feeds, pageview);
	page('*', function(ctx, next){
		_g.b.error						= !0;
		var le							= _i('loading');
		_i('loading-bar').id			= 'loading-error-bar';
		_i('loading-error-bar').style.width	= "100%";
		_i('loading-error').innerHTML	= "Error 404 Not Found";
		le.style.opacity				= '1';
		le.style.display				= '';
		document.body.style.overflow	= 'hidden';
		next();
	}, pageview);