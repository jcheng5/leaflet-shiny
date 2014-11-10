L.GeoManager.APILoaders = {

    loadGoogleApi: function() {
        var dfd = new jQuery.Deferred();

        if ((typeof google === 'undefined') || (typeof google.maps==='undefined')) {
            $.getScript('https://www.google.com/jsapi', function() {
                google.load('maps', '3', {
                    other_params: 'sensor=false'
                    , callback: function() {
                        dfd.resolve()
                    }
                });
            });
        } else dfd.resolve();

        return dfd.promise();
    }

    , loadYandexApi: function() {
        var dfd = new jQuery.Deferred();

        if (typeof ymaps === 'undefined') {
            $.getScript('http://api-maps.yandex.ru/2.0/?load=package.map&lang=' + (window.navigator.userLanguage || window.navigator.language), function() {
                dfd.resolve()
            });
        } else dfd.resolve();

        return dfd.promise();
    }

}

L.GeoManager.OptionsFormsFactory = {

    tileLayer: function(layer) {
        var html = ''
            + '<span>Opacity: <input name="opacity" type="text" value="1.0"></span>';

        $node = $(html);

        $node.find('input[name="opacity"]').on('change', function (e) {

            layer.setOpacity($(e.target).val());

        });

        return $node;
    }

    , wms: function(layer, wmslayers) {

        var html = '';

        if (wmslayers) {
            html = html
            + '<ul>';

            for (var j=0; j<wmslayers.length; j++) {
                var wmslayer =  wmslayers[j];
                html = html
                + '<li><span><input name="sublayers.list[]" type="checkbox" value="'+wmslayer.id+'">'+wmslayer.name+'</span></li>'
            }
            html = html
            + '</ul>';
        }

        $node = $(html);

        $node.find('input').on('click', function () {
            var layers = [];
            $node.find('input:checked').each(function (index, value) {
                layers.push($(value).val());
            });

            layer.setOptions({layers:layers.join(',')})

        });

        return $node;
    }
}

L.GeoManager.ProvidersFactory = {

    createSimpleTileLayerProvider: function (options) {
        return function (layer_options) {
            var dfd = new jQuery.Deferred()
                , layer = new L.TileLayer(options.url, options);

            layer.geomanager = {
                options: layer_options
                , renderOptionsForm: function () {
                    return L.GeoManager.OptionsFormsFactory.tileLayer(layer);
                }
            };

            dfd.resolve(layer);

            return dfd.promise();
        }
    }

    , createSimpleWMSTileLayerProvider: function (options) {
        return function (layer_options) {
            var dfd = new jQuery.Deferred()
                , url = options.url
                , opt = options;
            delete opt['url'];
            var layer = new L.TileLayer.WMS(url, opt);

            layer.geomanager = {
                options: layer_options
                , renderOptionsForm: function () {
                    return L.GeoManager.OptionsFormsFactory.tileLayer(layer);
                }
            };

            dfd.resolve(layer);

            return dfd.promise();
        }
    }

    , createGoogleLayerProvider: function (options) {
        return function (layer_options) {
            var dfd = new jQuery.Deferred();

            $.when(L.GeoManager.APILoaders.loadGoogleApi()).done(function () {
                var layer = new L.Google(options.googlelayer);

                layer.geomanager = {
                    options: layer_options
                    , renderOptionsForm: function () {
                        return L.GeoManager.OptionsFormsFactory.tileLayer(layer);
                    }
                };

                dfd.resolve(layer);
            });

            return dfd.promise();
        }
    }

    , createBingLayerProvider: function (options) {
        return function (layer_options) {
            var dfd = new jQuery.Deferred()
                , layer = new L.BingLayer(layer_options.key, options.binglayer);

            layer.geomanager = {
                options: layer_options
                , renderOptionsForm: function () {
                    return L.GeoManager.OptionsFormsFactory.tileLayer(layer);
                }
            };

            dfd.resolve(layer);


            return dfd.promise();
        }
    }

    , createYandexLayerProvider: function (options) {
        return function (layer_options) {
            var dfd = new jQuery.Deferred();

            $.when(L.GeoManager.APILoaders.loadYandexApi()).done(function () {
                var layer = new L.Yandex(options.yandexlayer);

                layer.geomanager = {
                    options: layer_options
                    , renderOptionsForm: function () {
                        return L.GeoManager.OptionsFormsFactory.tileLayer(layer);
                    }
                };

                dfd.resolve(layer);
            });

            return dfd.promise();
        }
    }

    , createArcGIS_EPSG900913_LayerProvider: function (options) {
        return function (layer_options) {
            var that = this;

            var dfd = new jQuery.Deferred();

            ajaxopt = {
                url : layer_options.url
                , dataType : 'jsonp'
                , data : {
                    'f' : 'json'
                }
            }

            $.ajax(ajaxopt)
            .done( function (layerinfo){
                var layer = new L.ArcGIS_EPSG900913();

                var geomanager={
                    sublayers: layerinfo.layers
                    , options: layer_options
                    , renderOptionsForm: function () {
                        return L.GeoManager.OptionsFormsFactory.wms(layer, geomanager.sublayers);
                    }

                };

                layer.geomanager = geomanager;

                dfd.resolve(
                    layer
                )

            });

            return dfd.promise();
        }
    }


}


