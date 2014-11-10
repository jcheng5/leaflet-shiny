/*! Copyright (c) 2013 Oleg Smith (http://olegsmith.com)
 *  Licensed under the MIT License.
 *
 *  L.RUCadastreIdentify uses jQuery for JSONP requests (http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js)
 */

/*
 * L.RUCadastre
 */

L.RUCadastre = L.Class.extend({
    includes: L.Mixin.Events

    , options: {
         url:'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer'
        , bboxsr:'102100'
        , imagesr:'102100'
        , format: 'PNG8'
        , transparent: 'true'
        , opacity: 1
        , attribution:'<a href="http://maps.rosreestr.ru/PortalOnline/" target="_blank">Росреестр</a>'

    }

    , imgTimer:null
    , imgTimerCounter:0

    , initialize: function (options) {
        L.setOptions(this, options);
        this._url = this.options.url;
    }

    , setOptions: function (newOptions) {
        L.setOptions(this, newOptions);
        if (this._map) {
            this._reset();
        }
    }

    , onAdd: function (map) {
        this._map = map;

        if (!this._image) {
            this._initImage();
        }

        if (!this._bounds) {
            this._bounds = this._map.getBounds();
        }

        map._panes.overlayPane.appendChild(this._image);

        map.on('viewreset', this._reset, this);
        map.on('moveend', this._reset, this);
        map.on('zoomend', this._reset, this);


        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    }

    , onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._image);

        map.off('viewreset', this._reset, this);
        map.off('moveend', this._reset, this);
        map.off('zoomend', this._reset, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
    }

    , addTo: function (map) {
        map.addLayer(this);
        return this;
    }

    , setOpacity: function (opacity) {
        this.options.opacity = opacity;
        this._updateOpacity();
        return this;
    }

    // TODO remove bringToFront/bringToBack duplication from TileLayer/Path
    , bringToFront: function () {
        if (this._image) {
            this._map._panes.overlayPane.appendChild(this._image);
        }
        return this;
    }

    , bringToBack: function () {
        var pane = this._map._panes.overlayPane;
        if (this._image) {
            pane.insertBefore(this._image, pane.firstChild);
        }
        return this;
    }

    , getAttribution: function () {
        return this.options.attribution;
    }

    , _initImage: function () {
        this._image = L.DomUtil.create('img', 'leaflet-image-layer');

        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
        } else {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
        }

        this._updateOpacity();

        //TODO createImage util method to remove duplication
        L.extend(this._image, {
              galleryimg: 'no'
            , onselectstart: L.Util.falseFn
            , onmousemove: L.Util.falseFn
            , onload: L.bind(this._onImageLoad, this)
            , src: this._getImageUrl()
        });
    }

    , _getImageUrl: function () {
        //construct the export image url
        var bnds = this._map.getBounds()
            , sz = this._map.getSize()
            , sw = L.CRS.EPSG900913.project(bnds.getSouthWest())
            , ne = L.CRS.EPSG900913.project(bnds.getNorthEast())
            , bbox = 'bbox=' + ne.x + ',' + sw.y + ',' + sw.x + ',' + ne.y + '&bboxsr='+this.options.bboxsr+'&imageSR='+this.options.imagesr
            , size = '&size=' + sz.x + ',' + sz.y
            , format = '&format=' + this.options.format
            , transparent = '&transparent=' + this.options.transparent
            , url = this._url + '/export?' + bbox + size + format + transparent + '&f=image';

        if (this.options.layers) {
            var layers = '&layers=' + this.options.layers;
            url += layers;
        }

        if (this.options.layerDefs) {
            var layerDefs = '&layerDefs=' + this.options.layerDefs;
            url += layerDefs;
        }

        return url; // this._url + '/export?' + bbox + size + layers + format + transparent + '&f=image';
    }

    , _animateZoom: function (e) {
        var map = this._map
            , image = this._image
            , scale = map.getZoomScale(e.zoom)
            , nw = this._bounds.getNorthWest()
            , se = this._bounds.getSouthEast()
            , topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center)
            , size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft)
            , origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

        image.style[L.DomUtil.TRANSFORM] =
                L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
    }

    , _reset: function () {
        //console.log('_reset');
        var that=this;

        var image = that._image
            , topLeft = that._map.latLngToLayerPoint(that._bounds.getNorthWest())
            , size = that._map.latLngToLayerPoint(that._bounds.getSouthEast())._subtract(topLeft);

        L.DomUtil.setPosition(image, topLeft);

        image.style.width = size.x + 'px';
        image.style.height = size.y + 'px';

        if (that.imgTimer) {
          window.clearTimeout(that.imgTimer);
        }

        that.imgTimer = window.setTimeout(function() {

            that.imgTimerCounter++;

            var cacheimg = new Image();
            cacheimg.src = that._getImageUrl();

            cacheimg.onload=function() {

                that.imgTimerCounter--;

                if (that.imgTimerCounter == 0) {

                    that._bounds = that._map.getBounds();

                    var image = that._image
                        , topLeft = that._map.latLngToLayerPoint(that._bounds.getNorthWest())
                        , size = that._map.latLngToLayerPoint(that._bounds.getSouthEast())._subtract(topLeft);

                    that._image.src = that._getImageUrl();
                    L.DomUtil.setPosition(image, topLeft);

                    image.style.width = size.x + 'px';
                    image.style.height = size.y + 'px';
                }
            }
        }, 10);

    }


    , _onImageLoad: function () {
        this.fire('load');
    }

    , _updateOpacity: function () {
        L.DomUtil.setOpacity(this._image, this.options.opacity);
    }

});


