/*! esri-leaflet - v1.0.0-rc.4 - 2014-11-10
*   Copyright (c) 2014 Environmental Systems Research Institute, Inc.
*   Apache License*/
(function (factory) {
  //define an AMD module that relies on 'leaflet'
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], function (L) {
      return factory(L);
    });
  //define a common js module that relies on 'leaflet'
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(require('leaflet'));
  }

  if(typeof window !== 'undefined' && window.L){
    factory(window.L);
  }
}(function (L) {
var EsriLeaflet = { //jshint ignore:line
  VERSION: '1.0.0-rc.4',
  Layers: {},
  Services: {},
  Controls: {},
  Tasks: {},
  Util: {},
  Support: {
    CORS: !!(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()),
    pointerEvents: document.documentElement.style.pointerEvents === ''
  }
};

if(typeof window !== 'undefined' && window.L){
  window.L.esri = EsriLeaflet;
}


(function(EsriLeaflet){

  // shallow object clone for feature properties and attributes
  // from http://jsperf.com/cloning-an-object/2
  function clone(obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[i] = obj[i];
      }
    }
    return target;
  }

  // checks if 2 x,y points are equal
  function pointsEqual(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  // checks if the first and last points of a ring are equal and closes the ring
  function closeRing(coordinates) {
    if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
      coordinates.push(coordinates[0]);
    }
    return coordinates;
  }

  // determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
  // or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
  // points-are-in-clockwise-order
  function ringIsClockwise(ringToTest) {
    var total = 0,i = 0;
    var rLength = ringToTest.length;
    var pt1 = ringToTest[i];
    var pt2;
    for (i; i < rLength - 1; i++) {
      pt2 = ringToTest[i + 1];
      total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
      pt1 = pt2;
    }
    return (total >= 0);
  }

  // ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L504-L519
  function vertexIntersectsVertex(a1, a2, b1, b2) {
    var uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
    var ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
    var uB  = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

    if ( uB !== 0 ) {
      var ua = uaT / uB;
      var ub = ubT / uB;

      if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
        return true;
      }
    }

    return false;
  }

  // ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L521-L531
  function arrayIntersectsArray(a, b) {
    for (var i = 0; i < a.length - 1; i++) {
      for (var j = 0; j < b.length - 1; j++) {
        if (vertexIntersectsVertex(a[i], a[i + 1], b[j], b[j + 1])) {
          return true;
        }
      }
    }

    return false;
  }

  // ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L470-L480
  function coordinatesContainPoint(coordinates, point) {
    var contains = false;
    for(var i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
      if (((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1]) ||
           (coordinates[j][1] <= point[1] && point[1] < coordinates[i][1])) &&
          (point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0])) {
        contains = !contains;
      }
    }
    return contains;
  }

  // ported from terraformer-arcgis-parser.js https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L106-L113
  function coordinatesContainCoordinates(outer, inner){
    var intersects = arrayIntersectsArray(outer, inner);
    var contains = coordinatesContainPoint(outer, inner[0]);
    if(!intersects && contains){
      return true;
    }
    return false;
  }

  // do any polygons in this array contain any other polygons in this array?
  // used for checking for holes in arcgis rings
  // ported from terraformer-arcgis-parser.js https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L117-L172
  function convertRingsToGeoJSON(rings){
    var outerRings = [];
    var holes = [];
    var x; // iterator
    var outerRing; // current outer ring being evaluated
    var hole; // current hole being evaluated

    // for each ring
    for (var r = 0; r < rings.length; r++) {
      var ring = closeRing(rings[r].slice(0));
      if(ring.length < 4){
        continue;
      }
      // is this ring an outer ring? is it clockwise?
      if(ringIsClockwise(ring)){
        var polygon = [ ring ];
        outerRings.push(polygon); // push to outer rings
      } else {
        holes.push(ring); // counterclockwise push to holes
      }
    }

    var uncontainedHoles = [];

    // while there are holes left...
    while(holes.length){
      // pop a hole off out stack
      hole = holes.pop();

      // loop over all outer rings and see if they contain our hole.
      var contained = false;
      for (x = outerRings.length - 1; x >= 0; x--) {
        outerRing = outerRings[x][0];
        if(coordinatesContainCoordinates(outerRing, hole)){
          // the hole is contained push it into our polygon
          outerRings[x].push(hole);
          contained = true;
          break;
        }
      }

      // ring is not contained in any outer ring
      // sometimes this happens https://github.com/Esri/esri-leaflet/issues/320
      if(!contained){
        uncontainedHoles.push(hole);
      }
    }

    // if we couldn't match any holes using contains we can try intersects...
    while(uncontainedHoles.length){
      // pop a hole off out stack
      hole = uncontainedHoles.pop();

      // loop over all outer rings and see if any intersect our hole.
      var intersects = false;
      for (x = outerRings.length - 1; x >= 0; x--) {
        outerRing = outerRings[x][0];
        if(arrayIntersectsArray(outerRing, hole)){
          // the hole is contained push it into our polygon
          outerRings[x].push(hole);
          intersects = true;
          break;
        }
      }

      if(!intersects) {
        outerRings.push([hole.reverse()]);
      }
    }

    if(outerRings.length === 1){
      return {
        type: 'Polygon',
        coordinates: outerRings[0]
      };
    } else {
      return {
        type: 'MultiPolygon',
        coordinates: outerRings
      };
    }
  }

  // This function ensures that rings are oriented in the right directions
  // outer rings are clockwise, holes are counterclockwise
  // used for converting GeoJSON Polygons to ArcGIS Polygons
  function orientRings(poly){
    var output = [];
    var polygon = poly.slice(0);
    var outerRing = closeRing(polygon.shift().slice(0));
    if(outerRing.length >= 4){
      if(!ringIsClockwise(outerRing)){
        outerRing.reverse();
      }

      output.push(outerRing);

      for (var i = 0; i < polygon.length; i++) {
        var hole = closeRing(polygon[i].slice(0));
        if(hole.length >= 4){
          if(ringIsClockwise(hole)){
            hole.reverse();
          }
          output.push(hole);
        }
      }
    }

    return output;
  }

  // This function flattens holes in multipolygons to one array of polygons
  // used for converting GeoJSON Polygons to ArcGIS Polygons
  function flattenMultiPolygonRings(rings){
    var output = [];
    for (var i = 0; i < rings.length; i++) {
      var polygon = orientRings(rings[i]);
      for (var x = polygon.length - 1; x >= 0; x--) {
        var ring = polygon[x].slice(0);
        output.push(ring);
      }
    }
    return output;
  }

  // convert an extent (ArcGIS) to LatLngBounds (Leaflet)
  EsriLeaflet.Util.extentToBounds = function(extent){
    var sw = new L.LatLng(extent.ymin, extent.xmin);
    var ne = new L.LatLng(extent.ymax, extent.xmax);
    return new L.LatLngBounds(sw, ne);
  };

  // convert an LatLngBounds (Leaflet) to extent (ArcGIS)
  EsriLeaflet.Util.boundsToExtent = function(bounds) {
    bounds = L.latLngBounds(bounds);
    return {
      'xmin': bounds.getSouthWest().lng,
      'ymin': bounds.getSouthWest().lat,
      'xmax': bounds.getNorthEast().lng,
      'ymax': bounds.getNorthEast().lat,
      'spatialReference': {
        'wkid' : 4326
      }
    };
  };

  EsriLeaflet.Util.arcgisToGeojson = function (arcgis, idAttribute){
    var geojson = {};

    if(typeof arcgis.x === 'number' && typeof arcgis.y === 'number'){
      geojson.type = 'Point';
      geojson.coordinates = [arcgis.x, arcgis.y];
    }

    if(arcgis.points){
      geojson.type = 'MultiPoint';
      geojson.coordinates = arcgis.points.slice(0);
    }

    if(arcgis.paths) {
      if(arcgis.paths.length === 1){
        geojson.type = 'LineString';
        geojson.coordinates = arcgis.paths[0].slice(0);
      } else {
        geojson.type = 'MultiLineString';
        geojson.coordinates = arcgis.paths.slice(0);
      }
    }

    if(arcgis.rings) {
      geojson = convertRingsToGeoJSON(arcgis.rings.slice(0));
    }

    if(arcgis.geometry || arcgis.attributes) {
      geojson.type = 'Feature';
      geojson.geometry = (arcgis.geometry) ? EsriLeaflet.Util.arcgisToGeojson(arcgis.geometry) : null;
      geojson.properties = (arcgis.attributes) ? clone(arcgis.attributes) : null;
      if(arcgis.attributes) {
        geojson.id =  arcgis.attributes[idAttribute] || arcgis.attributes.OBJECTID || arcgis.attributes.FID;
      }
    }

    return geojson;
  };

  // GeoJSON -> ArcGIS
  EsriLeaflet.Util.geojsonToArcGIS = function(geojson, idAttribute){
    idAttribute = idAttribute || 'OBJECTID';
    var spatialReference = { wkid: 4326 };
    var result = {};
    var i;

    switch(geojson.type){
    case 'Point':
      result.x = geojson.coordinates[0];
      result.y = geojson.coordinates[1];
      result.spatialReference = spatialReference;
      break;
    case 'MultiPoint':
      result.points = geojson.coordinates.slice(0);
      result.spatialReference = spatialReference;
      break;
    case 'LineString':
      result.paths = [geojson.coordinates.slice(0)];
      result.spatialReference = spatialReference;
      break;
    case 'MultiLineString':
      result.paths = geojson.coordinates.slice(0);
      result.spatialReference = spatialReference;
      break;
    case 'Polygon':
      result.rings = orientRings(geojson.coordinates.slice(0));
      result.spatialReference = spatialReference;
      break;
    case 'MultiPolygon':
      result.rings = flattenMultiPolygonRings(geojson.coordinates.slice(0));
      result.spatialReference = spatialReference;
      break;
    case 'Feature':
      if(geojson.geometry) {
        result.geometry = EsriLeaflet.Util.geojsonToArcGIS(geojson.geometry, idAttribute);
      }
      result.attributes = (geojson.properties) ? clone(geojson.properties) : {};
      if(geojson.id){
        result.attributes[idAttribute] = geojson.id;
      }
      break;
    case 'FeatureCollection':
      result = [];
      for (i = 0; i < geojson.features.length; i++){
        result.push(EsriLeaflet.Util.geojsonToArcGIS(geojson.features[i], idAttribute));
      }
      break;
    case 'GeometryCollection':
      result = [];
      for (i = 0; i < geojson.geometries.length; i++){
        result.push(EsriLeaflet.Util.geojsonToArcGIS(geojson.geometries[i], idAttribute));
      }
      break;
    }

    return result;
  };

  EsriLeaflet.Util.responseToFeatureCollection = function(response, idAttribute){
    var objectIdField;

    if(idAttribute){
      objectIdField = idAttribute;
    } else if(response.objectIdFieldName){
      objectIdField = response.objectIdFieldName;
    } else if(response.fields) {
      for (var j = 0; j <= response.fields.length - 1; j++) {
        if(response.fields[j].type === 'esriFieldTypeOID') {
          objectIdField = response.fields[j].name;
          break;
        }
      }
    } else {
      objectIdField = 'OBJECTID';
    }

    var featureCollection = {
      type: 'FeatureCollection',
      features: []
    };
    var features = response.features || response.results;
    if(features.length){
      for (var i = features.length - 1; i >= 0; i--) {
        featureCollection.features.push(EsriLeaflet.Util.arcgisToGeojson(features[i], objectIdField));
      }
    }

    return featureCollection;
  };

    // trim whitespace and add a tailing slash is needed to a url
  EsriLeaflet.Util.cleanUrl = function(url){
    url = url.replace(/\s\s*/g, '');

    //add a trailing slash to the url if the user omitted it
    if(url[url.length-1] !== '/'){
      url += '/';
    }

    return url;
  };

  EsriLeaflet.Util.geojsonTypeToArcGIS = function (geoJsonType) {
    var arcgisGeometryType;
    switch (geoJsonType) {
    case 'Point':
      arcgisGeometryType = 'esriGeometryPoint';
      break;
    case 'MultiPoint':
      arcgisGeometryType = 'esriGeometryMultipoint';
      break;
    case 'LineString':
      arcgisGeometryType = 'esriGeometryPolyline';
      break;
    case 'MultiLineString':
      arcgisGeometryType = 'esriGeometryPolyline';
      break;
    case 'Polygon':
      arcgisGeometryType = 'esriGeometryPolygon';
      break;
    case 'MultiPolygon':
      arcgisGeometryType = 'esriGeometryPolygon';
      break;
    }
    return arcgisGeometryType;
  };

})(EsriLeaflet);