L.GeoManager.LayersFactory = {

    createSimpleIndentifyLayer: function(clickPromise) {
        return L.Class.extend({

            initialize: function () {
            }

            , onAdd: function (map) {
                this._map = map;
                map.on('click', this._click, this);
                map.on('popupclose', this._popupClose, this);
            }

            , onRemove: function (map) {
                map.off('click', this._click, this);
                map.off('popupclose', this._popupClose, this);
            }

            , _popupClose: function (e) {
                var that = this;

                if (that._layer) {
                    that._map.removeLayer(that._layer);
                }
            }

            , _click: function (e) {
                var that = this;

                $.when(clickPromise(e.latlng)).done(function (georesult) {

                    if (georesult.layer) {
                        that._layer = georesult.layer;
                        that._map.addLayer(that._layer);
                    }

                    (new L.Popup())
                    .setLatLng(georesult.latlng)
                    .setContent(georesult.content)
                    .openOn(that._map);
                });

            }
        });
    }

}


/*
    Baselayers
*/

L.GeoManager.White = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'white'
    , type: 'baselayers'
    , url: 'img/1x1white.gif'
})

L.GeoManager.Black = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'black'
    , type: 'baselayers'
    , url: 'img/1x1black.gif'
})

L.GeoManager.OSM = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'osm'
    , type: 'baselayers'
    , url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
})

L.GeoManager.OSMBW = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'osmbw'
    , type: 'baselayers'
    , url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
})

L.GeoManager.OSMCloudMade = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'osmcloudmade'
    , type: 'baselayers'
    , key: function() {
        return L.GeoManager.prototype.apikeys['cloudmade'].value
    }
    , url: 'http://{s}.tile.cloudmade.com/{key}/997/256/{z}/{x}/{y}.png'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
})

L.GeoManager.OpenCycleMap = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'opencyclemap'
    , type: 'baselayers'
    , url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, <a href="http://www.opencyclemap.org">OpenCycleMap</a>'
})

L.GeoManager.OpenCycleMapTransport = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'opencyclemaptransport'
    , type: 'baselayers'
    , url: 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, <a href="http://www.opencyclemap.org">OpenCycleMap</a>'
})

L.GeoManager.OpenCycleMapLandscape = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'opencyclemaplandscape'
    , type: 'baselayers'
    , url: 'http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, <a href="http://www.opencyclemap.org">OpenCycleMap</a>'
})

L.GeoManager.MapQuest = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'mapquest'
    , type: 'baselayers'
    , url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg'
    , subdomains: '1234'
    , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a>'
})

L.GeoManager.MapQuestAerial = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'mapquestaerial'
    , type: 'baselayers'
    , url: 'http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg'
    , subdomains: '1234'
    , attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a>, Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})

L.GeoManager.StamenToner = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'samentoner'
    , type: 'baselayers'
    , url: 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png'
    , attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>'
    , maxZoom: 20
})

L.GeoManager.StamenTerrain = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'samenterrain'
    , type: 'baselayers'
    , url: 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
    , attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>'
    , minZoom: 4
    , maxZoom: 18
})

L.GeoManager.StamenWatercolor = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'samenwatercolor'
    , type: 'baselayers'
    , url: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
    , attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>'
    , minZoom: 3
    , maxZoom: 16
})

L.GeoManager.ESRIStreetMap = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'esristreetmap'
    , type: 'baselayers'
    , url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    , attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
})

