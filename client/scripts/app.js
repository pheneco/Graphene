/*
 *	Graphene Web Client w0.4.2
 *	Written by Trewbot
 *	Oct 18, 2015
 */

//	General Functions

	var __cs = {};
	function _i(i){return document.getElementById(i);}
	function _c(c){return document.getElementsByClassName(c);}
	function _h(i){return Handlebars.compile(_i(i+'-template').innerHTML)};
	Element.prototype._c = function(c){return this.getElementsByClassName(c);}
	String.prototype.isEmail = function(){return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(this);}
	function scrollToPos(){
		// Arguments: positions to, time, incremements 
		var idst = (dist = arguments[0] - (cpos = document.documentElement.scrollTop || scrollY)) / (inum = (time = arguments[1] || 500) / (inc = arguments[2] || 10)),i=-1;
		window.scrollBy(0, dist % inum);
		while((++i)<inum) setTimeout(function(){window.scrollBy(0, idst)}, i * inc);
	}
	function resize(){
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
	function greenText(){
		var p = document.getElementsByTagName('p');
		for(i in p)
			if(p[i].textContent&&p[i].textContent[0]==">")
				p[i].style.color = "green";
	}
	Element.prototype.fitContent = function(){
		var l = ['change','cut','paste','drop','keydown'];
		for(var i in l) this.addEventListener(l[i], resize.bind(this), !1);
	}
	Handlebars.registerHelper('ifCond', function(u,s,v,o){
		return eval(u + s + v) ? o.fn(this) : o.inverse(this);
	});
	Handlebars.registerHelper('strCompare', function(u,v,o){
		return u == v ? o.fn(this) : o.inverse(this);
	})
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
	SC.initialize({
		client_id	: '19ae8fa1aae0ba94bf94e017aa5651de'
	});
	
//	Classes

var Graphene		= new(function(url,api,name){
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
			var tv = el.getAttribute("toggled");;
			el.innerHTML = tv == 'true' ? el.getAttribute("off") : el.getAttribute("on");
			el.setAttribute("toggled", tv == 'true' ? 'false' : 'true');
		}
	})(url,api,name),
	ajax			= function(url, type, header, ops){
		var r = new XMLHttpRequest(),
		o = ops || {};
		r.open(type, url, !0);
		r.withCredentials = typeof o.cred == 'boolean' ? o.cred : !0;
		r.setRequestHeader("Content-type", o.type || "application/x-www-form-urlencoded");
		r.send(header);
		typeof o.load == 'function' && r.addEventListener('load', function(){o.load(r);});
		typeof o.change == 'function' && (r.onreadystatechange = o.change);
		return r;
	};
	window._g		= Graphene;

