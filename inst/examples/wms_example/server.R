
# This is the server logic for a Shiny web application.
# You can find out more about building applications with Shiny here:
#
# http://shiny.rstudio.com
#
require(leaflet)
library(shiny)

shinyServer(function(input, output, session) {

  map <- createLeafletMap(session, 'map')
  

})