L.GeoManager.ESRITopoMap = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'esritopomap'
    , type: 'baselayers'
    , url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    , attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
})

L.GeoManager.ESRIImagery = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'esriimagery'
    , type: 'baselayers'
    , url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    , attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
})

L.GeoManager.GoogleRoadmap = L.GeoManager.ProvidersFactory.createGoogleLayerProvider({
    name: 'googleroadmap'
    , type: 'baselayers'
    , googlelayer: 'ROADMAP'
});

L.GeoManager.GoogleSatellite = L.GeoManager.ProvidersFactory.createGoogleLayerProvider({
    name: 'googlesatellite'
    , type: 'baselayers'
    , googlelayer: 'SATELLITE'
});

L.GeoManager.GoogleHybrid = L.GeoManager.ProvidersFactory.createGoogleLayerProvider({
    name: 'googlehybrid'
    , type: 'baselayers'
    , googlelayer: 'HYBRID'
});

L.GeoManager.GoogleTerrain = L.GeoManager.ProvidersFactory.createGoogleLayerProvider({
    name: 'googleterrain'
    , type: 'baselayers'
    , googlelayer: 'TERRAIN'
});

L.GeoManager.BingRoad = L.GeoManager.ProvidersFactory.createBingLayerProvider({
    name: 'bingroad'
    , type: 'baselayers'
    , binglayer: {type:'Road'}
});

L.GeoManager.BingAerial = L.GeoManager.ProvidersFactory.createBingLayerProvider({
    name: 'bingaerial'
    , type: 'baselayers'
    , binglayer: {type:'Aerial'}
});

L.GeoManager.BingAerialWithLabels = L.GeoManager.ProvidersFactory.createBingLayerProvider({
    name: 'bingaerialwithlabels'
    , type: 'baselayers'
    , binglayer: {type:'AerialWithLabels'}
});


L.GeoManager.YandexMap = L.GeoManager.ProvidersFactory.createYandexLayerProvider({
    name: 'yandexmap'
    , type: 'baselayers'
    , yandexlayer: 'map'
});

L.GeoManager.YandexSatellite = L.GeoManager.ProvidersFactory.createYandexLayerProvider({
    name: 'yandexsatellite'
    , type: 'baselayers'
    , yandexlayer: 'satellite'
});

L.GeoManager.YandexHybrid = L.GeoManager.ProvidersFactory.createYandexLayerProvider({
    name: 'yandexhybrid'
    , type: 'baselayers'
    , yandexlayer: 'hybrid'
});

L.GeoManager.YandexPublicMap = L.GeoManager.ProvidersFactory.createYandexLayerProvider({
    name: 'yandexpublicmap'
    , type: 'baselayers'
    , yandexlayer: 'publicMap'
});

L.GeoManager.YandexPublicMapHybrid = L.GeoManager.ProvidersFactory.createYandexLayerProvider({
    name: 'yandexpublicmaphybrid'
    , type: 'baselayers'
    , yandexlayer: 'publicMapHybrid'
});

L.GeoManager.Wikimapia = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'wikimapia'
    , type: 'baselayers'
    , url: 'http://{s}{hash}.wikimapia.org/?x={x}&y={y}&zoom={z}&r=7071412&type=&lng=1'
    , subdomains : 'i'
    // Fix L.Util.template to use this https://github.com/Leaflet/Leaflet/pull/1554
    , hash: function (data) {
        return data.x % 4 + (data.y % 4) *4;
    }
    , maxZoom: 18
    , attribution: '<a href="http://wikimapia.org" target="_blank">Wikimapia.org</a>'
})

/*
    Overlays
*/


L.GeoManager.ArcGIS_EPSG900913_Overlay = L.GeoManager.ProvidersFactory.createArcGIS_EPSG900913_LayerProvider({
    name: 'arcgis_epsg900913'
    , type: 'overlays'
})

L.GeoManager.WikimapiaOverlay = L.GeoManager.ProvidersFactory.createSimpleTileLayerProvider({
    name: 'wikimapiaoverlay'
    , type: 'overlays'
    , url: 'http://{s}{hash}.wikimapia.org/?x={x}&y={y}&zoom={z}&r=6481976&type=hybrid&lng=1'
    , subdomains : 'i'
    // Fix L.Util.template to use this https://github.com/Leaflet/Leaflet/pull/1554
    , hash: function (data) {
        return data.x % 4 + (data.y % 4) *4;
    }
    , maxZoom: 18
    , attribution: '<a href="http://wikimapia.org" target="_blank">Wikimapia.org</a>'
})

