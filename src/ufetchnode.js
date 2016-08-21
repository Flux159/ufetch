const fetch = require('isomorphic-fetch');

function mergeObjects(mergedOptions, addOptions) {
  for (const o in addOptions) {
    if (addOptions.hasOwnProperty(o)) {
      mergedOptions[o] = addOptions[o];
    }
  }
}

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
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
class Ufetch {
  constructor() {
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    this.globalOptions = {};
  }
  
  mergeOptions(options) {
    const finalOptions = {};
    const finalHeaders = {};
    
    mergeObjects(finalHeaders, this.defaultOptions.headers || {});
    mergeObjects(finalHeaders, this.globalOptions.headers || {});
    mergeObjects(finalHeaders, options.headers || {});
    
    mergeObjects(finalOptions, this.defaultOptions);
    mergeObjects(finalOptions, this.globalOptions);
    mergeObjects(finalOptions, options);
    
    finalOptions.headers = finalHeaders;
    
    return finalOptions;  
  }
  
  setGlobalOptions(options) {
    this.globalOptions = options;
  }
  
  req(method, url, options) {
    const mergedOptions = this.mergeOptions(options || {});
    mergedOptions.method = method;
    
    return fetch(url, mergedOptions).then((res) => { // eslint-disable-line consistent-return
      if (res.ok && res.status < 400) {
        return res.json();
      }

      throw new Error(res);
    });
  }
  
  transformRequestData(d) {
    if (isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d)) {
      return JSON.stringify(d);
    } else { // eslint-disable-line no-else-return
      return d;
    }
  }
  
  dataReq(method, url, options, data) {
    let realOptions = options;
    if (!data) {
      data = options || {};
      realOptions = {};
    }
    
    const mergedOptions = this.mergeOptions(realOptions || {});
    mergedOptions.method = method;
    mergedOptions.body = this.transformRequestData(data);
    if (isFormData(data)) {
      delete mergedOptions.headers['Content-Type'];
    }
    
    return fetch(url, mergedOptions, data).then((res) => { // eslint-disable-line consistent-return
      if (res.ok && res.status < 400) {
        return res.json(); 
      }
      
      throw res;
    });
  }
  
  get(url, options) {
    return this.req('GET', url, options);
  }
  
  head(url, options) {
    return this.req('HEAD', url, options);
  }
  
  delete(url, options) {
    return this.req('DELETE', url, options);
  }
  
  post(url, options, data) {
    return this.dataReq('POST', url, options, data);
  }
  
  put(url, options, data) {
    return this.dataReq('PUT', url, options, data);
  }
  
  patch(url, options, data) {
    return this.dataReq('PATCH', url, options, data);
  }
  
  /**
   * A function to get a cookie from the browser. Used when passing the XSRF-Cookie
   * Obtained from here: http://www.w3schools.com/js/js_cookies.asp
   * @param cname
   * @returns {string}
   */
  getCookie(cname) {
    if (cname) {
      const name = `${cname}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    } else { // eslint-disable-line no-else-return
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
  setCookie(cname, cvalue, exdays, secure, domain) {
    const secureStr = secure ? ';secure' : '';
    const domainStr = domain ? `;Domain=${domain}` : '';
    if (exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      const expires = `expires=${d.toUTCString()}`;
      document.cookie = `${cname}=${cvalue}; ${expires}; path=/${domainStr}${secureStr}`;
    } else {
      document.cookie = `${cname}=${cvalue}; path=/${domainStr}${secureStr}`;
    }
  }
 
  /**
   * Function to set cookie from a string (useful on server)
   * @param cookieString
   */
  setCookieFromString(cookieString) {
    document.cookie = cookieString;
  }
 
  /**
   * A function to delete a cookie from the browser
   */
  deleteCookie(name, path, domain) {
    const domainStr = domain ? `;Domain=${domain}` : '';
    if (path) {
      document.cookie = `${name}=; path=${path}${domainStr}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    } else {
      document.cookie = `${name}=${domainStr}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  } 
}

const ufetch = new Ufetch();

export {
  ufetch,
};