(function(EsriLeaflet){

  var callbacks = 0;

  window._EsriLeafletCallbacks = {};

  function serialize(params){
    var data = '';

    params.f = 'json';

    for (var key in params){
      if(params.hasOwnProperty(key)){
        var param = params[key];
        var type = Object.prototype.toString.call(param);
        var value;

        if(data.length){
          data += '&';
        }

        if(type === '[object Array]' || type === '[object Object]'){
          value = JSON.stringify(param);
        } else if (type === '[object Date]'){
          value = param.valueOf();
        } else {
          value = param;
        }

        data += encodeURIComponent(key) + '=' + encodeURIComponent(value);
      }
    }

    return data;
  }

  function createRequest(callback, context){
    var httpRequest = new XMLHttpRequest();

    httpRequest.onerror = function(e) {
      callback.call(context, {
        error: {
          code: 500,
          message: 'XMLHttpRequest error'
        }
      }, null);
    };

    httpRequest.onreadystatechange = function(){
      var response;
      var error;

      if (httpRequest.readyState === 4) {
        try {
          response = JSON.parse(httpRequest.responseText);
        } catch(e) {
          response = null;
          error = {
            code: 500,
            message: 'Could not parse response as JSON.'
          };
        }

        if (!error && response.error) {
          error = response.error;
          response = null;
        }

        callback.call(context, error, response);
      }
    };

    return httpRequest;
  }

  // AJAX handlers for CORS (modern browsers) or JSONP (older browsers)
  EsriLeaflet.Request = {
    request: function(url, params, callback, context){
      var paramString = serialize(params);
      var httpRequest = createRequest(callback, context);
      var requestLength = (url + '?' + paramString).length;

      // request is less then 2000 characters and the browser supports CORS, make GET request with XMLHttpRequest
      if(requestLength <= 2000 && L.esri.Support.CORS){
        httpRequest.open('GET', url + '?' + paramString);
        httpRequest.send(null);

      // request is less more then 2000 characters and the browser supports CORS, make POST request with XMLHttpRequest
      } else if (requestLength > 2000 && L.esri.Support.CORS){
        httpRequest.open('POST', url);
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        httpRequest.send(paramString);

      // request is less more then 2000 characters and the browser does not support CORS, make a JSONP request
      } else if(requestLength <= 2000 && !L.esri.Support.CORS){
        return L.esri.Request.get.JSONP(url, params, callback, context);

      // request is longer then 2000 characters and the browser does not support CORS, log a warning
      } else {
        if(console && console.warn){
          console.warn('a request to ' + url + ' was longer then 2000 characters and this browser cannot make a cross-domain post request. Please use a proxy http://esri.github.io/esri-leaflet/api-reference/request.html');
          return;
        }
      }

      return httpRequest;
    },
    post: {
      XMLHTTP: function (url, params, callback, context) {
        var httpRequest = createRequest(callback, context);
        httpRequest.open('POST', url);
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        httpRequest.send(serialize(params));

        return httpRequest;
      }
    },

    get: {
      CORS: function (url, params, callback, context) {
        var httpRequest = createRequest(callback, context);

        httpRequest.open('GET', url + '?' + serialize(params), true);
        httpRequest.send(null);

        return httpRequest;
      },
      JSONP: function(url, params, callback, context){
        var callbackId = 'c' + callbacks;

        params.callback = 'window._EsriLeafletCallbacks.' + callbackId;

        var script = L.DomUtil.create('script', null, document.body);
        script.type = 'text/javascript';
        script.src = url + '?' +  serialize(params);
        script.id = callbackId;

        window._EsriLeafletCallbacks[callbackId] = function(response){
          if(window._EsriLeafletCallbacks[callbackId] !== true){
            var error;
            var responseType = Object.prototype.toString.call(response);

            if(!(responseType === '[object Object]' || responseType === '[object Array]')){
              error = {
                error: {
                  code: 500,
                  message: 'Expected array or object as JSONP response'
                }
              };
              response = null;
            }

            if (!error && response.error) {
              error = response;
              response = null;
            }

            callback.call(context, error, response);
            window._EsriLeafletCallbacks[callbackId] = true;
          }
        };

        callbacks++;

        return {
          id: callbackId,
          url: script.src,
          abort: function(){
            window._EsriLeafletCallbacks._callback[callbackId]({
              code: 0,
              message: 'Request aborted.'
            });
          }
        };
      }
    }
  };

  // Choose the correct AJAX handler depending on CORS support
  EsriLeaflet.get = (EsriLeaflet.Support.CORS) ? EsriLeaflet.Request.get.CORS : EsriLeaflet.Request.get.JSONP;

  // Always use XMLHttpRequest for posts
  EsriLeaflet.post = EsriLeaflet.Request.post.XMLHTTP;

  // expose a common request method the uses GET\POST based on request length
  EsriLeaflet.request = EsriLeaflet.Request.request;

})(EsriLeaflet);

