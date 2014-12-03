/**
 * start/view.js
 * @ndaidong
 * @copy: *.techpush.net
*/

var app = window['app'] || {};

;(function(){

    'use strict';
    
    var $txtCity, $txtClock, $txtDay, $imgWeather;
	
	function setCity(){
		var ct = app.city();
		if(!!ct){
			$txtCity.html(ct);
		}
	}
	
	function setTime(){
		var n = Bella.date.format(false, 'H:i a');
		$txtClock.html(n);
		setTimeout(setTime, 1000);
	}
	
	function setDate(){
		var n = Bella.date.format(false, 'D, M d, Y');
		$txtDay.html(n);		
	}
	
	function setWeather(){
		var w = app.weather();
		if(!!w){
			var icon = w.icon, desc = w.description;
			var file = '/images/icons/weather/'+icon+'.png';
			$imgWeather.title = desc;
			$imgWeather.style.backgroundImage = 'url('+file+')';
		}
	}
		
	var M, V = Bella.createView('start', {
		init: function(){
			M = Bella.Model.start;
			
			$txtCity = Bella.element('txtCity');
			$txtClock = Bella.element('txtClock');
			$txtDay = Bella.element('txtDay');
			$imgWeather = Bella.element('imgWeather');
			
			Bella.dom.all('.link-to').forEach(function(el){
				var rel = el.getAttribute('rel');
				if(!!rel){
					el.click(function(e){
						Bella.event.exit(e);
						chrome.tabs.getCurrent(function(tab){
							chrome.tabs.update(tab.id, {url: rel}, function(){
								
							});
						});
					});
				}
			});
			
			setCity();
			setTime();
			setDate();
			setWeather();
		},
		setCity : setCity,
		setWeather: setWeather
	});
})();
