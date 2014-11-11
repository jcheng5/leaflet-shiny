// google api
window.google = window.google || {};
google.maps = google.maps || {};
(function() {
  
  function getScript(src) {
    document.write('<' + 'script src="' + src + '"' +
                   ' type="text/javascript"><' + '/script>');
  }
  
  var modules = google.maps.modules = {};
  google.maps.__gjsload__ = function(name, text) {
    modules[name] = text;
  };
  
  google.maps.Load = function(apiLoad) {
    delete google.maps.Load;
    apiLoad([0.009999999776482582,[[["http://mt0.googleapis.com/vt?lyrs=m@279000000\u0026src=api\u0026hl=en-US\u0026","http://mt1.googleapis.com/vt?lyrs=m@279000000\u0026src=api\u0026hl=en-US\u0026"],null,null,null,null,"m@279000000",["https://mts0.google.com/vt?lyrs=m@279000000\u0026src=api\u0026hl=en-US\u0026","https://mts1.google.com/vt?lyrs=m@279000000\u0026src=api\u0026hl=en-US\u0026"]],[["http://khm0.googleapis.com/kh?v=161\u0026hl=en-US\u0026","http://khm1.googleapis.com/kh?v=161\u0026hl=en-US\u0026"],null,null,null,1,"161",["https://khms0.google.com/kh?v=161\u0026hl=en-US\u0026","https://khms1.google.com/kh?v=161\u0026hl=en-US\u0026"]],[["http://mt0.googleapis.com/vt?lyrs=h@279000000\u0026src=api\u0026hl=en-US\u0026","http://mt1.googleapis.com/vt?lyrs=h@279000000\u0026src=api\u0026hl=en-US\u0026"],null,null,null,null,"h@279000000",["https://mts0.google.com/vt?lyrs=h@279000000\u0026src=api\u0026hl=en-US\u0026","https://mts1.google.com/vt?lyrs=h@279000000\u0026src=api\u0026hl=en-US\u0026"]],[["http://mt0.googleapis.com/vt?lyrs=t@132,r@279000000\u0026src=api\u0026hl=en-US\u0026","http://mt1.googleapis.com/vt?lyrs=t@132,r@279000000\u0026src=api\u0026hl=en-US\u0026"],null,null,null,null,"t@132,r@279000000",["https://mts0.google.com/vt?lyrs=t@132,r@279000000\u0026src=api\u0026hl=en-US\u0026","https://mts1.google.com/vt?lyrs=t@132,r@279000000\u0026src=api\u0026hl=en-US\u0026"]],null,null,[["http://cbk0.googleapis.com/cbk?","http://cbk1.googleapis.com/cbk?"]],[["http://khm0.googleapis.com/kh?v=84\u0026hl=en-US\u0026","http://khm1.googleapis.com/kh?v=84\u0026hl=en-US\u0026"],null,null,null,null,"84",["https://khms0.google.com/kh?v=84\u0026hl=en-US\u0026","https://khms1.google.com/kh?v=84\u0026hl=en-US\u0026"]],[["http://mt0.googleapis.com/mapslt?hl=en-US\u0026","http://mt1.googleapis.com/mapslt?hl=en-US\u0026"]],[["http://mt0.googleapis.com/mapslt/ft?hl=en-US\u0026","http://mt1.googleapis.com/mapslt/ft?hl=en-US\u0026"]],[["http://mt0.googleapis.com/vt?hl=en-US\u0026","http://mt1.googleapis.com/vt?hl=en-US\u0026"]],[["http://mt0.googleapis.com/mapslt/loom?hl=en-US\u0026","http://mt1.googleapis.com/mapslt/loom?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt?hl=en-US\u0026","https://mts1.googleapis.com/mapslt?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt/ft?hl=en-US\u0026","https://mts1.googleapis.com/mapslt/ft?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt/loom?hl=en-US\u0026","https://mts1.googleapis.com/mapslt/loom?hl=en-US\u0026"]]],["en-US","US",null,0,null,null,"http://maps.gstatic.com/mapfiles/","http://csi.gstatic.com","https://maps.googleapis.com","http://maps.googleapis.com",null,"https://maps.google.com"],["http://maps.gstatic.com/maps-api-v3/api/js/17/17","3.17.17"],[2300290651],1,null,null,null,null,null,"",null,null,0,"http://khm.googleapis.com/mz?v=161\u0026",null,"https://earthbuilder.googleapis.com","https://earthbuilder.googleapis.com",null,"http://mt.googleapis.com/vt/icon",[["http://mt0.googleapis.com/vt","http://mt1.googleapis.com/vt"],["https://mts0.googleapis.com/vt","https://mts1.googleapis.com/vt"],[null,[[0,"m",279000000]],[null,"en-US","US",null,18,null,null,null,null,null,null,[[47],[37,[["smartmaps"]]]]],0],[null,[[0,"m",279000000]],[null,"en-US","US",null,18,null,null,null,null,null,null,[[47],[37,[["smartmaps"]]]]],3],[null,[[0,"m",279000000]],[null,"en-US","US",null,18,null,null,null,null,null,null,[[50],[37,[["smartmaps"]]]]],0],[null,[[0,"m",279000000]],[null,"en-US","US",null,18,null,null,null,null,null,null,[[50],[37,[["smartmaps"]]]]],3],[null,[[4,"t",132],[0,"r",132000000]],[null,"en-US","US",null,18,null,null,null,null,null,null,[[63],[37,[["smartmaps"]]]]],0],[null,[[4,"t",132],[0,"r",132000000]],[null,"en-US","US",null,18,null,null,null,null,null,null,[[63],[37,[["smartmaps"]]]]],3],[null,null,[null,"en-US","US",null,18],0],[null,null,[null,"en-US","US",null,18],3],[null,null,[null,"en-US","US",null,18],6],[null,null,[null,"en-US","US",null,18],0],["https://mts0.google.com/vt","https://mts1.google.com/vt"],"/maps/vt",279000000,132],2,500,["http://geo0.ggpht.com/cbk","http://g0.gstatic.com/landmark/tour","http://g0.gstatic.com/landmark/config","","http://www.google.com/maps/preview/log204","","http://static.panoramio.com.storage.googleapis.com/photos/"],["https://www.google.com/maps/api/js/master?pb=!1m2!1u17!2s17!2sen-US!3sUS!4s17/17","https://www.google.com/maps/api/js/widget?pb=!1m2!1u17!2s17!2sen-US"],1,0], loadScriptTime);
  };
  var loadScriptTime = (new Date).getTime();
  getScript("http://maps.gstatic.com/maps-api-v3/api/js/17/17/main.js");
})();

