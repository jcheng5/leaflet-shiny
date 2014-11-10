L.GeoManager.RUCadastreIdentify = function (options) {
        var that = this;

        var dfd = new jQuery.Deferred();

        var layer = new L.RUCadastreIdentify({template:function(identify_data, find_data) {
            var identify_attr = identify_data.results[0].attributes
              , layerId = identify_data.results[0].layerId
              , find_attr = find_data ? find_data.features[0].attributes : null;

            return ''
            + (layerId <= 3 ? ''
              + '<div><b>Кадастровый номер</b>: '+identify_attr['Кадастровый номер земельного участка']+'</div>'
              + '<ul class="nav nav-tabs" style="width:300px;">'
              + '<li class="active"><a href="#rucadinfo" onclick="setActiveTab(event)">Информация</a></li>'
              + '<li><a href="#rucadsrv" onclick="setActiveTab(event)">Услуги</a></li>'
              + '</ul>'
              + '<div class="tab-content">'
              + '<div class="tab-pane active" id="rucadinfo" style="height:100px; overflow:auto">'
              + '<div><b>Кадастровая единица</b>: '+identify_data.results[0].layerName+'</div>'
              + (find_data ? ''
                + '<div><b>Адрес</b>: ' +find_attr['OBJECT_ADDRESS']+ '</div>'
                + '<div><b>Декларированная площадь</b>: ' +find_attr['AREA_VALUE']+ ' кв. м</div>'
                + '<div><b>Кадастровая стоимость</b>: ' +find_attr['CAD_COST']+ ' руб.</div>'
                + '<div><b>Дата постановки на учет</b>: ' +(new Date(find_attr['DATE_CREATE'])).format("dd.mm.yyyy")+ '</div>'
              + '' : '')
              + '<div><b>Категория земель</b>: ' +identify_attr['Категория земель (код)']+ '</div>'
              + '<div><b>Статус земельного участка</b>: '+identify_attr['Статус земельного участка (код)']+'</div>'
              + '</div>'
              + '<div class="tab-pane" id="rucadsrv" style="height:100px; overflow:auto">'
              + '<a href="https://rosreestr.ru/wps/portal/cc_information_online?KN='+identify_attr['Кадастровый номер земельного участка']+'"  target="_blank">Справочная информация об объекте недвижимости в режиме онлайн</a><br/>'
              + '<a href="https://rosreestr.ru/wps/portal/cc_gkn_form_new?KN='+identify_attr['Кадастровый номер земельного участка']+'&objKind=002001001000"  target="_blank">Запрос о предоставлении сведений ГКН</a><br/>'
              + '<a href="https://rosreestr.ru/wps/portal/cc_egrp_form_new?KN='+identify_attr['Кадастровый номер земельного участка']+'&objKind=002001001000"  target="_blank">Запрос о предоставлении сведений ЕГРП</a><br/>'
              + '</div>'
              + '</div>'
              + '' : ''
            + '')

            + (layerId > 3 ? ''
              + '<div><b>Кадастровый номер</b>: '+identify_attr['Кадастровый номер']+'</div>'
              + '<div><b>Кадастровая единица</b>: '+identify_data.results[0].layerName+'</div>'
              + (layerId >= 12 ? ''
                + '<div><b>Наименование</b>: '+identify_attr['Наименование']+'</div>'
              + '' : '')
              + (layerId < 12 ? ''
                + '<div><b>Категория земель</b>: ' +identify_attr['Категория земель (код)']+ '</div>'
                + '<div><b>Вид разрешенного использования</b>: ' +identify_attr['Вид разрешенного использования (код)']+ '</div>'
              + '' : '')
            + '' : '');


          }})

        var geomanager={
            options: options
        };

        layer.geomanager = geomanager;

        dfd.resolve(
            layer
        )

        return dfd.promise();
}


L.GeoManager.RUCadastreGeocode = function (options) {

    var that=this
    , cadnum = options.query
    , cadparts = cadnum.split(':')
    , cadjoin = cadparts.join('')
    //, bounds = arg.bounds
    , unproject = function (x, y) {
        var earthRadius = 6378137;
        return L.CRS.EPSG900913.projection.unproject((new L.Point(x, y)).divideBy(earthRadius));
    }
    , ajaxopt
    , ajaxtype
    , zoom;

    var dfd = new jQuery.Deferred();

    if (cadparts.length==4) {
        ajaxtype='find';
        ajaxopt = {
            url : 'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/exts/GKNServiceExtension/online/parcel/find'
            , dataType : 'jsonp'
            , data : {
                'f' : 'json'
                , 'cadNum' : cadnum
                , 'onlyAttributes' : 'false'
                , 'returnGeometry' : 'true'
            }
        }
    } else {
        var ajaxtype='query';

        if (cadjoin.length < 3) {
            zoom = 1;
        } else if (cadjoin.length < 5) {
            zoom = 7;
        } else {
            zoom = 12;
        }

        ajaxopt = {
            url : 'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/'+zoom+'/query'
            , dataType : 'jsonp'
            , data : {
                'f' : 'json'
                , 'where' : 'PKK_ID like \''+cadjoin+'%\''
                , 'returnGeometry' : 'true'
                , 'spatialRel' : 'esriSpatialRelIntersects'
                , 'outFields' : '*'
            }
        }
    }


    $.ajax(ajaxopt)
    .done(function(data){
        if (data.features.length>0) {
            var res=data.features[0].attributes
                , bounds = new L.LatLngBounds(unproject(res['XMIN'],res['YMIN']), unproject(res['XMAX'],res['YMAX']))
                , content;

            if (ajaxtype=='find') {
                content = ''
                    + 'Кадастровый номер: ' + res['CAD_NUM'] + '<br/>'
                    + 'Адрес объекта: ' + res['OBJECT_ADDRESS'] + '<br/>'
                    + 'Площадь: ' + res['AREA_VALUE'] + '<br/>'
                    + 'Кадастровая стоимость: ' + res['CAD_COST'] + '<br/>'
            } else {
                content = ''
                    + 'Кадастровый номер: '+ res['CAD_NUM'] + '<br/>'
                    + (zoom < 12 ? 'Наименование: ' + res['NAME'] + '<br/>' : '')
            }



            var layers = 'show%3A'
                , id = res['PKK_ID'] //? res['PKK_ID'] : res['CAD_NUM']
                , idlen = id.length
                , lids = []
                , layerDefs = '';

                if (idlen<=4) {
               		lids=[9,10,11,12,13,14]
                } else if (idlen<=11) {
               		lids=[5,6,7,8]
                } else if (idlen<=16) {
               		lids=[2,3,4]
                }



            for (var i=0;i<lids.length-1;i++) {
                layers=layers+lids[i]+'%3A';
                layerDefs=layerDefs+lids[i]+'%3APKK_ID%20LIKE%20%27'+id+'%27%3B';
            }
                layers=layers+lids[i];
                layerDefs=layerDefs+lids[i]+'%3APKK_ID%20LIKE%20%27'+id+'%27';

            var layer = new L.RUCadastre({url:'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer', layers:layers, layerDefs:layerDefs, opacity: 0.5});

            dfd.resolve({
                content : content
                , latlng : unproject(res['XC'],res['YC'])
                , bounds : bounds
                , layer: layer
            });

        }
    });




    return dfd.promise();
}