EsriLeaflet.Services.Service = L.Class.extend({

  includes: L.Mixin.Events,

  options: {
    proxy: false,
    useCors: EsriLeaflet.Support.CORS
  },

  initialize: function (url, options) {
    this.url = EsriLeaflet.Util.cleanUrl(url);
    this._requestQueue = [];
    this._authenticating = false;
    L.Util.setOptions(this, options);
  },

  get: function (path, params, callback, context) {
    return this._request('get', path, params, callback, context);
  },

  post: function (path, params, callback, context) {
    return this._request('post', path, params, callback, context);
  },

  request: function (path, params, callback, context) {
    return this._request('request', path, params, callback, context);
  },

  metadata: function (callback, context) {
    return this._request('get', '', {}, callback, context);
  },

  authenticate: function(token){
    this._authenticating = false;
    this.options.token = token;
    this._runQueue();
    return this;
  },

  _request: function(method, path, params, callback, context){
    this.fire('requeststart', {
      url: this.url + path,
      params: params,
      method: method
    });

    var wrappedCallback = this._createServiceCallback(method, path, params, callback, context);

    if (this.options.token) {
      params.token = this.options.token;
    }

    if (this._authenticating) {
      this._requestQueue.push([method, path, params, callback, context]);
      return;
    } else {
      var url = (this.options.proxy) ? this.options.proxy + '?' + this.url + path : this.url + path;

      if((method === 'get' || method === 'request') && !this.options.useCors){
        return EsriLeaflet.Request.get.JSONP(url, params, wrappedCallback);
      } else {
        return EsriLeaflet[method](url, params, wrappedCallback);
      }
    }
  },

  _createServiceCallback: function(method, path, params, callback, context){
    var request = [method, path, params, callback, context];

    return L.Util.bind(function(error, response){

      if (error && (error.code === 499 || error.code === 498)) {
        this._authenticating = true;

        this._requestQueue.push(request);

        this.fire('authenticationrequired', {
          authenticate: L.Util.bind(this.authenticate, this)
        });
      } else {
        callback.call(context, error, response);

        if(error) {
          this.fire('requesterror', {
            url: this.url + path,
            params: params,
            message: error.message,
            code: error.code,
            method: method
          });
        } else {
          this.fire('requestsuccess', {
            url: this.url + path,
            params: params,
            response: response,
            method: method
          });
        }

        this.fire('requestend', {
          url: this.url + path,
          params: params,
          method: method
        });
      }
    }, this);
  },

  _runQueue: function(){
    for (var i = this._requestQueue.length - 1; i >= 0; i--) {
      var request = this._requestQueue[i];
      var method = request.shift();
      this[method].apply(this, request);
    }
    this._requestQueue = [];
  }

});

