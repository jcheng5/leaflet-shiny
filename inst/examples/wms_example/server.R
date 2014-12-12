
# This is the server logic for a Shiny web application.
# You can find out more about building applications with Shiny here:
#
# http://shiny.rstudio.com
#
require(leaflet)
library(shiny)

shinyServer(function(input, output, session) {

  map <- createLeafletMap(session, 'map')

  observe({
    date <- paste(input$date,"T06:00:00.000Z",sep='')
    print(date)
    map$addWMS(url='http://tds0.ifremer.fr/thredds/wms/GLO-BLENDED_WIND_L4-V3-OBS_FULL_TIME_SERIE?',
               layer='wind_speed',time=date,
               scaleRange="0,30",nBands=50)
  })
  

})

