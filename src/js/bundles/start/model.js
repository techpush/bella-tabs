/**
 * start/model.js
 * @ndaidong
 * @copy: *.techpush.net
*/

var app = window['app'] || {};

;(function(){

    'use strict';

    var V, M = Bella.createModel('start', {
        init : function(){
			V = Bella.View.start;
			if(!!V){
				V.init();
			}
        }
    });

})();