EsriLeaflet.Services.service = function(url, params){
  return new EsriLeaflet.Services.Service(url, params);
};

EsriLeaflet.Services.MapService = EsriLeaflet.Services.Service.extend({

  identify: function () {
    return new EsriLeaflet.Tasks.identifyFeatures(this);
  },

  find: function () {
    return new EsriLeaflet.Tasks.Find(this);
  },

  query: function () {
    return new EsriLeaflet.Tasks.Query(this);
  }

});

EsriLeaflet.Services.mapService = function(url, params){
  return new EsriLeaflet.Services.MapService(url, params);
};

EsriLeaflet.Tasks.Task = L.Class.extend({

  options: {
    proxy: false,
    useCors: EsriLeaflet.Support.CORS
  },

  //Generate a method for each methodName:paramName in the setters for this task.
  generateSetter: function(param, context){
    var isArray = param.match(/([a-zA-Z]+)\[\]/);

    param = (isArray) ? isArray[1] : param;

    if(isArray){
      return L.Util.bind(function(value){
        // this.params[param] = (this.params[param]) ? this.params[param] + ',' : '';
        if (L.Util.isArray(value)) {
          this.params[param] = value.join(',');
        } else {
          this.params[param] = value;
        }
        return this;
      }, context);
    } else {
      return L.Util.bind(function(value){
        this.params[param] = value;
        return this;
      }, context);
    }
  },

  initialize: function(endpoint, options){
    // endpoint can be either a url to an ArcGIS Rest Service or an instance of EsriLeaflet.Service
    if(endpoint.url && endpoint.request){
      this._service = endpoint;
      this.url = endpoint.url;
    } else {
      this.url = EsriLeaflet.Util.cleanUrl(endpoint);
    }

    // clone default params into this object
    this.params = L.Util.extend({}, this.params || {});

    // generate setter methods based on the setters object implimented a child class
    if(this.setters){
      for (var setter in this.setters){
        var param = this.setters[setter];
        this[setter] = this.generateSetter(param, this);
      }
    }

    L.Util.setOptions(this, options);
  },

  token: function(token){
    if(this._service){
      this._service.authenticate(token);
    } else {
      this.params.token = token;
    }
    return this;
  },

  request: function(callback, context){
    if(this._service){
      return this._service.request(this.path, this.params, callback, context);
    } else {
      return this._request('request', this.path, this.params, callback, context);
    }
  },

  _request: function(method, path, params, callback, context){
    var url = (this.options.proxy) ? this.options.proxy + '?' + this.url + path : this.url + path;
    if((method === 'get' || method === 'request') && !this.options.useCors){
      return EsriLeaflet.Request.get.JSONP(url, params, callback, context);
    } else{
      return EsriLeaflet[method](url, params, callback, context);
    }
  }
});

