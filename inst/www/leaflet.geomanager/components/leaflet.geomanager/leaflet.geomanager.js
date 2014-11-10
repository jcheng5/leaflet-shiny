/*! Copyright (c) 2013 Oleg Smith (http://olegsmith.com)
 *  Licensed under the MIT License.
 *
 *  L.GeoManager uses jQuery for JSONP requests (http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js)
 */


L.GeoManager = L.Class.extend({
    options: {
        tag: 'geomanager0'
        , selectors: [
            '[data-geomanager-interactivelayers="{tag}"]'
            , '[data-geomanager-overlays="{tag}"]'
            , '[data-geomanager-baselayers="{tag}"]'


        ]
    }

    , apikeys:[]

    , providers: []

    , initialize: function (in_options) {
        var that = this
            , options = L.extend({}, in_options);

        that.setOptions(options);
    }

    , registerAPIKeys: function(apikeys) {
        for (var i=0; i<apikeys.length;i++) {
            var apikey = apikeys[i];
            L.GeoManager.prototype.apikeys[apikey.name]=apikey;
        }
    }

    , onAdd: function (map) {
        var that = this;
        that._map = map;

        map.on('popupclose', this._popupClose, this);

        that._layers=new L.LayerGroup();
        that._layers.addTo(that._map);

        that.setOptions(that.options);
        that._bindActions(L.GeoManager.prototype.providers);
    }

    , _popupClose: function() {
        var that = this;
        if (that._geocodelayer) {
            that._map.removeLayer(that._geocodelayer);
            console.log('remove geocode layer');
        }
    }

    , onRemove: function (map) {
        map.off('popupclose', this._popupClose, this);
    }

    , addTo: function (map) {
        map.addLayer(this);
        return this;
    }

    , _getFunctionByName: function (functionName) {
        var context = window
            , namespaces = functionName.split(".")
            , func = namespaces.pop();

        for(var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }

        return context[func];
    }

    , _renderLayer: function(in_node) {
        var that=this
            , geomanager_type = in_node.attr('data-geomanager-type')
            , geomanager_options_attr = in_node.attr('data-geomanager-options')
            , geomanager_options = geomanager_options_attr ? JSON.parse(geomanager_options_attr) : {}
            , provider = that._getFunctionByName(geomanager_options.providername);

        geomanager_options.map = that._map;

        layerPromise = provider(geomanager_options);

        $.when(layerPromise).done(function (layer) {

            layer.geomanager.provider = provider;

            var $node = that.layerTemplate(layer);

            // set layer in data
            $node.data('geomanager',layer);

            // remove layer action
            $node.find('i.icon-remove-sign-right').on('click', function (e) {
                    e.stopPropagation();
                    $node.remove();
                    that.refreshLeafletLayers();
            });

            in_node.replaceWith($node);

            if (that._timer) {
                window.clearTimeout(that._timer);
            }

            that._timer = window.setTimeout(function() {
                that.refreshLeafletLayers();
            }, 500);

        });

    }

    , refreshLeafletLayers: function () {
        var that=this
            , i
            , layers
            , sel
            , blayers = []
            , tag = that.options.tag
            , selectors = that._selectors;

        for (i=0; i<selectors.length; i++) {
            var selector = selectors[i];
            $(selector + ' [data-geomanager-layer]').each(function (index, value) {
                var layer = $(value).data('geomanager');
                blayers.push(layer);
            });
        }

        that._layers.clearLayers();

        layers = blayers;

        for (i=0; i<layers.length;i++) {
            that._layers.addLayer(layers[i], true);
            if (layers[i].bringToBack) {
                layers[i].bringToBack();
            }
        }

    }

    , _bindActions: function (providers) {
        var that=this
            , tag = that.options.tag
            , selectors = that._selectors
            , i
            , timer;

        for (i=0; i<selectors.length; i++) {
            var $sel =  $(selectors[i]);

            $sel.children('[data-geomanager-type]').each(function (index, value) {
                var $node = $(value);

                that._renderLayer($node);

            });

            $sel.sortable({})

            .on( "sortupdate", function( event, ui ) {

                $node = ui.item;

                if ($node.attr('data-geomanager-type')) {
                    that._renderLayer($node);
                } else {
                    that.refreshLeafletLayers();
                }

            });

        }

        $( '[data-geomanager-sourcelayers="'+tag+'"] [data-geomanager-type]' ).each(function (index, value) {
            var $node=$(value)
            , geomanager_type_attr = $node.attr('data-geomanager-type');

            $node.draggable({
                connectToSortable: '[data-geomanager-'+geomanager_type_attr+'="'+that.options.tag+'"]'
                , helper: 'clone'
                , revert: 'invalid'
                , appendTo: '#'+that.options.tag+'drag'
            })
        });

    }

    , _updateSelectors: function() {
        var that=this
            , selectortemplates = that.options.selectors
            , selectors = [];

        for (i=0; i<selectortemplates.length; i++) {

            selectors.push(L.Util.template(selectortemplates[i], {tag:that.options.tag}));

        }

        that._selectors = selectors;
    }

    , setOptions:function (in_options) {
        var that = this
            , options = L.extend({}, in_options);

        if (options && options.tag) {
            that.options.tag = options.tag;
            that._updateSelectors();
        }

        if (options && options.apikeys) {
            that.options.apikeys = L.extend(that.options.apikeys, options.apikeys);
        }

        return this;
    }

    , layerTemplate: function (layer) {
        var html =''
            , tid = 'geomanager'+ Math.floor(Math.random()*100000)
            , optionsForm = layer.geomanager.renderOptionsForm
            , provider = layer.geomanager.provider
            , css = layer.geomanager.options.providername.toLowerCase().replace(/\./g,'-');


            html = html
            +'<li data-geomanager-layer>'
            +'  <div class="round clearfix">'
            +'     <i class="icon-remove icon-remove-sign-right"></i>'
            + (optionsForm ? '     <i class="icon-edit icon-edit-sign-right" data-toggle="collapse" data-target="div[data-geomanager-optionsform=\'' + tid + '\']"></i>' : '')
            // layer thrumb
            //+'     <img style="float:left;" class="thumbnail layer-thumbnail layer-thumb-'+css+'" src="components/leaflet.geomanager/img/1x1.png">'
            +'     <span style="float:left;margin:4px;">'+layer.geomanager.options.title+'</span>'
            +'     <div class="clearfix"></div>'
            +'     <div data-geomanager-optionsform="' + tid + '" class="collapse" style="margin-top:10px;">'
            +'     </div>'
            +'  </div>'
            +'</li>'

            var $node = $(html);
            if (optionsForm) {
                $node.find('[data-geomanager-optionsform]').append(optionsForm());
            }

            return $node;
    }

    , geocode: function(options) {
        var that=this
            , provider = that._getFunctionByName(options.providername);

        $.when(provider({query:options.query})).done(function (georesult) {

            if (georesult.layer) {
                    that._map.closePopup();
                    that._geocodelayer = georesult.layer;
                    that._map.addLayer(that._geocodelayer);
            }

            if (georesult.bounds) {
                that._map.fitBounds(georesult.bounds);
            }

            (new L.Popup())
            .setLatLng(georesult.latlng)
            .setContent(georesult.content)
            .openOn(that._map);
        });
    }

});

// Support functions in L.Util.template https://github.com/Leaflet/Leaflet/pull/1554
if (L.version == '0.5.1') {

  L.Util.template = function (str, data) {
    return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
      var value = data[key];
      if (!data.hasOwnProperty(key)) {
        throw new Error('No value provided for variable ' + str);
      } else if (typeof value === 'function') {
        value = value(data);
      }

      return value;
    });
  }

}