L.GeoManager.UACadastre = L.GeoManager.ProvidersFactory.createSimpleWMSTileLayerProvider({
    name: 'uacadastre'
    , type: 'overlays'
    , url: 'http://212.26.144.110/geowebcache/service/wms'
    , layers: 'kadastr'
    , format: 'image/png'
    , transparent: true
    , crs: L.CRS.EPSG900913
    , maxZoom: 18
    , attribution: '<a href="http://dzk.gov.ua" target="_blank">ЦДЗК</a>'
});

/*
    Interactive layers
*/


L.GeoManager.ArgGIS = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    ajaxopt = {
	    url : 'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer'
	    , dataType : 'jsonp'
	    , data : {
	        'f' : 'json'
	    }
	}

	$.ajax(ajaxopt)
    .done( function (layerinfo){
		var layer =	new L.RUCadastre();

    	var geomanager={
            sublayers: layerinfo.layers
            , options: options
            , renderOptionsForm: function () {
                return L.GeoManager.OptionsFormsFactory.wms(layer, this.sublayers);
            }

        };

        layer.geomanager = geomanager;

        dfd.resolve(
            layer
        )

    });

    return dfd.promise();
}



L.GeoManager.OSMIdentify = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    var identify = function (latlng) {

        var dfdid = new jQuery.Deferred();

        $.ajax({
            url : 'http://nominatim.openstreetmap.org/reverse'
            , dataType : 'jsonp'
            , jsonp : 'json_callback'
            , data : {
                'lat' : latlng.lat
                , 'lon': latlng.lng
                , 'format' : 'json'
            }
        })
        .done(function(data){
            if (data) {
                var res=data;
                dfdid.resolve({
                    content : res.display_name
                    , latlng : new L.LatLng(res.lat, res.lon)
                });
            }
        });

        return dfdid.promise();
    }

    var layer = new (L.GeoManager.LayersFactory.createSimpleIndentifyLayer(identify))();

    var geomanager={
        options: options
    };

    layer.geomanager = geomanager;

    dfd.resolve(
        layer
    )

    return dfd.promise();
}

L.GeoManager.GoogleIdentify = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.when(L.GeoManager.APILoaders.loadGoogleApi()).done(function () {

        var identify = function (latlng) {

            var dfdid = new jQuery.Deferred();

            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({ 'latLng': new google.maps.LatLng(latlng.lat, latlng.lng)}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var res=results[0]
                        , bounds = new L.LatLngBounds([
                            res.geometry.viewport.getSouthWest().lat(), res.geometry.viewport.getSouthWest().lng()
                            ], [
                            res.geometry.viewport.getNorthEast().lat(), res.geometry.viewport.getNorthEast().lng()
                        ]);

                    dfdid.resolve({
                        content : res.formatted_address
                        , latlng : new L.LatLng(res.geometry.location.lat(), res.geometry.location.lng())
                        , bounds : bounds
                        , layer: new L.Rectangle(bounds)
                    });
                }
            });

            return dfdid.promise();
        }

        var layer = new (L.GeoManager.LayersFactory.createSimpleIndentifyLayer(identify))();

        var geomanager={
            options: options
        };

        layer.geomanager = geomanager;

        dfd.resolve(
            layer
        )


    });

    return dfd.promise();
}

L.GeoManager.BingIdentify = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    var identify = function (latlng) {

        var dfdid = new jQuery.Deferred();

        $.ajax({
            url : 'http://dev.virtualearth.net/REST/v1/Locations/'+latlng.lat+','+latlng.lng
            , dataType : 'jsonp'
            , jsonp : 'jsonp'
            , data : {
                'key' : options.key
            }
        })
        .done(function(data){
            if ((data.resourceSets.length>0) && (data.resourceSets[0].resources.length>0)) {
                var res=data.resourceSets[0].resources[0]
                    , bounds = new L.LatLngBounds([res.bbox[0], res.bbox[1]], [res.bbox[2], res.bbox[3]]);
                dfdid.resolve({
                    content : res.name
                    , latlng : new L.LatLng(res.point.coordinates[0], res.point.coordinates[1])
                    , bounds : bounds
                    , layer: new L.Rectangle(bounds)
                });
            }
        });

        return dfdid.promise();
    }

    var layer = new (L.GeoManager.LayersFactory.createSimpleIndentifyLayer(identify))();

    var geomanager={
        options: options
    };

    layer.geomanager = geomanager;

    dfd.resolve(
        layer
    )

    return dfd.promise();
}