EsriLeaflet.Tasks.Identify = EsriLeaflet.Tasks.Task.extend({
  path: 'identify',

  between: function(start, end){
    this.params.time = ([start.valueOf(), end.valueOf()]).join(',');
    return this;
  },

  returnGeometry: function (returnGeometry) {
    this.params.returnGeometry = returnGeometry;
    return this;
  }
});


EsriLeaflet.Tasks.IdentifyFeatures = EsriLeaflet.Tasks.Identify.extend({
  setters: {
    'layers': 'layers',
    'precision': 'geometryPrecision',
    'tolerance': 'tolerance'
  },

  params: {
    sr: 4326,
    layers: 'all',
    tolerance: 3,
    returnGeometry: true
  },

  on: function(map){
    var extent = EsriLeaflet.Util.boundsToExtent(map.getBounds());
    var size = map.getSize();
    this.params.imageDisplay = [size.x, size.y, 96].join(',');
    this.params.mapExtent=([extent.xmin, extent.ymin, extent.xmax, extent.ymax]).join(',');
    return this;
  },

  at: function(latlng){
    latlng = L.latLng(latlng);
    this.params.geometry = ([latlng.lng, latlng.lat]).join(',');
    this.params.geometryType = 'esriGeometryPoint';
    return this;
  },

  layerDef: function (id, where){
    this.params.layerDefs = (this.params.layerDefs) ? this.params.layerDefs + ';' : '';
    this.params.layerDefs += ([id, where]).join(':');
    return this;
  },

  simplify: function(map, factor){
    var mapWidth = Math.abs(map.getBounds().getWest() - map.getBounds().getEast());
    this.params.maxAllowableOffset = (mapWidth / map.getSize().y) * (1 - factor);
    return this;
  },

  run: function (callback, context){
    return this.request(function(error, response){
      callback.call(context, error, (response && EsriLeaflet.Util.responseToFeatureCollection(response)), response);
    }, context);
  }

});

EsriLeaflet.Tasks.identifyFeatures = function(url, params){
  return new EsriLeaflet.Tasks.IdentifyFeatures(url, params);
};

