/**
 * app.js
 * @ndaidong
 * @copy: *.techpush.net
*/

;(function(){
	
	var enableLog = true;
	
	var _user, _city = '', _weather, _lang = navigator.language;
	var $container, $header, $footer;
	
	Bella.setJSPath(Bella.MOD, '/js/bundles');
	Bella.setJSPath(Bella.LIB, '/js/libs');
	Bella.setJSPath(Bella.DEP, '/js/dependencies');
	
	function _sendMessage(data, callback){
		var cb = callback || function(){};
		chrome.runtime.sendMessage(data, null, cb);
	}
	
	function _log(msg){
		if(!!enableLog){
			console.log(msg);
		}
	}
	
	function _getUser(){
		var me = false;
		var users = [], s = localStorage.getItem('users'), uid = localStorage.getItem('uid');
		if(!!s && !!uid){
			users = JSON.parse(s);
			if(!!users && Bella.isArray(users) && users.length>0){
				for(var i=0;i<users.length;i++){
					if(users[i].userid===uid){
						me = users[i];
						break;
					}
				}
			}
		}
		return me;
	}
	
	function _getCity(){
		return localStorage.getItem('city') || '';
	}
	
	function _getWeather(){
		var w = localStorage.getItem('weather');
		if(!!w){
			w = JSON.parse(w);
		}
		return w;
	}
	
	function init(){
		
		_user = _getUser();
		_city = _getCity();
		_weather = _getWeather();
		
		$container = Bella.element('wrapper');
		
		var M = Bella.Model;
        for(var k in M){
			if(!!M[k]){
				M[k].init();
			}
		}
	}
	
	function loadModules(){
		Bella.implement(['start'], init);
	}
	
	var _scroller, _lastY = 0;
	
	var onScroll = function(info){
		var y = info.y;
		info.distanceY = Math.abs(_lastY-y);
		if(y<_lastY){
			onScrollDown(info);
		}
		else if(y>_lastY){
			onScrollUp(info);
		}
		_lastY = y;		
	}

	var onScrollUp = function(info){
			
	}
	var onScrollDown = function(info){
		
	}
	
	Bella.require(['handlebars.min', 'object.observe'], function(){
		Bella.require(['animation.min', 'drag-drop.min', 'iscroll-probe.min', 'mousetrap.min'], Bella.LIB, function(){
			if(!!window['IScroll']){
				_scroller = new IScroll('#wrapper', {
					scrollbars: true,
					mouseWheel: true,
					probeType: 3,
					bounce: false,
					preventDefault: false,
					keyBindings: true,
					interactiveScrollbars: true,
					fadeScrollbars: true
				});
				_scroller.on('scroll', function(){
					var y = this.y;
					var maxY = this.maxScrollY;
					onScroll({maxY: maxY, y: y});
				});
				_scroller.on('scrollStart', function(){
					var y = this.y;
					var maxY = this.maxScrollY;
					onScroll({maxY: maxY, y: y});
				});
				
				window.onload = function(){
					_scroller.refresh();
				}
				setTimeout(function(){
					_scroller.refresh();
				}, 2000);
			}
			loadModules();
		});
	});
	

	function gettime(){
		return (new Date()).getTime();
	}
	
	function encode(data){
		var result = "";
		var arr = [];
		var e = encodeURIComponent;
		for(var k in data){
			if(data.hasOwnProperty(k)){
				arr.push(k+'='+e(data[k]));
			}
		}
		if(arr.length>0){
			result = arr.join('&');
		}
		return result;
	}
	
	function pull(target, data, callback){
		var cb = callback || function(){};
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState==4){
				var d = JSON.parse(xhr.responseText);
				cb(d);
			}
		}
		var str = !!data?encode(data):'';
		var url = (target.indexOf('http')===-1?baseURL+target:target)+'?'+str;
		localStorage.setItem('request', url);
		xhr.open("GET", url, true);
		xhr.send();
	}
	
	function getCity(arr){
		var city = '';
		var item = arr[0], coms = item.address_components;
		for(var i=coms.length-1;i>=0;i--){
			var c = coms[i], type = c.types[0];
			if(type.indexOf("administrative_area_level_1") !== -1){
				city = c.long_name;
				break;
			}
		}
		if(!!city){
			_setCity(city);
		}
	}
	
	function _setCity(c){
		if(!!c && c!=_city){
			_city = c;
			localStorage.setItem('city', c);
			onCityChange();
		}
	}
	
	function _setWeather(w){
		_weather = w;
		localStorage.setItem('weather', JSON.stringify(w));
		localStorage.setItem('lastUpdate', gettime());
		onWeatherChange();
	}
	
	function onCityChange(){
		var v = Bella.View.start;
		if(!!v){
			_log('onCityChange');
			v.setCity();
		}
	}
	
	function onWeatherChange(){
		var v = Bella.View.start;
		if(!!v){
			_log('onWeatherChange');
			v.setWeather();
		}
	}

	function start(){
		
		var watchTimer;
		
		var done = function(position){
			var c = position.coords;
			var latlng = [c.latitude, c.longitude].join(',');
			pull('http://maps.googleapis.com/maps/api/geocode/json', {latlng: latlng, sensor:true}, function(res){
				if(!!res && !!res.results && res.status==='OK'){
					getCity(res.results);
				}
				if(!!_city){
					pull('http://api.openweathermap.org/data/2.5/weather', {q: _city}, function(res){
						if(!!res && !!res.weather){
							var w = res.weather[0];
							w.detail = res.main;
							w.detail.wind = res.wind;
							w.detail.clouds = res.clouds;
							w.detail.cod = res.cod;
							_setWeather(w);
						}
					});
				}
			});
			watchTimer = setTimeout(detect, 10*6e4);
		}

		var fail = function(){
			watchTimer = setTimeout(detect, 6e4);
		}
		
		var detect = function(){
			navigator.geolocation.getCurrentPosition(done, fail, {
				enableHighAccuracy: true,
				timeout           : 6e4
			});
		}
		
		var t0 = localStorage.getItem('lastUpdate') || 0;
		var t1 = gettime();
		if(t1-t0>10*6e4){
			detect();
		}
		else{
			watchTimer = setTimeout(detect, 5*6e4);
		}
	}
	
	start();
	
	
	//http://quotesondesign.com/api/3.0/api-3.0.json
	
	var app = window['app'] = {
		me : function(){
			return (!!_user&&!!_user.userid)?_user:null;
		},
		city : function(){
			return _city || '';
		},
		weather : function(){
			return _weather || false;
		},
		scrollTo : function(x, y, t){
			if(!!_scroller && !!window['IScroll']){
				//quadratic, circular, back, bounce, elastic
				var ease =  IScroll.utils.ease.quadratic;
				_scroller.scrollTo(x, y, t, ease);
			}
		},
		updateScroller : function(){
			if(!!_scroller && !!window['IScroll']){
				_scroller.refresh();
			}			
		},
		log : _log
	}
	

})();
