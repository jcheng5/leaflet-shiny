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
  list(
    setView = function(lat, lng, zoom, forceReset = FALSE) {
      send('setView', sys.function(), as.list(environment()))
    },
    addMarker = function(lat, lng, layerId = NULL, options = list()) {
      send('addMarker', sys.function(), as.list(environment()))
    },
    clearMarkers = function() {
      send('clearMarkers', sys.function(), as.list(environment()))
    },
    clearShapes = function() {
      send('clearShapes', sys.function(), as.list(environment()))
    },
    fitBounds = function(lat1, lng1, lat2, lng2) {
      send('fitBounds', sys.function(), as.list(environment()))
    },
    addRectangle = function(lat1, lng1, lat2, lng2,
                            layerId = NULL, options=list()) {
      send('addRectangle', sys.function(), as.list(environment()))
    },
    addCircle = function(lat, lng, radius, layerId = NULL, options=list()) {
      send('addCircle', sys.function(), as.list(environment()))
    },
    addPolygon = function(lat, lng, layerId, options, defaultOptions) {
      send('addPolygon', sys.function(), as.list(environment()))
    },
    showPopup = function(lat, lng, content, layerId = NULL, options=list()) {
      send('showPopup', sys.function(), as.list(environment()))
    },
    removePopup = function(layerId) {
      send('removePopup', sys.function(), as.list(environment()))
    },
    clearPopups = function() {
      send('clearPopups', sys.function(), as.list(environment()))
    }
  )
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
        HTML('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.css" />
<!--[if lte IE 8]>
  <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.ie.css" />
<![endif]-->
<script src="http://cdn.leafletjs.com/leaflet-0.5/leaflet.js"></script>'),
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