EsriLeaflet.Tasks.Query = EsriLeaflet.Tasks.Task.extend({
  setters: {
    'offset': 'offset',
    'limit': 'limit',
    'outFields': 'fields[]',
    'precision': 'geometryPrecision',
    'featureIds': 'objectIds[]',
    'returnGeometry': 'returnGeometry',
    'token': 'token'
  },

  path: 'query',

  params: {
    returnGeometry: true,
    where: '1=1',
    outSr: 4326,
    outFields: '*'
  },

  within: function(geometry){
    this._setGeometry(geometry);
    this.params.spatialRel = 'esriSpatialRelContains'; // will make code read layer within geometry, to the api this will reads geometry contains layer
    return this;
  },

  intersects: function(geometry){
    this._setGeometry(geometry);
    this.params.spatialRel = 'esriSpatialRelIntersects';
    return this;
  },

  contains: function(geometry){
    this._setGeometry(geometry);
    this.params.spatialRel = 'esriSpatialRelWithin'; // will make code read layer contains geometry, to the api this will reads geometry within layer
    return this;
  },

  // crosses: function(geometry){
  //   this._setGeometry(geometry);
  //   this.params.spatialRel = 'esriSpatialRelCrosses';
  //   return this;
  // },

  // touches: function(geometry){
  //   this._setGeometry(geometry);
  //   this.params.spatialRel = 'esriSpatialRelTouches';
  //   return this;
  // },

  overlaps: function(geometry){
    this._setGeometry(geometry);
    this.params.spatialRel = 'esriSpatialRelOverlaps';
    return this;
  },

  // only valid for Feature Services running on ArcGIS Server 10.3 or ArcGIS Online
  nearby: function(latlng, radius){
    latlng = L.latLng(latlng);
    this.params.geometry = ([latlng.lng,latlng.lat]).join(',');
    this.params.geometryType = 'esriGeometryPoint';
    this.params.spatialRel = 'esriSpatialRelIntersects';
    this.params.units = 'esriSRUnit_Meter';
    this.params.distance = radius;
    this.params.inSr = 4326;
    return this;
  },

  where: function(string){
    this.params.where = string.replace(/"/g, "\'"); // jshint ignore:line
    return this;
  },

  between: function(start, end){
    this.params.time = ([start.valueOf(), end.valueOf()]).join();
    return this;
  },

  fields: function (fields) {
    if (L.Util.isArray(fields)) {
      this.params.outFields = fields.join(',');
    } else {
      this.params.outFields = fields;
    }
    return this;
  },

  simplify: function(map, factor){
    var mapWidth = Math.abs(map.getBounds().getWest() - map.getBounds().getEast());
    this.params.maxAllowableOffset = (mapWidth / map.getSize().y) * factor;
    return this;
  },

  orderBy: function(fieldName, order){
    order = order || 'ASC';
    this.params.orderByFields = (this.params.orderByFields) ? this.params.orderByFields + ',' : '';
    this.params.orderByFields += ([fieldName, order]).join(' ');
    return this;
  },

  returnGeometry: function(bool){
    this.params.returnGeometry = bool;
    return this;
  },

  run: function(callback, context){
    this._cleanParams();
    return this.request(function(error, response){
      callback.call(context, error, (response && EsriLeaflet.Util.responseToFeatureCollection(response)), response);
    }, context);
  },

  count: function(callback, context){
    this._cleanParams();
    this.params.returnCountOnly = true;
    return this.request(function(error, response){
      callback.call(this, error, (response && response.count), response);
    }, context);
  },

  ids: function(callback, context){
    this._cleanParams();
    this.params.returnIdsOnly = true;
    return this.request(function(error, response){
      callback.call(this, error, (response && response.objectIds), response);
    }, context);
  },

  // only valid for Feature Services running on ArcGIS Server 10.3 or ArcGIS Online
  bounds: function(callback, context){
    this._cleanParams();
    this.params.returnExtentOnly = true;
    return this.request(function(error, response){
      callback.call(context, error, (response && response.extent && EsriLeaflet.Util.extentToBounds(response.extent)), response);
    }, context);
  },

  // only valid for image services
  pixelSize: function(point){
    point = L.point(point);
    this.params.pixelSize = ([point.x,point.y]).join(',');
    return this;
  },

  // only valid for map services
  layer: function(layer){
    this.path = layer + '/query';
    return this;
  },

  _cleanParams: function(){
    delete this.params.returnIdsOnly;
    delete this.params.returnExtentOnly;
    delete this.params.returnCountOnly;
  },

  _setGeometry: function(geometry) {
    this.params.inSr = 4326;

    // convert bounds to extent and finish
    if ( geometry instanceof L.LatLngBounds ) {
      // set geometry + geometryType
      this.params.geometry = EsriLeaflet.Util.boundsToExtent(geometry);
      this.params.geometryType = 'esriGeometryEnvelope';
      return;
    }

    // convert L.Marker > L.LatLng
    if(geometry.getLatLng){
      geometry = geometry.getLatLng();
    }

    // convert L.LatLng to a geojson point and continue;
    if (geometry instanceof L.LatLng) {
      geometry = {
        type: 'Point',
        coordinates: [geometry.lng, geometry.lat]
      };
    }

    // handle L.GeoJSON, pull out the first geometry
    if ( geometry instanceof L.GeoJSON ) {
      //reassign geometry to the GeoJSON value  (we are assuming that only one feature is present)
      geometry = geometry.getLayers()[0].feature.geometry;
      this.params.geometry = EsriLeaflet.Util.geojsonToArcGIS(geometry);
      this.params.geometryType = EsriLeaflet.Util.geojsonTypeToArcGIS(geometry.type);
    }

    // Handle L.Polyline and L.Polygon
    if (geometry.toGeoJSON) {
      geometry = geometry.toGeoJSON();
    }

    // handle GeoJSON feature by pulling out the geometry
    if ( geometry.type === 'Feature' ) {
      // get the geometry of the geojson feature
      geometry = geometry.geometry;
    }

    // confirm that our GeoJSON is a point, line or polygon
    if ( geometry.type === 'Point' ||  geometry.type === 'LineString' || geometry.type === 'Polygon') {
      this.params.geometry = EsriLeaflet.Util.geojsonToArcGIS(geometry);
      this.params.geometryType = EsriLeaflet.Util.geojsonTypeToArcGIS(geometry.type);
      return;
    }

    // warn the user if we havn't found a
    /* global console */
    if(console && console.warn) {
      console.warn('invalid geometry passed to spatial query. Should be an L.LatLng, L.LatLngBounds or L.Marker or a GeoJSON Point Line or Polygon object');
    }

    return;
  }
});

EsriLeaflet.Tasks.query = function(url, params){
  return new EsriLeaflet.Tasks.Query(url, params);
};

EsriLeaflet.Tasks.Find = EsriLeaflet.Tasks.Task.extend({
  setters: {
    // method name > param name
    'contains': 'contains',
    'text': 'searchText',
    'fields': 'searchFields[]', // denote an array or single string
    'spatialReference': 'sr',
    'sr': 'sr',
    'layers': 'layers[]',
    'returnGeometry': 'returnGeometry',
    'maxAllowableOffset': 'maxAllowableOffset',
    'precision': 'geometryPrecision',
    'dynamicLayers': 'dynamicLayers',
    'returnZ' : 'returnZ',
    'returnM' : 'returnM',
    'gdbVersion' : 'gdbVersion',
    'token' : 'token'
  },

  path: 'find',

  params: {
    sr: 4326,
    contains: true,
    returnGeometry: true,
    returnZ: true,
    returnM: false
  },

  layerDefs: function (id, where) {
    this.params.layerDefs = (this.params.layerDefs) ? this.params.layerDefs + ';' : '';
    this.params.layerDefs += ([id, where]).join(':');
    return this;
  },

  simplify: function(map, factor){
    var mapWidth = Math.abs(map.getBounds().getWest() - map.getBounds().getEast());
    this.params.maxAllowableOffset = (mapWidth / map.getSize().y) * factor;
    return this;
  },

  run: function (callback, context) {
    return this.request(function(error, response){
      callback.call(context, error, (response && EsriLeaflet.Util.responseToFeatureCollection(response)), response);
    }, context);
  }
});

EsriLeaflet.Tasks.find = function (url, params) {
  return new EsriLeaflet.Tasks.Find(url, params);
};

EsriLeaflet.Layers.RasterLayer =  L.Class.extend({
  includes: L.Mixin.Events,

  options: {
    opacity: 1,
    position: 'front',
    f: 'image'
  },

  onAdd: function (map) {
    this._map = map;

    this._update = L.Util.limitExecByInterval(this._update, this.options.updateInterval, this);

    if (map.options.crs && map.options.crs.code) {
      var sr = map.options.crs.code.split(':')[1];
      this.options.bboxSR = sr;
      this.options.imageSR = sr;
    }

    map.on('moveend', this._update, this);

    // if we had an image loaded and it matches the
    // current bounds show the image otherwise remove it
    if(this._currentImage && this._currentImage._bounds.equals(this._map.getBounds())){
      map.addLayer(this._currentImage);
    } else if(this._currentImage) {
      this._map.removeLayer(this._currentImage);
      this._currentImage = null;
    }

    this._update();

    if(this._popup){
      this._map.on('click', this._getPopupData, this);
      this._map.on('dblclick', this._resetPopupState, this);
    }
  },

  bindPopup: function(fn, popupOptions){
    this._shouldRenderPopup = false;
    this._lastClick = false;
    this._popup = L.popup(popupOptions);
    this._popupFunction = fn;
    if(this._map){
      this._map.on('click', this._getPopupData, this);
      this._map.on('dblclick', this._resetPopupState, this);
    }
    return this;
  },

  unbindPopup: function(){
    if(this._map){
      this._map.closePopup(this._popup);
      this._map.off('click', this._getPopupData, this);
      this._map.off('dblclick', this._resetPopupState, this);
    }
    this._popup = false;
    return this;
  },

  onRemove: function (map) {
    if (this._currentImage) {
      this._map.removeLayer(this._currentImage);
    }

    if(this._popup){
      this._map.off('click', this._getPopupData, this);
      this._map.off('dblclick', this._resetPopupState, this);
    }

    this._map.off('moveend', this._update, this);
    this._map = null;
  },

  addTo: function(map){
    map.addLayer(this);
    return this;
  },

  removeFrom: function(map){
    map.removeLayer(this);
    return this;
  },

  bringToFront: function(){
    this.options.position = 'front';
    if(this._currentImage){
      this._currentImage.bringToFront();
    }
    return this;
  },

  bringToBack: function(){
    this.options.position = 'back';
    if(this._currentImage){
      this._currentImage.bringToBack();
    }
    return this;
  },

  getAttribution: function () {
    return this.options.attribution;
  },

  getOpacity: function(){
    return this.options.opacity;
  },

  setOpacity: function(opacity){
    this.options.opacity = opacity;
    this._currentImage.setOpacity(opacity);
    return this;
  },

  getTimeRange: function(){
    return [this.options.from, this.options.to];
  },

  setTimeRange: function(from, to){
    this.options.from = from;
    this.options.to = to;
    this._update();
    return this;
  },

  metadata: function(callback, context){
    this._service.metadata(callback, context);
    return this;
  },

  authenticate: function(token){
    this._service.authenticate(token);
    return this;
  },

  _renderImage: function(url, bounds){
    if(this._map){
      // create a new image overlay and add it to the map
      // to start loading the image
      // opacity is 0 while the image is loading
      var image = new L.ImageOverlay(url, bounds, {
        opacity: 0
      }).addTo(this._map);

      // once the image loads
      image.once('load', function(e){
        var newImage = e.target;
        var oldImage = this._currentImage;

        // if the bounds of this image matches the bounds that
        // _renderImage was called with and we have a map
        // hide the old image if there is one and set the opacity
        // of the new image otherwise remove the new image
        if(newImage._bounds.equals(bounds)){
          this._currentImage = newImage;

          if(this.options.position === 'front'){
            this.bringToFront();
          } else {
            this.bringToBack();
          }

          if(this._map && this._currentImage._map){
            this._currentImage.setOpacity(this.options.opacity);
          } else {
            this._currentImage._map.removeLayer(this._currentImage);
          }

          if(oldImage && this._map) {
            this._map.removeLayer(oldImage);
          }

          if(oldImage && oldImage._map){
            oldImage._map.removeLayer(oldImage);
          }
        } else {
          this._map.removeLayer(newImage);
        }

        this.fire('load', {
          bounds: bounds
        });

      }, this);

      this.fire('loading', {
        bounds: bounds
      });
    }
  },

  _update: function () {
    if(!this._map){
      return;
    }

    var zoom = this._map.getZoom();
    var bounds = this._map.getBounds();

    if(this._animatingZoom){
      return;
    }

    if (this._map._panTransition && this._map._panTransition._inProgress) {
      return;
    }

    if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
      return;
    }
    var params = this._buildExportParams();

    this._requestExport(params, bounds);
  },

  // TODO: refactor these into raster layer
  _renderPopup: function(latlng, error, results, response){
    latlng = L.latLng(latlng);
    if(this._shouldRenderPopup && this._lastClick.equals(latlng)){
      //add the popup to the map where the mouse was clicked at
      var content = this._popupFunction(error, results, response);
      if (content) {
        this._popup.setLatLng(latlng).setContent(content).openOn(this._map);
      }
    }
  },

  _resetPopupState: function(e){
    this._shouldRenderPopup = false;
    this._lastClick = e.latlng;
  },

  // from https://github.com/Leaflet/Leaflet/blob/v0.7.2/src/layer/FeatureGroup.js
  // @TODO remove at Leaflet 0.8
  _propagateEvent: function (e) {
    e = L.extend({
      layer: e.target,
      target: this
    }, e);
    this.fire(e.type, e);
  }
});