L.GeoManager.YandexIdentify = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    var identify = function (latlng) {

        var dfdid = new jQuery.Deferred();

            $.ajax({
                url : 'http://geocode-maps.yandex.ru/1.x/'
                , dataType : 'jsonp'
                , data : {
                    'geocode' : latlng.lng + ',' + latlng.lat
                    , 'format' : 'json'
                }
            })
            .done(function(data){
                if (data.response.GeoObjectCollection.featureMember.length>0) {
                    var res=data.response.GeoObjectCollection.featureMember[0].GeoObject
                        , points = res.Point.pos.split(' ')
                        , lowerCorner = res.boundedBy.Envelope.lowerCorner.split(' ')
                        , upperCorner = res.boundedBy.Envelope.upperCorner.split(' ')
                        , content = res.metaDataProperty.GeocoderMetaData.text
                        , bounds = new L.LatLngBounds([lowerCorner[1], lowerCorner[0]], [upperCorner[1], upperCorner[0]]);

                    dfdid.resolve({
                        content : content
                        , latlng : new L.LatLng(points[1], points[0])
                        , bounds : bounds
                        , layer: new L.Rectangle(bounds)
                    });
                }
            });

        return dfdid.promise();
    }

    var layer = new (L.GeoManager.LayersFactory.createSimpleIndentifyLayer(identify))();

    var geomanager={
        options: options
    };

    layer.geomanager = geomanager;

    dfd.resolve(
        layer
    )

    return dfd.promise();
}

L.GeoManager.WikimapiaInteractive = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    var layer = new L.WikimapiaInteractive({
        key : L.GeoManager.prototype.apikeys['wikimapia'].value
        , onActiveFeature: function (feature, layer) {
            if (feature.name && feature.url) {
              layer
                .bindLabel(feature.name)
                .bindPopup('<a target="_blank" href="'+feature.url+'">'+ feature.name + '</a>');
            }
        }
        , onActiveFeatureStyle: function (feature) {
            return {color:"#ffcc00", weight:'1', fillOpacity:'0.4', opacity:'1'};
        }
        , style: function (feature) {
            return {color:"#0000FF", opacity:'1', weight:'1', fillOpacity:'0'};
        }
    })

    var geomanager={
        options: options
    };

    layer.geomanager = geomanager;

    dfd.resolve(
        layer
    )

    return dfd.promise();
}



L.GeoManager.OSMGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://nominatim.openstreetmap.org/search'
        , dataType : 'jsonp'
        , jsonp : 'json_callback'
        , data : {
            'q' : options.query
            , 'format' : 'json'
        }
    })
    .done(function(data){
        if (data.length>0) {
            var res=data[0]
                , bounds = new L.LatLngBounds([res.boundingbox[0], res.boundingbox[2]], [res.boundingbox[1], res.boundingbox[3]]);
            dfd.resolve({
                content : res.display_name
                , latlng : new L.LatLng(res.lat, res.lon)
                , bounds : bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}

L.GeoManager.GoogleGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.when(L.GeoManager.APILoaders.loadGoogleApi()).done(function () {

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': options.query }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var res = results[0]
                , resbounds = res.geometry.bounds ? res.geometry.bounds : res.geometry.viewport
                , bounds = new L.LatLngBounds([
                        resbounds.getSouthWest().lat(), resbounds.getSouthWest().lng()
                        ], [
                        resbounds.getNorthEast().lat(), resbounds.getNorthEast().lng()
                ]);

                dfd.resolve({
                    content : res.formatted_address
                    , latlng : new L.LatLng(res.geometry.location.lat(), res.geometry.location.lng())
                    , bounds : bounds
                    , layer: new L.Rectangle(bounds)
                });
            }
        });

    });

    return dfd.promise();
}

