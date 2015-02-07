
function getClass(obj) {
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}


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
	// global vars
	var maps = {};
	var featureIndex = 0;
	var activeId = -9999;
	// feature styles
	var activeStyle = {
		'color': '#2fffce',
		'weight': 3,
		'opacity': 0.9
	};	
	var defaultStyle = {
		'color': '#1a16ff',
		'weight': 2,
		'opacity': 0.7
	};
	var editStyle = {
		'color': '#ffea00',
		'weight': 2,
		'opacity': 0.9
	};
	var activeIcon=L.MakiMarkers.icon({icon: "marker", color: activeStyle.color, size: "m"});
	var defaultIcon=L.MakiMarkers.icon({icon: "marker", color: defaultStyle.color, size: "m"});
	var editIcon=L.MakiMarkers.icon({icon: "marker", color: editStyle.color, size: "m"});
	
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
		map.popups = new LayerStore(map);
		map.rfeatures = new LayerStore(map);
		map.rwfeatures = new LayerStore(map);
		map.popupLayerId=-9999;
        
        // When the map is clicked, send the coordinates back to the app
        map.on('click', function(e) {
			// reset style
			deactivate(id);
		  
			// send data to shiny
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
		
		// initialise geocoder
		var geocoder = L.Control.geocoder().addTo(map);
		geocoder.markGeocode = function(result) {
			map.fitBounds(result.bbox);
		};
				
		// generate map layers
		var esri_sat = L.esri.basemapLayer('Imagery');
		var esri_hybrid = L.layerGroup([L.esri.basemapLayer('Imagery'), L.esri.basemapLayer('ImageryLabels')]);
		var google_hybrid = new L.Google('HYBRID');
		var google_sat =  new L.Google('SATELLITE');
		var google_road = new L.Google('ROADMAP');
		var google_terrain = new L.Google('TERRAIN');
		
		// add layer control
		map.toc = new L.Control.Layers( 
			{
				"Esri Hybrid": esri_hybrid,
				"Esri Satellite": esri_sat,
				'Google Hybrid':google_hybrid, 
				'Google Satellite':google_sat,
				'Google Roadmap':google_road,
				'Google Terrain':google_terrain
			}
		); 
		map.addControl(map.toc);
		
		// set default tiles
		map.addLayer(esri_hybrid);			
		
		// initialise draw control
		function customMarker() {
			return editIcon;
		}
		var drawControl = new L.Control.Draw({
			draw: {
				polyline: {
					shapeOptions: {
						color: editStyle.color,
						weight: editStyle.weight,
						opacity: editStyle.opacity
					}
				},
				polygon: {
					allowIntersection: false,
					drawError: {
						color: '#ff1a00',
						weight: 2,
						opacity: 0.9,
						message: '<strong>Features cannot self-intersect!</strong>'
					},
					shapeOptions: {
						color: editStyle.color,
						weight: editStyle.weight,
						opacity: editStyle.opacity
					}
				},
				circle: {
					shapeOptions: {
						color: editStyle.color,
						weight: editStyle.weight,
						opacity: editStyle.opacity
					}
				},
				rectangle: {
					shapeOptions: {
						color: editStyle.color,
						weight: editStyle.weight,
						opacity: editStyle.opacity
					}		
				},
				marker: {
					icon: new customMarker()
				}
			},
			edit: {
				featureGroup: map.rwfeatures._group,
				edit: {selectedPathOptions: {
					color: editStyle.color,
					fillColor: editStyle.color,
					opacity: editStyle.opacity,
					weight: editStyle.weight
				}}
			}
		});
		map.addControl(drawControl);

		// send geojson data to shiny for new layer
		map.on('draw:created', function(e) {
			// init
			var layer = e.layer
			layer.id=featureIndex;
			layer.note="";
			layer.type=e.layerType
			
			// add handlers
			layer.on('click', mouseHandler(id, layer.id, 'feature_click'), this);
			layer.on('contextmenu', textPopup(id, layer.id, 'note'), this);
			layer.on('mouseover', mouseHandler(id, layer.id, 'feature_mouseover'), this);
			layer.on('mouseout', mouseHandler(id, layer.id, 'feature_mouseout'), this);
			layer.bindLabel("Right click to add note.", {direction: "left"});
			
			// add custom style
			setLayerStyle(layer, defaultStyle, defaultIcon);
			
			// send geojson data to shiny
			var radii=undefined;
			if (layer.type=='circle') {
				radii=layer.getRadius();
			}
			var shape = layer.toGeoJSON();
			Shiny.onInputChange(id+'_create', {
				id: layer.id,
				geojson: JSON.stringify(shape),
				radii: radii,
				'.nonce': Math.random() // force reactivity
			});
			
			// add layer to map
			this.rwfeatures.add(layer, layer.id);
			
			// post
			featureIndex++;
		});

		// send geojson data to shiny for editable layer
		map.on('draw:edited', function (e) {
			// init
			var layers = e.layers;
			var temp;
			var geojson=[];
			layers.eachLayer(function(layer) {
				// update layer store
				maps[id].rwfeatures._layers[layer.id]=layer;
				// store geojson info
				var radii=undefined;
				if (layer.type=='circle') {
					radii=layer.getRadius();
				}				
				temp = layer.toGeoJSON();
				geojson.push(
					{
						id: layer.id,
						geojson: JSON.stringify(temp),
						radii: radii
					}
				)
			});
			// send geojson data to shiny
			Shiny.onInputChange(id+'_edit', {
				list: geojson,
				'.nonce': Math.random()  // force reactivity
			});
		});
		
		map.on('draw:deleted', function (e) {
			// init
			var layers = e.layers;
			var ids=[];
			layers.eachLayer(function(layer) {
				delete maps[id].rwfeatures._layers[layer.id];
				ids.push(layer.id);
			});
			// send geojson data to shiny
			Shiny.onInputChange(id+'_delete', {
				id: ids,
				'.nonce': Math.random()  // force reactivity
			});
		})

		// tell shiny to load map data
		Shiny.onInputChange(id + '_load_data', {
			'.nonce': Math.random() // Force reactivity if lat/lng hasn't changed
		});
    }}
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
  
  // mouse handler function
  function mouseHandler(mapId, layerId, eventName, extraInfo) {
    return function(e) {
		// send data to shiny
		var lat = e.target.getLatLng ? e.target.getLatLng().lat : null;
		var lng = e.target.getLatLng ? e.target.getLatLng().lng : null;
		var map_lat=e.latlng.lat;
		var map_lng=e.latlng.lng;
		Shiny.onInputChange(mapId + '_' + eventName, $.extend({
			id: layerId,
			feature_lat: lat,
			feature_lng: lng,
			map_lat: map_lat,
			map_lng: map_lng,
			'.nonce': Math.random() * 0.001  // force reactivity
		}, extraInfo));
		// set as active if user clicked on feature
		if (eventName == "feature_click") {
			// reset style
			deactivate(mapId);
			// set layer as selected
			activate(mapId, layerId);
		}
    };
  } 
  
  // style function
  function setLayerStyle(layer, style, icon) {
		if ($.inArray(layer.type, ["rectangle", "polygon", "polyline", "circle"]) != -1) {
			layer.setStyle(style);
		} else if (layer.type=="marker")
			layer.setIcon(icon);
  }
  
  // selection functions
  function activate(mapId, layerId) {
	if (maps[mapId].rfeatures._layers[layerId]) {
		setLayerStyle(maps[mapId].rfeatures.get(layerId), activeStyle, activeIcon);
	} else if (maps[mapId].rwfeatures._layers[layerId]) {
		setLayerStyle(maps[mapId].rwfeatures.get(layerId), activeStyle, activeIcon);
	}
	activeId=layerId;
  }
  
  function deactivate(mapId) {
	if (activeId!=-9999) {
		if (maps[mapId].rfeatures._layers[activeId]) {
			setLayerStyle(maps[mapId].rfeatures.get(activeId), defaultStyle, defaultIcon);
		} else if (maps[mapId].rwfeatures._layers[activeId]) {
			setLayerStyle(maps[mapId].rwfeatures.get(activeId), defaultStyle, defaultIcon);
		}
		activeId=-9999;
	}
  }

  // map control methods
  methods.setView = function(lat, lng, zoom, forceReset) {
    this.setView([lat, lng], zoom, forceReset);
  };

  methods.fitBounds = function(lat1, lng1, lat2, lng2) {
    this.fitBounds([
      [lat1, lng1], [lat2, lng2]
    ]);
  };
  
  
  // feature methods
  methods.addFeature = function(layerId, data, mode, name) {
		if (typeof(data) === "string") {
		  data = JSON.parse(data);
		}
		var i=0;
		var gjlayer = L.geoJson(data, {
			style: function(feature) {
				// set style
				if (feature.type=="MultiPoint" || feature.type=="Point") {
					return {
						icon: L.MakiMarkers.icon({icon: "marker", color: feature.properties.color, size: "m"})
					}
				} else {
					return {
							color:feature.properties.color,
							fillColor:feature.properties.color,
							opacity:feature.properties.opacity,
							fillOpacity:feature.properties.fillOpacity
					}
				}
			},
			onEachFeature: function(feature,layer) {
				// set mouse handlers
				layer.on('click', mouseHandler(this.id, layerId+'_'+(i+1), 'feature_click'), this);
				if (mode=='rw') {
					layer.on('contextmenu', textPopup(this.id, layerId+'_'+(i+1), 'note'), this);
				}
				layer.on('mouseover', mouseHandler(this.id, layerId+'_'+(i+1), 'feature_mouseover'), this);
				layer.on('mouseout', mouseHandler(this.id, layerId+'_'+(i+1), 'feature_mouseout'), this);
				// set note
				layer.bindLabel(feature.properties.note, {direction: "left"});
				// post
				++i;
			}
		});
		
		// set fields
		gjlayer.id=layerId;
		gjlayer.type="geojson";		
				
		// add layer
		if (mode=='r') {
			this.rfeatures.add(gjlayer, layerId);
		} else {
			this.rwfeatures.add(gjlayer, layerId);
		}
		// add to control
		this.toc.addOverlay(gjlayer, name);  
  }


  methods.clearFeatures = function(mode) {
	if (mode=='r' ||  mode=='all')
		this.rfeatures.clear();
	if (mode=='rw' ||  mode=='all')
		this.rwfeatures.clear();
  };

  methods.removeFeature = function(layerId) {
	this.rfeatures.remove(layerId);
	this.rwfeatures.remove(layerId);
  };
   
  // popup methods
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
  
  methods.addLabel = function(layerId, text, mode) {	
	if (mode=="rw") {
			this.rwfeatures.get(layerId).note=text;
			this.rwfeatures.get(layerId).bindLabel(text, {direction: "left"});
		}
	if (mode=="r")
		this.rwfeatures.get(layerId).note=text;
		this.rfeatures.get(layerId).bindLabel(text, {direction: "left"});
  }
  
  function setLabel(mapId, layerId, label) {
		// add label to object
		options={opacity: 1, direction: "left"};
		if (label=='') {
			options.opacity=0;
		}
		if (maps[mapId].rwfeatures._layers[layerId])
			maps[mapId].rwfeatures.get(layerId).bindLabel(label, options);
		if (maps[mapId].rfeatures._layers[layerId])
			maps[mapId].rfeatures.get(layerId).bindLabel(label, options);
		// send label to shiny
		Shiny.onInputChange("map_note", 
			{
				id: layerId,
				text: label,
				'.nonce': Math.random()  // force reactivity
			}
		);
	}
  
  function textPopup(mapId, layerId, eventName) {
	return function(e) {
		var domelem=document.createElement('div');
		domelem.style.width='315px';
		var textelem=document.createElement('input');
		textelem.id="note_input_text";
		textelem.type="text";
		textelem.value=e.target.note;
		textelem.style.padding=5;
		textelem.style.margin='10px 0 0 0';
		textelem.style.fontSize='12pt';
		textelem.style.width='90%';
		textelem.onkeyup=function(event) {
			if (event.keyCode==13) {
				setLabel(mapId, layerId, event.target.value);
			}
		};
		var labelelem=document.createElement('label');
		labelelem.for="note_input_text";
		labelelem.textContent='Press enter to save.';
		labelelem.style.color='#706d6c';
		labelelem.style.margin=0;
		labelelem.style.fontSize='8pt';
		domelem.appendChild(textelem);
		domelem.appendChild(labelelem);
		// create popup
		var popup = L.popup({closeButton: false})
		.setLatLng([e.latlng.lat, e.latlng.lng])
		.setContent(domelem);
		// store popup
		this.popups.add(popup, "map_add_note");
	};
  }
  
  // layer store class declaration
  function LayerStore(map) {
    this._layers = {};
    this._group = L.featureGroup().addTo(map);
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
