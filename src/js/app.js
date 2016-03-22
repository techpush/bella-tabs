/**
 * start.js
 * Init app
 * @ndaidong
 */
/* global chrome */

(function _init() {

  var App = window.App = {};

  var _store = (function _getCache(data) {
    var o;
    if (data) {
      o = JSON.parse(data);
    }
    return o || {};
  })(localStorage.getItem('store'));

  var updateStore = function _updateStore() {
    localStorage.setItem('store', JSON.stringify(_store));
  };

  App.set = function _set(key, value) {
    _store[key] = value;
    updateStore();
  };
  App.get = function _get(key) {
    return _store[key];
  };
  App.remove = function _remove(key) {
    if (Bella.hasProperty(_store, key)) {
      _store[key] = null;
      delete _store[key];
      updateStore();
    }
  };
  App.me = function _me() {
    return _store.user || false;
  };

  function parse(data) {
    var s = '';
    if (Bella.isString(data)) {
      s = data;
    } else if (Bella.isArray(data) || Bella.isObject(data)) {
      var ar = [];
      for (var k in data) {
        if (Bella.hasProperty(data, k)) {
          var val = data[k];
          if (Bella.isString(val)) {
            val = Bella.encode(val);
          } else if (Bella.isArray(val) || Bella.isObject(val)) {
            val = JSON.stringify(val);
          }
          ar.push(Bella.encode(k) + '=' + val);
        }
      }
      if (ar.length > 0) {
        s = ar.join('&');
      }
    }
    return s;
  }

  App.pull = function _pull(target, data) {
    return new Promise(function _fn(resolve, reject) {
      try {
        var query = target;
        query += (target.charAt(target.length - 1) !== '?' ? '?' : '') + parse(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function _on() {
          if (xhr.readyState === 4) {
            return resolve(xhr.responseText, xhr.status);
          }
        };
        xhr.open('GET', chrome.extension.getURL(query), true);
        xhr.send();
      } catch (e) {
        return reject(e);
      }
    });
  };

  App.detectLocation = function _detectLocation() {
    return new Promise(function _getCP(resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 6e4
      });
    });
  };

  Bella.dom.all('.link-to').forEach(function _each(el) {
    var rel = el.getAttribute('rel');
    if (rel) {
      Bella.event.on(el, 'click', function _onclick(e) {
        Bella.event.stop(e);
        chrome.tabs.getCurrent(function _geCT(tab) {
          chrome.tabs.update(tab.id, {
            url: rel
          }, function _fn() {
            return false;
          });
        });
      });
    }
  });

  App.set('OWMKey', 'cc827bb57ecfeda1f9d99be1f399fd33');
})();