/*
 * L.RUCadastreIdentify
 */

L.RUCadastreIdentify = L.Control.extend({
    options: {
                template:function(identify_data, find_data) {
                    var attr=identify_data.results[0].attributes;
                    return 'Кадастровый номер:'+attr['Кадастровый номер']+'<br/>'+
                    'Категория земель (код):'+attr['Категория земель (код)']+'<br/>'+
                    'Вид разрешенного использования (код):'+attr['Вид разрешенного использования (код)']+'<br/>'+
                    'Значение кадастровой стоимости:'+attr['Значение кадастровой стоимости']+'<br/>';
                }
                , url:'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer'
                , findurl:'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/exts/GKNServiceExtension/online/parcel'
    }

    , onAdd: function (map) {

        this._map = map;

        map.on('click', this._identify, this);
        map.on('popupclose', this._unselect, this);


        return L.DomUtil.create('div', 'leaflet-control-rucadastre-identify');;
    }

    , onRemove: function (map) {
        map.off('click', this._identify, this);
        map.off('popupclose', this._unselect, this);
    }

    , _identify : function (e) {
        this.identify(e.latlng)
    }

    , identify:function(latlng) {
        var that=this
            , xy = L.CRS.EPSG900913.project(latlng)
            , bnds = this._map.getBounds()
            , sw = L.CRS.EPSG900913.project(bnds.getSouthWest())
            , ne = L.CRS.EPSG900913.project(bnds.getNorthEast())
            , idenifyUrl= this.options.url+'/identify?f=json&geometry={%22x%22%3A'+xy.x+'%2C%22y%22%3A'+xy.y+'%2C'+
            '%22spatialReference%22%3A{%22wkid%22%3A102100}}&tolerance=0&returnGeometry=false'+
            '&mapExtent={%22xmin%22%3A'+sw.x+'%2C%22ymin%22%3A'+sw.y+'%2C%22xmax%22%3A'+ne.x+'%2C%22ymax%22%3A'+ne.y+'%2C'+
            '%22spatialReference%22%3A{%22wkid%22%3A102100}}'+
            '&imageDisplay=1634%2C517%2C96&geometryType=esriGeometryPoint&sr=102100&layers=top';

        // MSIE needs cors support
        jQuery.support.cors = true;

        $.ajax({url:idenifyUrl,dataType:'jsonp'})
        .done(function(identify_data){
            //console.log(identify_data);
            if (identify_data.results.length>0) {
                var layers = 'show%3A'
                    , id = identify_data.results[0].value
                    , layerId = identify_data.results[0].layerId
                    , lids = []
                    , layerDefs = '';

                if (layerId<4) {
                    lids=[2,3,4];
                } else if (layerId<9) {
                    lids=[5,6,7,8]
                } else if (layerId<15) {
                    lids=[9,10,11,12,13,14]
                } else {
                    lids=[15,16,17,18,19,20]
                }

                for (var i=0;i<lids.length-1;i++) {
                    layers=layers+lids[i]+'%3A';
                    layerDefs=layerDefs+lids[i]+'%3APKK_ID%20LIKE%20%27'+id+'%27%3B';
                }
                    layers=layers+lids[i];
                    layerDefs=layerDefs+lids[i]+'%3APKK_ID%20LIKE%20%27'+id+'%27';


                if (typeof that._selected==='undefined') {
                    that._selected = new L.RUCadastre({url:that.options.url, layers:layers, layerDefs:layerDefs, opacity: 0.5});
                    that._map.addLayer(that._selected);
                } else {
                    that._selected.setOptions({layers:layers, layerDefs:layerDefs});
                }

                that._popup=new L.Popup();
                that._popup.setLatLng(latlng).setContent(that.options.template(identify_data, null)).addTo(that._map);
                that._map.openPopup(that._popup);

                var cadprop = layerId<4 ? 'Кадастровый номер земельного участка' : 'Кадастровый номер'
                    , cadnum =identify_data.results[0].attributes[cadprop] //identify_data.results[0].attributes['Строковый идентификатор ИПГУ']
                    , findUrl = that.options.findurl + '/find?cadNums=[%27'+cadnum+'%27]&onlyAttributes=false&returnGeometry=true&f=json'
                if (!(typeof cadnum === 'undefined')) {
                    $.ajax({url:findUrl,dataType:'jsonp'})
                    .done(function(find_data){
                        if (find_data.features.length>0) {
                            that._popup.setContent(that.options.template(identify_data, find_data));
                        }
                    });
                }
            }
        });

    }

    , _unselect:function(e) {
        var that=this;
        if ((that._popup===e.popup) && !(typeof that._selected==='undefined')) {
            that._map.removeLayer(that._selected);
            delete that._selected;
        }
    }

});
