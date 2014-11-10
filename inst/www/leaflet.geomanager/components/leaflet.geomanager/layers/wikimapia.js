//http://api.wikimapia.org/?function=box&bbox=37.617188,55.677586,37.70507,55.7271128&key=60175C48-4B0C86C-A2D4D106-A5F37CAF-5A760C96-45526DF2-6D90C63B-511E68EE&pack=gzip&format=jsonp&jsoncallback=qwe

/*
 * L.WikimapiaJSON turns Wikimapia API box (http://wikimapia.org/wiki/API_box) data into a Leaflet layer.
 */

L.WikimapiaJSON = L.FeatureGroup.extend({

	initialize: function (wikijson, options) {
    	var that = this
    		, i
    		, j;

		L.setOptions(that, options);

		that._layers = {};

		if (wikijson && wikijson.folder.length>0) {
			for (i=0;i<wikijson.folder.length;i++) {
				var polycoords = wikijson.folder[i].polygon
					, coords = [];

					for (j=0;j<polycoords.length;j++) {
						coords.push([polycoords[j].y,polycoords[j].x]);
					}

					var layer = new L.Polygon(coords);
					layer.feature = wikijson.folder[i];

					that.resetStyle(layer);

					if (options.onEachFeature) {
						options.onEachFeature(layer.feature, layer);
					}

					that.addLayer(layer);

			}
		}
	}

	, resetStyle: function (layer) {
		var that = this
			, style = this.options.style;

		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			that._setLayerStyle(layer, style);
		}
	}

	, setStyle: function (style) {
		var that = this;

		that.eachLayer(function (layer) {
			that._setLayerStyle(layer, style);
		}, that);
	}

	, _setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}

});