// google maps

/*
 * Google layer using Google Maps API
 */

/* global google: true */

L.Google = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		opacity: 1,
		continuousWorld: false,
		noWrap: false,
		mapOptions: {
			backgroundColor: '#dddddd'
		}
	},

	// Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
	initialize: function(type, options) {
		L.Util.setOptions(this, options);

		this._ready = google.maps.Map !== undefined;
		if (!this._ready) L.Google.asyncWait.push(this);

		this._type = type || 'SATELLITE';
	},

	onAdd: function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;

		// create a container div for tiles
		this._initContainer();
		this._initMapObject();

		// set up events
		map.on('viewreset', this._resetCallback, this);

		this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
		map.on('move', this._update, this);

		map.on('zoomanim', this._handleZoomAnim, this);

		//20px instead of 1em to avoid a slight overlap with google's attribution
		map._controlCorners.bottomright.style.marginBottom = '20px';

		this._reset();
		this._update();
	},

	onRemove: function(map) {
		map._container.removeChild(this._container);

		map.off('viewreset', this._resetCallback, this);

		map.off('move', this._update, this);

		map.off('zoomanim', this._handleZoomAnim, this);

		map._controlCorners.bottomright.style.marginBottom = '0em';
	},

	getAttribution: function() {
		return this.options.attribution;
	},

	setOpacity: function(opacity) {
		this.options.opacity = opacity;
		if (opacity < 1) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	setElementSize: function(e, size) {
		e.style.width = size.x + 'px';
		e.style.height = size.y + 'px';
	},

	_initContainer: function() {
		var tilePane = this._map._container,
			first = tilePane.firstChild;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-google-layer leaflet-top leaflet-left');
			this._container.id = '_GMapContainer_' + L.Util.stamp(this);
			this._container.style.zIndex = 'auto';
		}

		tilePane.insertBefore(this._container, first);

		this.setOpacity(this.options.opacity);
		this.setElementSize(this._container, this._map.getSize());
	},

	_initMapObject: function() {
		if (!this._ready) return;
		this._google_center = new google.maps.LatLng(0, 0);
		var map = new google.maps.Map(this._container, {
		    center: this._google_center,
		    zoom: 0,
		    tilt: 0,
		    mapTypeId: google.maps.MapTypeId[this._type],
		    disableDefaultUI: true,
		    keyboardShortcuts: false,
		    draggable: false,
		    disableDoubleClickZoom: true,
		    scrollwheel: false,
		    streetViewControl: false,
		    styles: this.options.mapOptions.styles,
		    backgroundColor: this.options.mapOptions.backgroundColor
		});

		var _this = this;
		this._reposition = google.maps.event.addListenerOnce(map, 'center_changed',
			function() { _this.onReposition(); });
		this._google = map;

		google.maps.event.addListenerOnce(map, 'idle',
			function() { _this._checkZoomLevels(); });
		//Reporting that map-object was initialized.
		this.fire('MapObjectInitialized', { mapObject: map });
	},

	_checkZoomLevels: function() {
		//setting the zoom level on the Google map may result in a different zoom level than the one requested
		//(it won't go beyond the level for which they have data).
		// verify and make sure the zoom levels on both Leaflet and Google maps are consistent
		if (this._google.getZoom() !== this._map.getZoom()) {
			//zoom levels are out of sync. Set the leaflet zoom level to match the google one
			this._map.setZoom( this._google.getZoom() );
		}
	},

	_resetCallback: function(e) {
		this._reset(e.hard);
	},

	_reset: function(clearOldContainer) {
		this._initContainer();
	},

	_update: function(e) {
		if (!this._google) return;
		this._resize();

		var center = this._map.getCenter();
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(Math.round(this._map.getZoom()));

		this._checkZoomLevels();
	},

	_resize: function() {
		var size = this._map.getSize();
		if (this._container.style.width === size.x &&
		    this._container.style.height === size.y)
			return;
		this.setElementSize(this._container, size);
		this.onReposition();
	},


	_handleZoomAnim: function (e) {
		var center = e.center;
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(Math.round(e.zoom));
	},


	onReposition: function() {
		if (!this._google) return;
		google.maps.event.trigger(this._google, 'resize');
	}
});

