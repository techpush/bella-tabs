/**
 * time-location.js
 * TimeLocation module
 * @ndaidong
 */

/* global Bella Ractive fetchival */
/* eslint no-console: 0 */

(function _init() {

  var data = {},
    vm;

  function onchange() {
    for (var k in data) {
      if (Bella.hasProperty(data, k)) {
        vm.set(k, data[k]);
      }
    }

    var weatherIcon = Bella.dom.get('weatherIcon');
    if (weatherIcon && data.weather) {
      var w = data.weather;
      weatherIcon.style.backgroundImage = 'url(/images/icons/weather/' + w.icon + '.png)';
    }
  }

  function getDateTime() {
    var n = new Date();
    var t = Bella.date.format('h:i a', n);
    var d = Bella.date.format('D, M d, Y', n);
    data.time = t;
    data.date = d;
  }

  function updateTime() {
    getDateTime();
    onchange();
    setTimeout(updateTime, 1000);
  }

  function parseCity(arr) {
    var city = '';
    var item = arr[0],
      coms = item.address_components;
    for (var i = coms.length - 1; i >= 0; i--) {
      var c = coms[i],
        type = c.types[0];
      if (type.indexOf('administrative_area_level_1') !== -1) {
        city = c.long_name;
        break;
      }
    }
    return city;
  }

  function getCity(latlng) {
    return new Promise(function _fn(resolve, reject) {

      var now = Bella.time();

      var cache = App.get('city'),
        catched;
      if (cache) {
        catched = cache.data;
        if (cache.expires < now) {
          return resolve(catched);
        }
      }

      return fetchival('http://maps.googleapis.com/maps/api/geocode/json').get({
        latlng: latlng,
        sensor: true
      }).then(function fn(res) {
        var city = '';
        if (res && res.results && res.status === 'OK') {
          city = parseCity(res.results);
        }
        if (city) {
          App.set('city', {
            data: city,
            latlng: latlng,
            expires: Bella.time() + 15 * 6e4
          });
          return resolve(city);
        }
        return reject({
          error: 1
        });
      }).catch(function _catch(e) {
        if (catched) {
          return resolve(catched);
        }
        return reject(e);
      });
    });
  }

  function getWeather(city) {
    return new Promise(function _fn(resolve, reject) {

      var now = Bella.time();

      var cache = App.get('weather'),
        catched;
      if (cache) {
        catched = cache.data;
        if (cache.city === city && cache.expires < now) {
          return resolve(catched);
        }
      }

      return fetchival('http://api.openweathermap.org/data/2.5/weather').get({
        q: city,
        appid: App.get('OWMKey')
      }).then(function _then(result) {
        if (result && result.weather) {
          var w = result.weather[0];
          w.detail = result.main;
          w.detail.wind = result.wind;
          w.detail.clouds = result.clouds;
          w.detail.cod = result.cod;
          App.set('weather', {
            data: w,
            city: city,
            expires: Bella.time() + 15 * 6e4
          });
          resolve(w);
        } else {
          reject({
            error: 1
          });
        }
      }).catch(function _catch(e) {
        console.trace(e);
        if (catched) {
          return resolve(catched);
        }
        return reject(e);
      });
    });
  }

  function updateLocation() {
    App.detectLocation().then(function f1(position) {
      var c = position.coords;
      var latlng = [ c.latitude, c.longitude ].join(',');
      getCity(latlng).then(function f2(city) {
        getWeather(city).then(function f3(w) {
          data.city = city;
          data.weather = w;
          onchange();
        });
      });
    });
    setTimeout(updateLocation, 5 * 6e4);
  }

  function init() {
    updateTime();
    updateLocation();
  }

  App.pull('/templates/time-location.html').then(function f1(template) {
    vm = Ractive({
      el: '#vsTimeLocation',
      template: template,
      data: data
    });
    return init();
  });
})();