L.GeoManager.BingGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://dev.virtualearth.net/REST/v1/Locations'
        , dataType : 'jsonp'
        , jsonp : 'jsonp'
        , data : {
            'q' : options.query
            , 'key' : L.GeoManager.prototype.apikeys['bing'].value
        }
    })
    .done(function(data){
        if ((data.resourceSets.length>0) && (data.resourceSets[0].resources.length>0)) {
            var res=data.resourceSets[0].resources[0]
            , bounds = new L.LatLngBounds([res.bbox[0], res.bbox[1]], [res.bbox[2], res.bbox[3]]);
            dfd.resolve({
                content : res.name
                , latlng : new L.LatLng(res.point.coordinates[0], res.point.coordinates[1])
                , bounds : bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}

L.GeoManager.ESRIGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find'
        , dataType : 'jsonp'
        , data : {
            'text' : options.query
            , 'f' : 'pjson'
        }
    })
    .done(function(data){
        if (data.locations.length>0) {
            var res=data.locations[0]
                , bounds = new L.LatLngBounds([res.extent.ymin, res.extent.xmin], [res.extent.ymax, res.extent.xmax]);

            dfd.resolve({
                content : res.name
                , latlng : new L.LatLng(res.feature.geometry.y, res.feature.geometry.x)
                , bounds : bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}

L.GeoManager.YandexGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://geocode-maps.yandex.ru/1.x/'
        , dataType : 'jsonp'
        , data : {
            'geocode' : options.query
            , 'format' : 'json'
        }
    })
    .done(function(data){
        if (data.response.GeoObjectCollection.featureMember.length>0) {
            var res=data.response.GeoObjectCollection.featureMember[0].GeoObject
                , points = res.Point.pos.split(' ')
                , lowerCorner = res.boundedBy.Envelope.lowerCorner.split(' ')
                , upperCorner = res.boundedBy.Envelope.upperCorner.split(' ')
                , content = res.metaDataProperty.GeocoderMetaData.text
                , bounds = new L.LatLngBounds([lowerCorner[1], lowerCorner[0]], [upperCorner[1], upperCorner[0]]);

            dfd.resolve({
                content : content
                , latlng : new L.LatLng(points[1], points[0])
                , bounds: bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}

L.GeoManager.GeonamesGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://ws.geonames.org/searchJSON'
        , dataType : 'jsonp'
        , data : {
            'q' : options.query
            , 'style' : 'full'
            , 'maxRows' : '1'
        }
    })
    .done(function(data){
        if (data.geonames.length > 0) {
            var res=data.geonames[0]
                , bounds = new L.LatLngBounds([res.bbox.south, res.bbox.west], [res.bbox.north, res.bbox.east]);

            dfd.resolve({
                content : res.name
                , latlng : new L.LatLng(res.lat, res.lng)
                , bounds : bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}

L.GeoManager.MapQuestGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://www.mapquestapi.com/geocoding/v1/address'
        , dataType : 'jsonp'
        , data : {
            'location' : options.query
            , 'key' :  L.GeoManager.prototype.apikeys['mapquest'].value
            , 'outFormat' : 'json'
            , 'maxResults' : '1'
        }
    })
    .done(function(data){
        if (data.results.length > 0 && data.results[0].locations.length > 0) {
            var res=data.results[0]
                , location = res.locations[0].latLng
                , bounds = new L.LatLngBounds([location.lat-1, location.lng-1], [location.lat+1, location.lng+1]);
            dfd.resolve({
                content : res.providedLocation.location
                , latlng : new L.LatLng(location.lat, location.lng)
                , bounds : bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}

L.GeoManager.NokiaGeocode = function (options) {
    var that = this;

    var dfd = new jQuery.Deferred();

    $.ajax({
        url : 'http://geo.nlp.nokia.com/search/6.2/geocode.json'
        , dataType : 'jsonp'
        , jsonp : 'jsoncallback'
        , data : {
            'searchtext' : options.query
            , 'app_id' : L.GeoManager.prototype.apikeys['nokia'].value
        }
    })
    .done(function(data){
        if (data.Response.View.length > 0 && data.Response.View[0].Result.length > 0) {
            var res=data.Response.View[0].Result[0]
                , bounds = new L.LatLngBounds([res.extent.ymin, res.extent.xmin], [res.extent.ymax, res.extent.xmax]);
            dfd.resolve({
                content : res.name
                , latlng : new L.LatLng(res.Location.DisplayPosition.Latitude, res.Location.DisplayPosition.Longitude)
                , bounds : bounds
                , layer: new L.Rectangle(bounds)
            });
        }
    });

    return dfd.promise();
}