L.Google.asyncWait = [];
L.Google.asyncInitialize = function() {
	var i;
	for (i = 0; i < L.Google.asyncWait.length; i++) {
		var o = L.Google.asyncWait[i];
		o._ready = true;
		if (o._container) {
			o._initMapObject();
			o._update();
		}
	}
	L.Google.asyncWait = [];
};



// MakiMarker functions
/*
 * Leaflet plugin to create map icons using Maki Icons from MapBox.
 *
 * References:
 *   Maki Icons: https://www.mapbox.com/maki/
 *   MapBox Marker API: https://www.mapbox.com/developers/api/static/#markers
 *
 * Usage:
 *   var icon = L.MakiMarkers.icon({icon: "rocket", color: "#b0b", size: "m"});
 *
 * License:
 *   MIT: http://jseppi.mit-license.org/
 */
 /*global L:false */
(function () {
  "use strict";
  L.MakiMarkers = {
    // Available Maki Icons
    icons: ["airfield","airport","alcohol-shop","america-football","art-gallery","bakery","bank","bar",
      "baseball","basketball","beer","bicycle","building","bus","cafe","camera","campsite","car",
      "cemetery","chemist","cinema","circle-stroked","circle","city","clothing-store","college",
      "commercial","cricket","cross","dam","danger","disability","dog-park","embassy",
      "emergency-telephone","entrance","farm","fast-food","ferry","fire-station","fuel","garden",
      "golf","grocery","hairdresser","harbor","heart","heliport","hospital","industrial",
      "land-use","laundry","library","lighthouse","lodging","logging","london-underground",
      "marker-stroked","marker","minefield","mobilephone","monument","museum","music","oil-well",
      "park2","park","parking-garage","parking","pharmacy","pitch","place-of-worship",
      "playground","police","polling-place","post","prison","rail-above","rail-light",
      "rail-metro","rail-underground","rail","religious-christian","religious-jewish",
      "religious-muslim","restaurant","roadblock","rocket","school","scooter","shop","skiing",
      "slaughterhouse","soccer","square-stroked","square","star-stroked","star","suitcase",
      "swimming","telephone","tennis","theatre","toilets","town-hall","town","triangle-stroked",
      "triangle","village","warehouse","waste-basket","water","wetland","zoo"
    ],
    defaultColor: "#0a0",
    defaultIcon: "circle-stroked",
    defaultSize: "m",
    apiUrl: "https://api.tiles.mapbox.com/v3/marker/",
    smallOptions: {
      iconSize: [20, 50],
      popupAnchor: [0,-20]
    },
    mediumOptions: {
      iconSize: [30,70],
      popupAnchor: [0,-30]
    },
    largeOptions: {
      iconSize: [36,90],
      popupAnchor: [0,-40]
    }
  };

  L.MakiMarkers.Icon = L.Icon.extend({
    options: {
      //Maki icon: any from https://www.mapbox.com/maki/ (ref: L.MakiMarkers.icons)
      icon: L.MakiMarkers.defaultIcon,
      //Marker color: short or long form hex color code
      color: L.MakiMarkers.defaultColor,
      //Marker size: "s" (small), "m" (medium), or "l" (large)
      size: L.MakiMarkers.defaultSize,
      shadowAnchor: null,
      shadowSize: null,
      shadowUrl: null,
      className: "maki-marker"
    },

    initialize: function(options) {
      var pin;

      options = L.setOptions(this, options);

      switch (options.size) {
        case "s":
          L.extend(options, L.MakiMarkers.smallOptions);
          break;
        case "l":
          L.extend(options, L.MakiMarkers.largeOptions);
          break;
        default:
          options.size = "m";
          L.extend(options, L.MakiMarkers.mediumOptions);
          break;
      }


      pin = "pin-" + options.size;

      if (options.icon !== null) {
        pin += "-" + options.icon;
      }

      if (options.color !== null) {
        if (options.color.charAt(0) === "#") {
          options.color = options.color.substr(1);
        }

        pin += "+" + options.color;
      }

      options.iconUrl = "" + L.MakiMarkers.apiUrl + pin +  ".png";
      options.iconRetinaUrl = L.MakiMarkers.apiUrl + pin + "@2x.png";
    }
  });

  L.MakiMarkers.icon = function(options) {
    return new L.MakiMarkers.Icon(options);
  };
})();

