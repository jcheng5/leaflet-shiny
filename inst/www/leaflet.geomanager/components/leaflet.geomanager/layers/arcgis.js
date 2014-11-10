/*
 * L.RUCadastre
 */

L.ArcGIS_EPSG900913 = L.Class.extend({
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