EsriLeaflet.Layers.DynamicMapLayer = EsriLeaflet.Layers.RasterLayer.extend({

  options: {
    updateInterval: 150,
    layers: false,
    layerDefs: false,
    timeOptions: false,
    format: 'png24',
    transparent: true
  },

  initialize: function (url, options) {
    this.url = EsriLeaflet.Util.cleanUrl(url);
    this._service = new EsriLeaflet.Services.MapService(this.url, options);
    this._service.on('authenticationrequired requeststart requestend requesterror requestsuccess', this._propagateEvent, this);
    L.Util.setOptions(this, options);
  },

  getLayers: function(){
    return this.options.layers;
  },

  setLayers: function(layers){
    this.options.layers = layers;
    this._update();
    return this;
  },

  getLayerDefs: function(){
    return this.options.layerDefs;
  },

  setLayerDefs: function(layerDefs){
    this.options.layerDefs = layerDefs;
    this._update();
    return this;
  },

  getTimeOptions: function(){
    return this.options.timeOptions;
  },

  setTimeOptions: function(timeOptions){
    this.options.timeOptions = timeOptions;
    this._update();
    return this;
  },

  query: function(){
    return this._service.query();
  },

  identify: function(){
    return this._service.identify();
  },

  find: function(){
    return this._service.find();
  },

  _getPopupData: function(e){
    var callback = L.Util.bind(function(error, featureCollection, response) {
      setTimeout(L.Util.bind(function(){
        this._renderPopup(e.latlng, error, featureCollection, response);
      }, this), 300);
    }, this);

    var identifyRequest = this.identify().on(this._map).at(e.latlng);

    if(this.options.layers){
      identifyRequest.layers('visible:' + this.options.layers.join(','));
    } else {
      identifyRequest.layers('visible');
    }

    identifyRequest.run(callback);

    // set the flags to show the popup
    this._shouldRenderPopup = true;
    this._lastClick = e.latlng;
  },

  _buildExportParams: function () {
    var bounds = this._map.getBounds();
    var size = this._map.getSize();
    var ne = this._map.options.crs.project(bounds._northEast);
    var sw = this._map.options.crs.project(bounds._southWest);

    var params = {
      bbox: [sw.x, sw.y, ne.x, ne.y].join(','),
      size: size.x + ',' + size.y,
      dpi: 96,
      format: this.options.format,
      transparent: this.options.transparent,
      bboxSR: this.options.bboxSR,
      imageSR: this.options.imageSR
    };

    if(this.options.layers){
      params.layers = 'show:' + this.options.layers.join(',');
    }

    if(this.options.layerDefs){
      params.layerDefs = JSON.stringify(this.options.layerDefs);
    }

    if(this.options.timeOptions){
      params.timeOptions = JSON.stringify(this.options.timeOptions);
    }

    if(this.options.from && this.options.to){
      params.time = this.options.from.valueOf() + ',' + this.options.to.valueOf();
    }

    if(this._service.options.token) {
      params.token = this._service.options.token;
    }

    return params;
  },

  _requestExport: function (params, bounds) {
    if(this.options.f === 'json'){
      this._service.get('export', params, function(error, response){
        this._renderImage(response.href, bounds);
      }, this);
    } else {
      params.f = 'image';
      this._renderImage(this.url + 'export' + L.Util.getParamString(params), bounds);
    }
  }
});