L.WikimapiaInteractive = L.Class.extend({
    includes: L.Mixin.Events

    , timer: null
    , mouseMoveTimer: null
    , counter: 0
    , options: {
         url:'http://api.wikimapia.org/'
        , opacity: 1
        , attribution: '<a href="http://wikimapia.org" target="_blank">Wikimapia.org</a>'

    }

    , initialize: function (options) {
		var that = this;

        L.setOptions(that, options);
        that._hash = {};
        that._mouseIsDown = false;
        that._popupIsOpen = false;
        that._layer=new L.LayerGroup([]);
    }

    , setOptions: function (newOptions) {
 		var that = this;

        L.setOptions(that, newOptions);
        that._update();
    }

    , onAdd: function (map) {
 		var that = this;

        that._map = map;
        that._layer.addTo(that._map);

        map.on('viewreset', that._update, that);
        map.on('moveend', that._update, that);
        map.on('zoomend', that._update, that);
        map.on('mousemove', that._mousemove, that);
        map.on('mouseout', that._mouseout, that);
        map.on('mousedown', that._mousedown, that);
        map.on('mouseup', that._mouseup, that);
        map.on('popupopen', that._popup_open, that);
        map.on('popupclose', that._popup_close, that);


        that._update();
    }

    , onRemove: function (map) {
 		var that = this;

        map.off('viewreset', that._update, that);
        map.off('moveend', that._update, that);
        map.off('zoomend', that._update, that);
        map.off('mousemove', that._mousemove, that);
        map.off('mouseout', that._mouseout, that);
        map.off('mousedown', that._mousedown, that);
        map.off('mouseup', that._mouseup, that);
        map.off('popupopen', that._popup_open, that);
        map.off('popupclose', that._popup_close, that);
    }

   , addTo: function (map) {
        map.addLayer(this);
        return this;
    }

    , getAttribution: function () {
        return this.options.attribution;
    }

    , _wikiPointsToPolygon: function (polyPoints) {

		coords = [];

		for (j=0;j<polyPoints.length;j++) {
			coords.push([polyPoints[j].y,polyPoints[j].x]);
		}

		return new L.Polygon(coords);

    }

    , _hideFeature: function () {
    	var that = this;

		if (that._feature && !that._popupIsOpen) {
				that._feature.polygon.off('mouseout');
				that._map.removeLayer(that._feature.polygon);
				that._feature = null;
			}
    }

    , _showFeature:function(feature) {
    	var that = this;

		if (!((that._feature && that._feature.id==feature.id) || that._popupIsOpen)) {
			that._hideFeature();
			//Deep copy
			var poly = jQuery.extend(true, {}, feature.polygon);
			that._feature = jQuery.extend(true, {}, feature);
			that._feature.polygon = poly;

			if (that.options.onActiveFeature) {
				that.options.onActiveFeature(that._feature, that._feature.polygon);
			}

			if (that.options.onActiveFeatureStyle) {
				that._feature.polygon.setStyle(that.options.onActiveFeatureStyle(that._feature));
			}

			that._feature.polygon
				.on('mouseout', function (e) {
					// Dirty hack to track mouseout from map hover on polygon
					var size = that._map.getSize();
					if (e.containerPoint.x<0 || e.containerPoint.y<0 || e.containerPoint.x>(size.x-10) || e.containerPoint.y>(size.y-10)) {
						that._hideFeature();
					}
				})
				.addTo(that._map);

		}
    }

    , _mousemove: function (e) {
    	var that = this;

    	if (!that._mouseIsDown) {
	    	var point = e.latlng
	    		, features = that._filter(that._hash, function (item) {
	    			return (item.bounds.contains(point) && that._pointInPolygon(point, item.polygon))
	    		});

    		if (features.length>0) {
    			var feature = (features.length == 1 ? features[0] : that._chooseBestFeature(features));
    			that._showFeature(feature);
			} else {
				that._hideFeature();
			}
    	}
    }

    , _mousedown: function () {
    	this._mouseIsDown = true;
    }

    , _mouseup: function () {
    	this._mouseIsDown = false;
    }

    , _mouseout: function () {
		this._hideFeature();
    }

    , _popup_open: function () {
    	this._popupIsOpen = true;
    }

    , _popup_close: function () {
    	this._popupIsOpen = false;
    }

    , _chooseBestFeature: function (features) {
		var that = this
			, bestLookingArea = that._boundsArea(that._map.getBounds())/12
			, bestFeatureIndex = 0
			, bestFeatureScale = that._boundsArea(features[0].bounds)/bestLookingArea;

		if (bestFeatureScale < 1) {bestFeatureScale = 1/bestFeatureScale}

		for (var i=1; i<features.length;i++) {
			var featureArea = that._boundsArea(features[i].bounds)
				, featureScale = featureArea/bestLookingArea;
			if (featureScale < 1) {featureScale = 1/featureScale}

			if (featureScale<bestFeatureScale) {
				bestFeatureIndex = i;
				bestFeatureScale = featureScale;
			}
		}

		return features[bestFeatureIndex];
    }

 	, _boundsArea: function(bounds) {
 		var sw = bounds.getSouthWest()
 			, ne = bounds.getNorthEast();
 		return (ne.lat-sw.lat)*(ne.lat-sw.lat)+(ne.lng-sw.lng)*(ne.lng-sw.lng)
 	}

    , _filter: function(obj, predicate) {
		var res=[];

		$.each(obj, function(index,item) {
			if (predicate(item)) {res.push(item)}
		});

		return res;
    }

	, _pointInPolygon: function (point, polygon) {
	    // ray-casting algorithm based on
	    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

	    var x = point.lng
	    , y = point.lat
	    , poly = polygon.getLatLngs()
	    , inside = false;

	    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {

	        var xi = poly[i].lng, yi = poly[i].lat
	        , xj = poly[j].lng, yj = poly[j].lat
	        , intersect = ((yi > y) != (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

	        if (intersect) inside = !inside;

	    }

	    return inside;
	}


    , _draw: function() {

		var that = this
			, polygons = []
			, bounds = that._map.getBounds()
			, c = 0
			, list = that._filter(that._hash, function(item) {
				c++;
				return bounds.contains(item.polygon.getBounds())
			});

			that._layer.clearLayers();

			console.log('_draw: '+list.length + ' from '+ c);

			for (var i=0; i<list.length;i++) {
				var poly = list[i].polygon;
				if (that.options.style) {
					poly.setStyle(that.options.style(that._feature));
				}
				that._layer.addLayer(poly);
			}

    }

	, _update: function () {
		var that = this;
		//that._draw();

/*        if (that.timer) {
        	window.clearTimeout(that.timer);
        }
*/
/*		that.timer = window.setTimeout(function() {*/

				that.counter++;
		        $.ajax({
		            url : that.options.url
		            , dataType : 'jsonp'
		            , jsonp : 'jsoncallback'
		            , data : {
		                'function' : 'box'
		                , 'bbox' : that._map.getBounds().toBBoxString()
		                , 'key' : that.options.key
		                , 'format' : 'jsonp'
		                , 'count' : '100'
		                , 'pack' : 'gzip'
		                , 'language' : (window.navigator.userLanguage || window.navigator.language).split('-')[0]
		            }
	              	, jsonpCallback: 'wikimapiacallback'+that.counter
	              	, success: function(data) {
	              		that.counter--;
			            if (data) {

		            		for (var i=0;i<data.folder.length;i++) {
		            			var item = data.folder[i];

	            				that._hash[item.id] = {
	            					id: item.id
	            					, name: item.name
	            					, url : item.url
	            					, bounds: L.latLngBounds([item.location.south, item.location.west],[item.location.north, item.location.east])
	            					, polygon: that._wikiPointsToPolygon(item.polygon)
	            				};
		            		}

		            		//that._draw();

				        }
				    }
		        })

/*	    },0);*/

	    }
})

L.WikimapiaFeatures = L.Class.extend({
    includes: L.Mixin.Events

    , timer: null
    , mouseMoveTimer: null
    , counter: 0
    , options: {
         url:'http://api.wikimapia.org/'
        , opacity: 1
        , attribution: '<a href="http://wikimapia.org" target="_blank">Wikimapia.org</a>'

    }

    , initialize: function (options) {
		var that = this;

        L.setOptions(that, options);
        that._hash = {};
        that._layer=new L.FeatureGroup([]);
    }

    , setOptions: function (newOptions) {
 		var that = this;

        L.setOptions(that, newOptions);
        that._update();
    }

    , onAdd: function (map) {
 		var that = this;

        that._map = map;

		that._layer.addTo(that._map);

        map.on('viewreset', that._update, that);
        map.on('moveend', that._update, that);
        map.on('zoomend', that._update, that);

        that._update();
    }

    , onRemove: function (map) {
 		var that = this;

        map.off('viewreset', that._update, that);
        map.off('moveend', that._update, that);
        map.off('zoomend', that._update, that);
    }

   , addTo: function (map) {
        map.addLayer(this);
        return this;
    }

    , getAttribution: function () {
        return this.options.attribution;
    }

    , _wikiPointsToPolygon: function (polyPoints) {

		coords = [];

		for (j=0;j<polyPoints.length;j++) {
			coords.push([polyPoints[j].y,polyPoints[j].x]);
		}

		return new L.Polygon(coords);

    }

    , _filter: function(obj, predicate) {
		var res=[];

		$.each(obj, function(index,item) {
			if (predicate(item)) {res.push(item)}
		});

		return res;
    }

    , _draw: function() {

		var that = this
			, polygons = []
			, bounds = that._map.getBounds()
			, c = 0
			, list = that._filter(that._hash, function(item) {
				c++;
				return bounds.intersects(item.polygon.getBounds()) || bounds.contains(item.polygon.getBounds())
			});

			that._layer.clearLayers();

			console.log('_draw: '+list.length + ' from '+ c);

			for (var i=0; i<list.length;i++) {
				that._layer.addLayer(list[i].polygon);
			}


    }

	, _update: function () {
		console.log('update');

		var that = this;

		that._draw();

/*        if (that.timer) {
        	window.clearTimeout(that.timer);
        }*/

/*		that.timer = window.setTimeout(function() {
*/
          		console.log('ajaxin');
				that.counter++;
		        $.ajax({
		            url : that.options.url
		            , dataType : 'jsonp'
		            , jsonp : 'jsoncallback'
		            , data : {
		                'function' : 'box'
		                , 'bbox' : that._map.getBounds().toBBoxString()
		                , 'key' : that.options.key
		                , 'format' : 'jsonp'
		                , 'count' : '100'
		                , 'pack' : 'gzip'
		            }
	              	, jsonpCallback: 'wikimapiacallback'+that.counter
	              	, success: function(data) {
          				console.log('success');
	              		that.counter--;
			            if (data) {

		            		for (var i=0;i<data.folder.length;i++) {
		            			var item = data.folder[i];

	            				that._hash[item.id] = {
	            					id: item.id
	            					, name: item.name
	            					, url : item.url
	            					, bounds: L.latLngBounds([item.location.south, item.location.west],[item.location.north, item.location.east])
	            					, polygon: that._wikiPointsToPolygon(item.polygon)
	            				};
		            		}

            				that._draw();

				        }
				    }
		        })

          		console.log('ajaxout');
/*	    },0);*/

	    }
})