//	Functions

	_g.t	= (_g.theme		= {
		menuOpen	: !1,
		accent		: '#333333',
		menu		: function(){
			_i("side").style.left = !(this.menuOpen = !this.menuOpen) ? "-200px" : "0px";
		},
		update		: function(c){
			var s = document.styleSheets[1].cssRules, r = ['background','borderTopColor','borderLeftColor','borderRightColor','borderBottomColor','color'];
			for(i in r) s[++i].style[r[--i]] = c;
			this.accent = c;
		},
		side		: function(ctx, next){
			new ajax(_g.api + "/session", "GET", "", {load : function(r){
				if(_g.session.user) {
					_g.session = JSON.parse(r.responseText);
					_g.t.update(_g.session.accent);
					var o = {
						sections : [
							{
								name	: "Feeds",
								url		: _g.url + "/feeds",
								tooltip	: "Edit Feeds",
								links	: [
									{
										name	: "Home",
										url		: _g.url,
										active	: ctx.path == "/"
									}
								].concat(_g.session.feeds)
							},
							{
								name	: "Account",
								url		: _g.url + "/settings",
								tooltip	: "Edit Settings",
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
										name	: "Sign Out",
										url		: _g.url + "/logout"
									}
								]
							},
							{
								name	: "Notifications",
								url		: "javascript:_g.n.open();void(0);",
								tooltip	: "Open Notification Window"
							}
						]
					};
					for(var i = 1; i < o.sections[0].links.length; i++){
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
				_i('side-version').innerHTML = "<a href='http://phene.co'>phene.co, 2015<br></a><a href='" + _g.url + "/changes/webClient'>" + _g.v + "</a>-<a href='" + _g.url + "/changes/server'>" + _g.session.sVersion + "</a>";
				next();
			}});
		}
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
			_i('side-notes').innerHTML = _g.n.amount;
			_i('side-notes').style.display = _g.n.amount == 0 ? 'none' : 'block';
			_g.n.opened ? _i('notes-num').innerHTML = _g.n.amount : null;
		},
		open	: function(){
			if(!_g.n.opened){
				var nw = document.createElement('div');
				nw.id = 'notes';
				pcn = _i('body');
				pcn.insertBefore(nw, pcn.children[0]);
				nw.innerHTML = '<div id="notes-content"><div class="notes-title">Notifications (<span id="notes-num">' + _g.n.amount + '</span> unread)</div><div id="notes-notes"></div></div>';
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
					info[i].link		= _g.url + (info[i].type == 'comment' || info[i].type == 'rating' ? "/post/" + info[i].post._id : info[i].user.url);
					if(!info[i].read) _g.n.amount++;
				}
				_g.n.update();
				if(_g.n.opened) _i('notes-notes').innerHTML = _g.tp.notes({
					notes	: info
				})
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
						// window.__prl();
						_g.b.toLoad = pls.length * 3;
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
				_i('posts').insertAdjacentHTML('beforeend', '<div class="post" id="post-0">No more posts o.0</div>');
				return;
			}
			if(id == 'only'){
				if(parts == 'all'){
					_g.b.loaded += 3;
					_g.b.update();
				}
				if(_i('post-0') == null) _i('posts').insertAdjacentHTML('beforeend', '<div class="post" id="post-0">\'Tis rather lonely ;~;</div>');
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
				for(var i in info.commentList)
					info.commentList[i].owner = info.commentList[i].user.id == _g.session.user,
					info.commentList[i].post = id,
					info.commentList[i].timestamp = _g.time(info.commentList[i].time);
				template		= _g.temps.post(info);
				if(info.all){
					post.innerHTML = template;
					post.oncontextmenu = function(e){
						e.preventDefault();
						var post = this.postId,
							info = _g.p.info[post];
						_g.m.open(e, {
							Comment		: "_g.c.toggle('" + post + "');",
							Delete		: info.editable ? "_g.p.delete('" + post + "');" : "",
							Unfollow	: ~info.followers.indexOf(_g.session.user) ? "_g.p.unfollow('" + post + "');" : "",
							Edit		: info.editable ? "_g.e.open('" + post + "');" : ""
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
						x;
						i.reverse();
						l.reverse();
						//	remove client elements not recognized by server
						for(var k = 0; k < l.length; k++) if(!~i.indexOf(l[k])) _i('post-' + l[k]).remove();
						//	load any new comments
						if((x = i.length - 1 - i.indexOf(l[l.length-1])) > 0){
							_g.p.posts.push(i[i.length-1]);
							_g.p.load(i[i.length-1],'all','b');
						}
						_g.p.stream.close();
						_g.p.listen();
				}
			});
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
			
			//	USER PAGES
			if(_g.u.loaded && ctx.path.toLowerCase().indexOf('/user/' + _g.u.name.toLowerCase())){
				console.log(!ctx.path.toLowerCase().indexOf('/user/' + _g.u.name.toLowerCase()));
				if(se = _i('user')) se.remove();
				_g.u.loaded = !1;
			}
			
			//	STREAMS
			if(typeof _g.p.stream === 'object') _g.p.stream.close();
			
			//	GENERAL ELEMENTS
			var p = [
				'settings',
				'advset',
				'password',
				'streams',
				'changes',
				'change',
				'post-new'
			]
			for(var i in p) if(se = _i(p[i])) se.remove();
			if(se = _c('stream')){
				var s = _c('stream');
				while (s.length > 0) s[s.length].remove();
			}
			
			//	MOVING ON
			next();
		}
	});
	_g.e	= (_g.editor	= {
		
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
			post.innerHTML = _g.temps.post({
				user	: _g.session,
				time	: "Right Now!",
				all		: !0,
				blankPost : !0
			});
			post.setAttribute('post-type', 'text');
			post._c('post-content')[0].innerHTML = _g.temps.creator({url:_g.url});
			post._c('post-content')[0].insertAdjacentHTML('afterend','<div class="post-options" style="position:relative;max-height:21px;text-align:right;"><div class="post-ribbon" tabindex="-1" onclick="_g.cr.post()">Post</div></div>');
			post.insertAdjacentHTML('afterbegin', '<div class="post-shade"></div>');
			post.style.display = 'block';
			post.style.opacity = '1';
			_i('post-textbox-1').fitContent();
			/*
			_i('post-new-image').onchange = this.drop;
			_i('post-new-audio').onchange = this.drop;
			post.addEventListener('dragover', this.dragover);
			post.addEventListener('drop', this.drop);
			*/
			return !0;
		},
		renderImages	: function(){
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
		renderLink		: function(){
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
		dragover		: function(e){
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
		},
		drop			: function(e){
			var files	= (typeof e.dataTransfer !== 'undefined') ? e.dataTransfer.files : this.files,
				cre		= _i('post-new'), f;
			if((cre.getAttribute('post-type') == 'text' || cre.getAttribute('post-type') == 'image') && files[0].type.match('image.*')){
				if(typeof e.dataTransfer !== 'undefined') e.preventDefault();
				for(var i in f = files[i]){
					if(!f.type.match('image.*')) continue;
					cre.setAttribute('post-type', 'image');
					var reader = new FileReader();
					reader.onload = function(e){
						var pclen = _g.cr.images.length;
						if(pclen < 11){
							_g.cr.images[pclen] = e.target.result;
							_g.cr.imageLayout[_g.cr.imageLayout.length] = [pclen];
							cre._c('post-medias')[0].style.display = 'none';
							_g.cr.renderImages();
						}
					};
					reader.readAsDataURL(f);
				}
			} else if(cre.getAttribute('post-type') == 'text' && files[0].type.match('audio.*') && _g.cr.audio == ''){
				pm = cre._c('post-mediabox')[0];
				if(typeof e.dataTransfer !== 'undefined') e.preventDefault();
				cre.setAttribute('post-type', 'audio');
				var reader = new FileReader();
				reader.onload = function(f){
					return function(e){
						_g.cr.audio = e.target.result;
						_g.cr.audioElement = window.URL.createObjectURL(f);
						cre._c('post-medias')[0].style.display = 'none';
						pm.innerHTML = '<div id="post-creator-blob"></div>';
						new gra_aud(_i('post-creator-blob'), _g.cr.audioElement, {
							color : _g.t.accent
						});
					};
				}(files[0]);
				reader.readAsDataURL(files[0]);
			}
		},
		remove			: function(id){
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
				cpp._c('post')[0].className = 'post post-active';
				if(typeof focus !== 'boolean' || focus) window.setTimeout(function(){ccr._c('comment-textbox')[0].focus();}, 0);
			} else {
				ccr.style.display = 'none';
				cpp._c('post post-active')[0].className = 'post';
			}
		}
	});
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
		hovering: !1,
		card	: '',
		cardSrc	: {},
		cards	: {},
		cardTime: 0,
		load	: function(user,ctx){
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
						name	: info.name,
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
					if(!_g.u.loaded) _i('body').insertAdjacentHTML('afterbegin',utmp);
					else _i('user').outerHTML = utmp;
					_g.t.update(info.accent);
					_g.u.loaded = !0;
				}
			})
		},
		follow	: function(user){
			new ajax(_g.api + '/user/' + user + '/follow', 'POST', '', {
				load	: function(r){
					if(_g.u.loaded && _g.u.current == user) page(window.location.pathname);
				}
			});
		},
		unfollow: function(user){
			new ajax(_g.api + '/user/' + user + '/unfollow', 'POST', '', {
				load	: function(r){
					if(_g.u.loaded && _g.u.current == user) page(window.location.pathname);
				}
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
					_g.u.cards[_g.u.card].style.display = 'none';
					_g.u.hovering = !1;
				}
			} else {
				var a,b;
				if(a = e.target.parentAnchor()){
					if(a.host !== _g.url.split('://')[1]) return;
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
			var cards, card, user = _g.u.info.name[_g.u.card];
			if(user._id == null) return _g.u.hovering = !1;
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
			card.style.opacity = 0;
			card.style.display = 'block';
			var a = _g.u.cardSrc.getBoundingClientRect(),
				b = _i('body').getBoundingClientRect(),
				c = card.getBoundingClientRect();
			card.style.top = a.bottom + ((document.documentElement.scrollTop) ? document.documentElement.scrollTop : scrollY) + 'px';
			card.style.left = (a.left + (a.width/2)) - (c.width/2) - b.left + 'px';
			card.style.opacity = 1;
		}
	});
	_g.s	= (_g.settings	= {
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
								input	: [
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
								]
							},
							{
								name		: "Display Name",
								id			: "nh",
								toggle		: !0,
								value		: sess.nameHandle,
								offValue	: sess.firstName + " " + sess.lastName,
								onValue		: sess.userName
							},
							{
								name		: "Accent Color",
								id			: "clr",
								color		: sess.accent
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
								value		: !0,
								offValue	: "Off",
								onValue		: "On <div style='color:#ccc;display:inline-block;'>(Default)</div>"
							},
							{
								name		: "Color Previews",
								id			: "t2",
								toggle		: !0,
								value		: !1,
								offValue	: "Off <div style='color:#ccc;display:inline-block;'>(Default)</div>",
								onValue		: "On"
							},
							{
								name		: "Event Streams",
								id			: "t3",
								toggle		: !0,
								value		: !0,
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
		save	: function(){
			new ajax(_g.api + '/settings', 'POST', JSON.stringify({
				firstName	: _i('settings-fname').value,
				lastName	: _i('settings-lname').value,
				nameHandle	: _i('settings-nh').getAttribute('toggled'),
				accent		: _i('settings-accent').value
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
		}
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
				firstname	: _i('settings-fname').value,
				lastname	: _i('settings-lname').value,
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
			new ajax(_g.api + "/changes/" + app, "GET", "", {
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
	_g.b	= (_g.bar		= {
		toLoad : 0,
		loaded : 0,
		error  : !1,
		fun    : [
			"https://www.youtube.com/watch?v=0y2ZxgJNlWs'>Herding sheep",
			"https://en.wikipedia.org/wiki/Sudetenland'>Annexing the Sudetenland",
			"https://en.wikipedia.org/wiki/Alien_and_Sedition_Acts'>Proposing partisan legislation",
			"https://en.wikipedia.org/wiki/Representativeness_heuristic'>Electing new representatives",
			"http://www.gamefaqs.com/pc/561176-simcity-4/faqs/22135'>Fetching more loading titles",
			"http://www.horoscope.com/'>Predicting astronomic phenomena",
			"https://www.youtube.com/watch?v=5_tXcRYOYZ0'>Firing interns",
			"https://www.reddit.com/r/foodporn'>Activating the lateral hypothalamus",
			"https://www.youtube.com/watch?v=MJ_-sDR-_Hs'>Rendering Golgi apparati",
			"http://www.warhol.org/'>Do you have a moment to talk about our lord and savior Andy Warhol? ",
			"http://imgur.com/gallery/pJRNA'>This could be an advertisement... but we're too cool for that",
			"https://www.youtube.com/watch?v=PNtdeeo1yxw'>Fixing bugs you didn't even notice",
			"http://www.stanleyparable.com'>Looking for a real job",
			"'>Loading... I can't think of anything funny to say",
			"https://www.youtube.com/watch?v=vt0Y39eMvpI'>Expecting the Spanish Inquisition",
			"https://www.youtube.com/watch?v=FRgcw5HjBV0'>Uhh"
		],
		update : function(){
			if(this.error) return;
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
			// _i('loading-error').innerHTML = "<a target='_blank' href='" + _g.b.fun[~~(_g.b.fun.length*Math.random())] + "</a>...";
		}
	});

//	Templates

	_g.tp	= (_g.temps		= {
		post	: _h('post'),
		side	: _h('sidebar'),
		sets	: _h('settings'),
		reg		: _h('register'),
		creator : _h('creator'),
		change	: _h('change'),
		user	: _h('user'),
		notes	: _h('note')
	});
	Handlebars.registerPartial('comment', _i('comment-template').innerHTML);

//	Routes

function pageview(ctx){
	ga('set', {
		page	: ctx.path,
		title	: _g.page
	});
	ga('send', 'pageview');
}
window.addEventListener('load', function(){
// if(!_g.b.error) _i('loading-error').innerHTML = "<a target='_blank' href='" + _g.b.fun[~~(_g.b.fun.length*Math.random())] + "</a>...";
new ajax(_g.api + "/session", "GET", "", {change:function(r){

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

	if(r.target.readyState !== 4) return;
	
	var _session_	= _g.session = JSON.parse(r.target.responseText);
		_g.v		= _session_.version;
		_g.user		= _session_.user;
		_g.lvl		= _session_.rank;
		_g.t.update(_session_.accent);
	
	page('*', _g.p.clear);
	page('*', _g.t.side);
	
	//	Home/Stream Pages
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
	page('/register', _g.rg.load, pageview);
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
	
	//	Changelog
	page('/changes/:app?', _g.cn.load, pageview);
	
	//	Post Pages
	page('/post/:id', function(ctx,next){
		if(!_i('posts')) _i('body').insertAdjacentHTML('beforeend', '<div id="posts"></div>');
		_g.p.set = 'post';
		_g.p.setData = ctx.params.id;
		_g.b.toLoad = 4;
		_g.b.loaded = 1;
		_g.b.update();
		_g.p.load(ctx.params.id, 'all');
		_g.p.loaded = true;
		next();
	}, pageview);

	//	User Pages
	page('/user/:user', function(ctx,next){
		new ajax(_g.api + '/user/' + ctx.params.user + '/getId', 'GET', '', {load:function(r){
			var user = JSON.parse(r.responseText);
			_g.u.load(ctx.params.user,ctx)
			_g.p.set = 'user';
			_g.p.setData = user;
			_g.p.list(20);
		next();
		}});
	}, pageview);
	page('/user/:user/posts', function(ctx,next){
		new ajax(_g.api + '/user/' + ctx.params.user + '/getId', 'GET', '', {load:function(r){
			var user = JSON.parse(r.responseText);
			_g.u.load(ctx.params.user,ctx)
			_g.p.set = 'user';
			_g.p.setData = user;
			_g.p.list(20);
			next();
		}});
	}, pageview);
	page('/user/:user/upvotes', function(ctx,next){
		new ajax(_g.api + '/user/' + ctx.params.user + '/getId', 'GET', '', {load:function(r){
			var user = JSON.parse(r.responseText);
			_g.u.load(ctx.params.user,ctx)
			_g.p.set = 'user';
			_g.p.setData = user;
			_g.p.list(20);
			next();
		}});
	}, pageview);

	//	Setting Pages
	page('/settings', _g.s.load, pageview);
	page('/settings/advanced', _g.s.advanced, pageview);
	page('/feeds', function(ctx,next){next();}, pageview);

	//	404
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
	
	page();
	
	_g.cn.recheck(_g.session.v);
	_g.n.check();
}});
});

setInterval(function(){
	var ts = _c('timestamp');
	for(var i = 0; i < ts.length; i++)
		if(!isNaN(parseInt(ts[i].getAttribute('unix-time')))) ts[i].innerHTML = _g.time(ts[i].getAttribute('unix-time'));
}, 1e3);
//	I totally forgot this vvv was even a thing
window.addEventListener('scroll', function(){
	if((_g.p.loaded && _g.p.needLoad && !_g.p.loading && _g.p.loadMore) && (((document.documentElement.scrollTop) ? document.documentElement.scrollTop : scrollY) > (document.body.scrollHeight - 600 - window.innerHeight)))
		_g.p.list(20);
});
window.addEventListener('mousemove',_g.u.hovercard)