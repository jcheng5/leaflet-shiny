#' @export
createLeafletMap <- function(session, outputId) {

  # Need to provide some trivial output, just to get the binding to render
  session$output[[outputId]] <- renderText("")

  # This function is how we "dynamically" invoke code on the client. The
  # method parameter indicates what leaflet operation we want to perform,
  # and the other arguments will be serialized to JS objects and used as
  # client side function args.
  send <- function(method, func, msg) {
    
    msg <- msg[names(formals(func))]
    names(msg) <- NULL
    
    origDigits <- getOption('digits')
    options(digits=22)
    on.exit(options(digits=origDigits))
    session$sendCustomMessage('leaflet', list(
      mapId = outputId,
      method = method,
      args = msg
    ))
  }
  
  baseimpl <- function() {
    send(`__name__`, sys.function(), as.list(environment()))
  }
  
  # Turns a call like:
  #
  #     stub(setView(lat, lng, zoom, forceReset = FALSE))
  #
  # into:
  #
  #     list(setView = function(lat, lng, zoom, forceReset = FALSE) {
  #       send("setView", sys.function(), as.list(environment()))
  #     })
  stub <- function(prototype) {
    # Get the un-evaluated expression
    p <- substitute(prototype)
    # The function name is the first element
    name <- as.character(p[[1]])
    
    # Get textual representation of the expression; change name to "function"
    # and add a NULL function body
    txt <- paste(deparse(p), collapse = "\n")
    txt <- sub(name, "function", txt, fixed = TRUE)
    txt <- paste0(txt, "NULL")
    
    # Create the function
    func <- eval(parse(text = txt))
    
    # Replace the function body, using baseimpl's body as a template
    body(func) <- substituteDirect(
      body(baseimpl),
      as.environment(list("__name__"=name))
    )
    environment(func) <- environment(baseimpl)
    
    # Return as list
    structure(list(func), names = name)
  }
  
  structure(c(
    stub(setView(lat, lng, zoom, forceReset = FALSE)),
    stub(fitBounds(lat1, lng1, lat2, lng2)),
    
	stub(addFeature(layerId, data, mode, name, note, style)),
    stub(removeFeatures(layerId)),
    stub(clearFeatures(mode)),

    stub(showPopup(lat, lng, content, layerId = NULL, options=list())),
    stub(removePopup(layerId)),
    stub(clearPopups()),

    stub(addLabel(layerId, text, mode))
  ), class = "leaflet_map")
}

#' @export
leafletMap <- function(
  outputId, width, height,
  initialTileLayer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
  initialTileLayerAttribution = HTML('&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'), 
  options=NULL) {
  
  addResourcePath("leaflet", system.file("www", package="leaflet"))

  if (is.numeric(width))
    width <- sprintf("%dpx", width)
  if (is.numeric(height))
    height <- sprintf("%dpx", height)
  
  tagList(
    singleton(
      tags$head(
        tags$link(rel="stylesheet", type="text/css", href="leaflet/leaflet.css"),
		tags$link(rel="stylesheet", type="text/css", href="leaflet/Leaflet.draw-0.2.3/dist/leaflet.draw.css"),
		tags$link(rel="stylesheet", type="text/css", href="leaflet/leaflet-control-geocoder/Control.Geocoder.css"),
		tags$link(rel="stylesheet", type="text/css", href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css"),
		tags$link(rel="stylesheet", type="text/css", href="leaflet/Leaflet.label/dist/leaflet.label.css"),
		
        tags$script(src="leaflet/leaflet.js"),
		
		tags$script(src="https://maps.google.com/maps/api/js?v=3&sensor=false"),		
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/Leaflet.draw.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/Edit.Poly.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/Edit.SimpleShape.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/Edit.Circle.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/Edit.Rectangle.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.Feature.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.Polyline.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.Polygon.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.SimpleShape.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.Rectangle.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.Circle.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/handler/Draw.Marker.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/ext/LatLngUtil.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/ext/GeometryUtil.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/ext/LineUtil.Intersect.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/ext/Polyline.Intersect.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/ext/Polygon.Intersect.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/Control.Draw.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/Tooltip.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/Toolbar.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/draw/DrawToolbar.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/EditToolbar.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/EditToolbar.Edit.js"),
        tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/EditToolbar.Delete.js"),
		tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/EditToolbar.Delete.js"),		
		tags$script(src="leaflet/Leaflet.draw-0.2.3/src/edit/handler/EditToolbar.Delete.js"),

		tags$script(src="leaflet/leaflet-control-geocoder/Control.Geocoder.js"),
		tags$script(src="leaflet/Leaflet.EasyButton/easy-button.js"),
		tags$script(src="leaflet/leaflet-plugins-1.2.0/layer/tile/Google.js"),
		tags$script(src="leaflet/esri-leaflet-v1.0.0-rc.4/esri-leaflet.js"),
		tags$script(src="leaflet/Leaflet.MakiMarkers/Leaflet.MakiMarkers.js"),
			
		tags$script(src="leaflet/Leaflet.label/src/Label.js"),
		tags$script(src="leaflet/Leaflet.label/src/BaseMarkerMethods.js"),
		tags$script(src="leaflet/Leaflet.label/src/Marker.Label.js"),
		tags$script(src="leaflet/Leaflet.label/src/CircleMarker.Label.js"),
		tags$script(src="leaflet/Leaflet.label/src/Path.Label.js"),
		tags$script(src="leaflet/Leaflet.label/src/Map.Label.js"),
		tags$script(src="leaflet/Leaflet.label/src/FeatureGroup.Label.js"),
		        		
		tags$script(src="leaflet/binding.js")
      )
    ),
    tags$div(
      id = outputId, class = "leaflet-map-output",
      style = sprintf("width: %s; height: %s", width, height),
      `data-initial-tile-layer` = initialTileLayer,
      `data-initial-tile-layer-attrib` = initialTileLayerAttribution,
      
      tags$script(
        type="application/json", class="leaflet-options",
        ifelse(is.null(options), "{}", RJSONIO::toJSON(options))
      )
    )
  )
}