// shiny-leaflet functions

function recycle(values, length, inPlace) {
  if (length === 0 && !inPlace)
    return [];

  if (!(values instanceof Array)) {
    if (inPlace) {
      throw new Error("Can't do in-place recycling of a non-Array value");
    }
    values = [values];
  }
  if (typeof(length) === 'undefined')
    length = values.length;

  var dest = inPlace ? values : [];
  var origLength = values.length;
  while (dest.length < length) {
    dest.push(values[dest.length % origLength]);
  }
  if (dest.length > length) {
    dest.splice(length, dest.length - length);
  }
  return dest;
}

function asArray(value) {
  if (value instanceof Array)
    return value;
  else
    return [value];
}

var dataframe = (function() {
  var exports = {};

  var DataFrame = function() {
    this.columns = [];
    this.colnames = [];
    this.colstrict = [];

    this.effectiveLength = 0;
    this.colindices = {};
  };

  DataFrame.prototype._updateCachedProperties = function() {

    var self = this;
    this.effectiveLength = 0;
    this.colindices = {};
    
    $.each(this.columns, function(i, column) {
      self.effectiveLength = Math.max(self.effectiveLength, column.length);
      self.colindices[self.colnames[i]] = i;
    });
  };

  DataFrame.prototype._colIndex = function(colname) {
    var index = this.colindices[colname];
    if (typeof(index) === 'undefined')
      return -1;
    return index;
  }

  DataFrame.prototype.col = function(name, values, strict) {
    if (typeof(name) !== 'string')
      throw new Error('Invalid column name "' + name + '"');
    
    var index = this._colIndex(name);

    if (arguments.length === 1) {
      if (index < 0)
        return null;
      else
        return recycle(this.columns[index], this.effectiveLength);
    }

    if (index < 0) {
      index = this.colnames.length;
      this.colnames.push(name);
    }
    this.columns[index] = asArray(values);
    this.colstrict[index] = !!strict;

    // TODO: Validate strictness (ensure lengths match up with other stricts)

    this._updateCachedProperties();

    return this;
  }

  DataFrame.prototype.cbind = function(obj, strict) {
    var self = this;
    $.each(obj, function(name, coldata) {
      self.col(name, coldata);
    });
    return this;
  };

  DataFrame.prototype.get = function(row, col) {
    var self = this;
    
    if (row > this.effectiveLength)
      throw new Error('Row argument was out of bounds: ' + row + ' > ' + this.effectiveLength);

    var colIndex = -1;
    if (typeof(col) === 'undefined') {
      var rowData = {};
      $.each(this.colnames, function(i, name) {
        rowData[name] = self.columns[i][row % self.columns[i].length];
      });
      return rowData;
    } else if (typeof(col) === 'string') {
      colIndex = this._colIndex(col);
    } else if (typeof(col) === 'number') {
      colIndex = col;
    }
    if (colIndex < 0 || colIndex > this.columns.length)
      throw new Error('Unknown column index: ' + col);

    return this.columns[colIndex][row % this.columns[colIndex].length];
  }

  DataFrame.prototype.nrow = function() {
    return this.effectiveLength;
  }

  function test() {
    var df = new DataFrame();
    df.col("speed", [4, 4, 7, 7, 8, 9, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 20, 20, 20, 20, 20, 22, 23, 24, 24, 24, 24, 25])
      .col("dist", [2, 10, 4, 22, 16, 10, 18, 26, 34, 17, 28, 14, 20, 24, 28, 26, 34, 34, 46, 26, 36, 60, 80, 20, 26, 54, 32, 40, 32, 40, 50, 42, 56, 76, 84, 36, 46, 68, 32, 48, 52, 56, 64, 66, 54, 70, 92, 93, 120, 85])
      .col("color", ["yellow", "red"])
      .cbind({
        "Make" : ["Toyota", "Cadillac", "BMW"],
        "Model" : ["Corolla", "CTS", "435i"]
      })
    ;
    console.log(df.get(9, "speed"));
    console.log(df.get(9, "dist"));
    console.log(df.get(9, "color"));
    console.log(df.get(9, "Make"));
    console.log(df.get(9, "Model"));
    console.log(df.get(9));

  }

  return {
    create: function() {
      return new DataFrame();
    }
  };

})();

