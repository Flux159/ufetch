'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fetch = require('isomorphic-fetch');

function mergeObjects(mergedOptions, addOptions) {
  for (var o in addOptions) {
    if (addOptions.hasOwnProperty(o)) {
      mergedOptions[o] = addOptions[o];
    }
  }
}

function isObject(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

function isFile(obj) {
  return toString.call(obj) === '[object File]';
}

function isBlob(obj) {
  return toString.call(obj) === '[object Blob]';
}

function isFormData(obj) {
  return toString.call(obj) === '[object FormData]';
}

/**
 * A wrapper around fetch to make it suck less
 * Note that if you want progress, use uhttp (which wraps XMLHTTPRequest)
 */

var Ufetch = function () {
  function Ufetch() {
    _classCallCheck(this, Ufetch);

    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    this.globalOptions = {};
  }

  _createClass(Ufetch, [{
    key: 'mergeOptions',
    value: function mergeOptions(options) {
      var finalOptions = {};
      var finalHeaders = {};

      mergeObjects(finalHeaders, this.defaultOptions.headers || {});
      mergeObjects(finalHeaders, this.globalOptions.headers || {});
      mergeObjects(finalHeaders, options.headers || {});

      mergeObjects(finalOptions, this.defaultOptions);
      mergeObjects(finalOptions, this.globalOptions);
      mergeObjects(finalOptions, options);

      finalOptions.headers = finalHeaders;

      return finalOptions;
    }
  }, {
    key: 'setGlobalOptions',
    value: function setGlobalOptions(options) {
      this.globalOptions = options;
    }
  }, {
    key: 'req',
    value: function req(method, url, options) {
      var mergedOptions = this.mergeOptions(options || {});
      mergedOptions.method = method;

      return fetch(url, mergedOptions).then(function (res) {
        // eslint-disable-line consistent-return
        return res.json().then(function (json) {
          return res.ok && res.status < 400 ? json : Promise.reject(json);
        });
      });
    }
  }, {
    key: 'transformRequestData',
    value: function transformRequestData(d) {
      if (isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d)) {
        return JSON.stringify(d);
      } else {
        // eslint-disable-line no-else-return
        return d;
      }
    }
  }, {
    key: 'dataReq',
    value: function dataReq(method, url, options, data) {
      var realOptions = options;
      if (!data) {
        data = options || {};
        realOptions = {};
      }

      var mergedOptions = this.mergeOptions(realOptions || {});
      mergedOptions.method = method;
      mergedOptions.body = this.transformRequestData(data);
      if (isFormData(data)) {
        delete mergedOptions.headers['Content-Type'];
      }

      return fetch(url, mergedOptions, data).then(function (res) {
        // eslint-disable-line consistent-return
        return res.json().then(function (json) {
          return res.ok && res.status < 400 ? json : Promise.reject(json);
        });
      });
    }
  }, {
    key: 'get',
    value: function get(url, options) {
      return this.req('GET', url, options);
    }
  }, {
    key: 'head',
    value: function head(url, options) {
      return this.req('HEAD', url, options);
    }
  }, {
    key: 'delete',
    value: function _delete(url, options, data) {
      return this.dataReq('DELETE', url, options, data);
    }
  }, {
    key: 'post',
    value: function post(url, options, data) {
      return this.dataReq('POST', url, options, data);
    }
  }, {
    key: 'put',
    value: function put(url, options, data) {
      return this.dataReq('PUT', url, options, data);
    }
  }, {
    key: 'patch',
    value: function patch(url, options, data) {
      return this.dataReq('PATCH', url, options, data);
    }

    /**
     * A function to get a cookie from the browser. Used when passing the XSRF-Cookie
     * Obtained from here: http://www.w3schools.com/js/js_cookies.asp
     * @param cname
     * @returns {string}
     */

  }, {
    key: 'getCookie',
    value: function getCookie(cname) {
      if (cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return '';
      } else {
        // eslint-disable-line no-else-return
        return document.cookie;
      }
    }

    /**
     * A function to set a cookie from the browser.
     * Obtained from here: http://www.w3schools.com/js/js_cookies.asp
     * @param cname
     * @param cvalue
     * @param exdays
     * @param secure
     * @param domain
     */

  }, {
    key: 'setCookie',
    value: function setCookie(cname, cvalue, exdays, secure, domain) {
      var secureStr = secure ? ';secure' : '';
      var domainStr = domain ? ';Domain=' + domain : '';
      if (exdays) {
        var d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/' + domainStr + secureStr;
      } else {
        document.cookie = cname + '=' + cvalue + '; path=/' + domainStr + secureStr;
      }
    }

    /**
     * Function to set cookie from a string (useful on server)
     * @param cookieString
     */

  }, {
    key: 'setCookieFromString',
    value: function setCookieFromString(cookieString) {
      document.cookie = cookieString;
    }

    /**
     * A function to delete a cookie from the browser
     */

  }, {
    key: 'deleteCookie',
    value: function deleteCookie(name, path, domain) {
      var domainStr = domain ? ';Domain=' + domain : '';
      if (path) {
        document.cookie = name + '=; path=' + path + domainStr + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } else {
        document.cookie = name + '=' + domainStr + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
  }]);

  return Ufetch;
}();

var ufetch = new Ufetch();

exports.ufetch = ufetch;
