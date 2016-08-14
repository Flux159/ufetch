'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ufetch = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = require('isomorphic-fetch');

function mergeObjects(mergedOptions, addOptions) {
  for (var o in addOptions) {
    if (addOptions.hasOwnProperty(o)) {
      mergedOptions[o] = addOptions[o];
    }
  }
}

function isObject(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object';
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
    (0, _classCallCheck3.default)(this, Ufetch);

    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    this.globalOptions = {};
  }

  (0, _createClass3.default)(Ufetch, [{
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
        if (res.ok) {
          return res.json();
        }
      });
    }
  }, {
    key: 'transformRequestData',
    value: function transformRequestData(d) {
      if (isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d)) {
        return (0, _stringify2.default)(d);
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
        if (res.ok) {
          return res.json();
        }

        throw res;
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
    value: function _delete(url, options) {
      return this.req('DELETE', url, options);
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