EsriLeaflet.DynamicMapLayer = EsriLeaflet.Layers.DynamicMapLayer;

EsriLeaflet.Layers.dynamicMapLayer = function(url, options){
  return new EsriLeaflet.Layers.DynamicMapLayer(url, options);
};

EsriLeaflet.dynamicMapLayer = function(url, options){
  return new EsriLeaflet.Layers.DynamicMapLayer(url, options);
};

EsriLeaflet.Layers.TiledMapLayer = L.TileLayer.extend({
  initialize: function(url, options){
    options = L.Util.setOptions(this, options);

    // set the urls
    this.url = L.esri.Util.cleanUrl(url);
    this.tileUrl = L.esri.Util.cleanUrl(url) + 'tile/{z}/{y}/{x}';
    this._service = new L.esri.Services.MapService(this.url, options);
    this._service.on('authenticationrequired requeststart requestend requesterror requestsuccess', this._propagateEvent, this);

    //if this is looking at the AGO tiles subdomain insert the subdomain placeholder
    if(this.tileUrl.match('://tiles.arcgisonline.com')){
      this.tileUrl = this.tileUrl.replace('://tiles.arcgisonline.com', '://tiles{s}.arcgisonline.com');
      options.subdomains = ['1', '2', '3', '4'];
    }

    if(this.options.token) {
      this.tileUrl += ('?token=' + this.options.token);
    }

    // init layer by calling TileLayers initialize method
    L.TileLayer.prototype.initialize.call(this, this.tileUrl, options);
  },

  metadata: function(callback, context){
    this._service.metadata(callback, context);
    return this;
  },

  identify: function(){
    return this._service.identify();
  },

  authenticate: function(token){
    var tokenQs = '?token=' + token;
    this.tileUrl = (this.options.token) ? this.tileUrl.replace(/\?token=(.+)/g, tokenQs) : this.tileUrl + tokenQs;
    this.options.token = token;
    this._service.authenticate(token);
    return this;
  },

  // from https://github.com/Leaflet/Leaflet/blob/v0.7.2/src/layer/FeatureGroup.js
  // @TODO remove at Leaflet 0.8
  _propagateEvent: function (e) {
    e = L.extend({
      layer: e.target,
      target: this
    }, e);
    this.fire(e.type, e);
  }
});

L.esri.TiledMapLayer = L.esri.Layers.tiledMapLayer;

L.esri.Layers.tiledMapLayer = function(url, options){
  return new L.esri.Layers.TiledMapLayer(url, options);
};

L.esri.tiledMapLayer = function(url, options){
  return new L.esri.Layers.TiledMapLayer(url, options);
};

  return EsriLeaflet;
}));
//# sourceMappingURL=esri-leaflet-map-service-src.js.map