(function() {
  var maps = {};

  // We use a Shiny output binding merely to detect when a leaflet map is
  // created and needs to be initialized. We are not expecting any real data
  // to be passed to renderValue.
  var leafletOutputBinding = new Shiny.OutputBinding();
  $.extend(leafletOutputBinding, {
    find: function(scope) {
      return $(scope).find(".leaflet-map-output");
    },
    renderValue: function(el, data) {
      var $el = $(el);
      var map = $el.data('leaflet-map');
      if (!map) {

        // A new map was detected. Create it, initialize supporting data
        // structures, and hook up event handlers.

        var id = this.getId(el);
        var leafletOptions = JSON.parse(
          $el.children('script.leaflet-options').text()
        );
        map = L.map(id, leafletOptions);
        map.id = id;
        $el.data('leaflet-map', map);
        
        maps[id] = map;
        map.markers = new LayerStore(map);
        map.shapes = new LayerStore(map);
        map.popups = new LayerStore(map);
        map.geojson = new LayerStore(map);
        
        // When the map is clicked, send the coordinates back to the app
        map.on('click', function(e) {
          Shiny.onInputChange(id + '_click', {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            '.nonce': Math.random() // Force reactivity if lat/lng hasn't changed
          });
        });
        
        // Send bounds info back to the app
        function updateBounds() {
          var bounds = map.getBounds();
          Shiny.onInputChange(id + '_bounds', {
            north: bounds.getNorthEast().lat,
            east: bounds.getNorthEast().lng,
            south: bounds.getSouthWest().lat,
            west: bounds.getSouthWest().lng
          });
          Shiny.onInputChange(id + '_zoom', map.getZoom());
        }
        setTimeout(updateBounds, 1);
        map.on('moveend', updateBounds);

		if (initialTileLayer) {
			if (initialTileLayer=="GOOGLE") {
				// generate map layers
				var google_hybrid = new L.Google('HYBRID');
				var google_sat =  new L.Google('SATELLITE');
				var google_road = new L.Google('ROADMAP');
				var google_terrain = new L.Google('TERRAIN');
				// add map layer
				map.addLayer(google_hybrid);			
				// add map switcher
				var map_select = new L.Control.Layers( {'Hybrid':google_hybrid, 'Satellite':google_sat, 'Roadmap':google_road, "Terrain":google_terrain}, {});
				map.addControl(map_select);
				
			} else if (initialTileLayer=="ESRI") {
				// load esri world imagery with labels
				// see http://esri.github.io/esri-leaflet/api-reference/layers/basemap-layer.html
				 L.esri.basemapLayer('Imagery').addTo(map);
				 L.esri.basemapLayer('ImageryLabels').addTo(map);
			} else {
				// use tile layers based on input url
				  L.tileLayer(initialTileLayer, {
					attribution: initialTileLayerAttrib
				  }).addTo(map);
			}
		}
      }
    }
  });
  Shiny.outputBindings.register(leafletOutputBinding, "leaflet-output-binding");
  
  Shiny.addCustomMessageHandler('leaflet', function(data) {
    var mapId = data.mapId;
    var map = maps[mapId];
    if (!map)
      return;

    if (methods[data.method]) {
      methods[data.method].apply(map, data.args);
    } else {
      throw new Error('Unknown method ' + data.method);
    }
  });
  
  var methods = {};

  methods.setView = function(lat, lng, zoom, forceReset) {
    this.setView([lat, lng], zoom, forceReset);
  };

  methods.addMarker = function(lat, lng, layerId, options, eachOptions) {
    var df = dataframe.create()
      .col('lat', lat)
      .col('lng', lng)
      .col('layerId', layerId)
      .cbind(options)
      .cbind(eachOptions);

    for (var i = 0; i < df.nrow(); i++) {
      (function() {
        // var marker = L.marker([df.get(i, 'lat'), df.get(i, 'lng')], df.get(i));
		var icon = L.MakiMarkers.icon({icon: "marker", color: "#e30000", size: "m"});
        var marker = L.marker([df.get(i, 'lat'), df.get(i, 'lng')], {icon: icon});
        var thisId = df.get(i, 'layerId');
        this.markers.add(marker, thisId);
        marker.on('click', mouseHandler(this.id, thisId, 'marker_click'), this);
        marker.on('mouseover', mouseHandler(this.id, thisId, 'marker_mouseover'), this);
        marker.on('mouseout', mouseHandler(this.id, thisId, 'marker_mouseout'), this);
      }).call(this);
    }
  };

  methods.addCircleMarker = function(lat, lng, radius, layerId, options, eachOptions) {
    var df = dataframe.create()
      .col('lat', lat)
      .col('lng', lng)
      .col('radius', radius)
      .col('layerId', layerId)
      .cbind(options)
      .cbind(eachOptions);

    for (var i = 0; i < df.nrow(); i++) {
      (function() {
        var circle = L.circleMarker([df.get(i, 'lat'), df.get(i, 'lng')], df.get(i));
        var thisId = df.get(i, 'layerId');
        this.markers.add(circle, thisId);
        circle.on('click', mouseHandler(this.id, thisId, 'marker_click'), this);
        circle.on('mouseover', mouseHandler(this.id, thisId, 'marker_mouseover'), this);
        circle.on('mouseout', mouseHandler(this.id, thisId, 'marker_mouseout'), this);
      }).call(this);
    }
  };

  methods.removeMarker = function(layerId) {
    this.markers.remove(layerId);
  };

  methods.clearMarkers = function() {
    this.markers.clear();
  };

  methods.removeShape = function(layerId) {
    this.shapes.remove(layerId);
  };

  methods.clearShapes = function() {
    this.shapes.clear();
  };

  methods.fitBounds = function(lat1, lng1, lat2, lng2) {
    this.fitBounds([
      [lat1, lng1], [lat2, lng2]
    ]);
  };

  methods.addRectangle = function(lat1, lng1, lat2, lng2, layerId, options, eachOptions) {
    var df = dataframe.create()
      .col('lat1', lat)
      .col('lng1', lng)
      .col('lat2', lat)
      .col('lng2', lng)
      .col('layerId', layerId)
      .cbind(options)
      .cbind(eachOptions);

    for (var i = 0; i < df.nrow(); i++) {
      (function() {
        var rect = L.rectangle([
            [df.get(i, 'lat1'), df.get(i, 'lng1')],
            [df.get(i, 'lat2'), df.get(i, 'lng2')]
          ],
          df.get(i));
        var thisId = df.get(i, 'layerId');
        this.shapes.add(rect, thisId);
        rect.on('click', mouseHandler(this.id, thisId, 'shape_click'), this);
        rect.on('mouseover', mouseHandler(this.id, thisId, 'shape_mouseover'), this);
        rect.on('mouseout', mouseHandler(this.id, thisId, 'shape_mouseout'), this);
      }).call(this);
    }
  };
  
  /*
   * @param lat Array of latitude coordinates for polygons; different
   *   polygons are separated by null.
   * @param lng Array of longitude coordinates for polygons; different
   *   polygons are separated by null.
   * @param layerId Array of layer names.
   * @param options Array of objects that contain options, one for each
   *   polygon (or null for default), or null if none.
   * @param defaultOptions The default set of options that all polygons
   *   will use.
   */
  methods.addPolygon = function(lat, lng, layerId, options, defaultOptions) {
    var self = this;
    var coordPos = -1; // index into lat/lng
    var idPos = -1; // index into layerId
    if (options === null || typeof(options) === 'undefined' || options.length == 0) {
      options = [null];
    }
    while (++coordPos < lat.length && ++idPos < layerId.length) {
      (function() {
        var thisId = layerId[idPos];
        var points = [];
        while (coordPos < lat.length && lat[coordPos] !== null) {
          points.push([lat[coordPos], lng[coordPos]]);
          coordPos++;
        }
        points.pop();
        var opt = $.extend(true, {}, defaultOptions,
          options[idPos % options.length]);
        var polygon = L.polygon(points, opt);
        self.shapes.add(polygon, thisId);
        polygon.on('click', mouseHandler(this.id, thisId, 'shape_click'), this);
        polygon.on('mouseover', mouseHandler(this.id, thisId, 'shape_mouseover'), this);
        polygon.on('mouseout', mouseHandler(this.id, thisId, 'shape_mouseout'), this);
      }).call(this);
    }
  };

  function mouseHandler(mapId, layerId, eventName, extraInfo) {
    return function(e) {
      var lat = e.target.getLatLng ? e.target.getLatLng().lat : null;
      var lng = e.target.getLatLng ? e.target.getLatLng().lng : null;
	  Shiny.onInputChange(mapId + '_' + eventName, $.extend({
        id: layerId,
        lat: lat,
        lng: lng,
        '.nonce': Math.random()  // force reactivity
      }, extraInfo));
    };
  }

  function customMouseHandler(mapId, layerId, eventName, extraInfo) {
    return function(e) {
      var lat = e.target.getLatLng ? e.target.getLatLng().lat : null;
      var lng = e.target.getLatLng ? e.target.getLatLng().lng : null;
	  var clicklat=e.latlng.lat;
	  var clicklng=e.latlng.lng;
	  Shiny.onInputChange(mapId + '_' + eventName, $.extend({
        id: layerId,
        lat: lat,
        lng: lng,
		clicklat: clicklat,
		clicklng: clicklng,
        '.nonce': Math.random()  // force reactivity
      }, extraInfo));
    };
  }  
  
  methods.addCircle = function(lat, lng, radius, layerId, options, eachOptions) {
    var df = dataframe.create()
      .col('lat', lat)
      .col('lng', lng)
      .col('radius', radius)
      .col('layerId', layerId)
      .cbind(options)
      .cbind(eachOptions);

    for (var i = 0; i < df.nrow(); i++) {
      (function() {
        var circle = L.circle([df.get(i, 'lat'), df.get(i, 'lng')], df.get(i, 'radius'), df.get(i));
        var thisId = df.get(i, 'layerId');
        this.shapes.add(circle, thisId);
        circle.on('click', mouseHandler(this.id, thisId, 'shape_click'), this);
        circle.on('mouseover', mouseHandler(this.id, thisId, 'shape_mouseover'), this);
        circle.on('mouseout', mouseHandler(this.id, thisId, 'shape_mouseout'), this);
      }).call(this);
    }
  };
  
  methods.addGeoJSON = function(data, layerId) {
    var self = this;
    if (typeof(data) === "string") {
      data = JSON.parse(data);
    }
    
    var globalStyle = data.style || {};
    
    var gjlayer = L.geoJson(data, {
      style: function(feature) {
        if (feature.style || feature.properties.style) {
          return $.extend({}, globalStyle, feature.style, feature.properties.style);
        } else {
          return globalStyle;
        }
      },
      onEachFeature: function(feature, layer) {
        var extraInfo = {
          featureId: feature.id,
          properties: feature.properties
        };
        layer.on("click", customMouseHandler(self.id, layerId, "geojson_click", extraInfo), this);
        layer.on("mouseover", mouseHandler(self.id, layerId, "geojson_mouseover", extraInfo), this);
        layer.on("mouseout", mouseHandler(self.id, layerId, "geojson_mouseout", extraInfo), this);
      }
    });
    this.geojson.add(gjlayer, layerId);
  };

  methods.clearGeoJSON = function() {
	this.geojson.clear();
  };
  
  methods.removeGeoJSON = function(layerId) {
	this.geojson.remove(layerId);
  };
  
  methods.showPopup = function(lat, lng, content, layerId, options) {
    var popup = L.popup(options)
      .setLatLng([lat, lng])
      .setContent(content);
    this.popups.add(popup, layerId);
  };

  methods.removePopup = function(layerId) {
    this.popups.remove(layerId);
  };

  methods.clearPopups = function() {
    this.popups.clear();
  };
  
  function LayerStore(map) {
    this._layers = {};
    this._group = L.layerGroup().addTo(map);
  }

  LayerStore.prototype.add = function(layer, id) {
    if (typeof(id) !== 'undefined' && id !== null) {
      if (this._layers[id]) {
        this._group.removeLayer(this._layers[id]);
      }
      this._layers[id] = layer;
    }
    this._group.addLayer(layer);
  };

  LayerStore.prototype.remove = function(id) {
    if (this._layers[id]) {
      this._group.removeLayer(this._layers[id]);
      delete this._layers[id];
    }
  };

  LayerStore.prototype.get = function(id) {
    return this._layers[id];
  };

  LayerStore.prototype.clear = function() {
    this._layers = {};
    this._group.clearLayers();
  };

  LayerStore.prototype.each = function(iterator) {
    this._group.eachLayer(iterator);
  };

  LayerStore.prototype.keys = function() {
    var keys = [];
    for (key in this._layers) {
      if (this._layers.hasOwnProperty(key))
        keys.push(key);
    }
    return keys;
  };
  /*
  function unflattenLatLng(lat, lng, levels) {
    var stack = [];
    function 
  }
  */

})();
