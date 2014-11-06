
# This is the user-interface definition of a Shiny web application.
# You can find out more about building applications with Shiny here:
#
# http://shiny.rstudio.com
#
require(leaflet)
library(shiny)

shinyUI(fluidPage(

  titlePanel("Leaflet WMS example"),

  sidebarLayout(
    sidebarPanel(
      h5('Global Ocean Wind Speed'),
      h6('Source URL: http://tds0.ifremer.fr/thredds/wms/GLO-BLENDED_WIND_L4-V3-OBS_FULL_TIME_SERIE?'),
      dateInput(inputId = 'date',
                label = 'Date',min = '2013-01-01',
                max = Sys.Date()-3)
    ),
    
    mainPanel(
      leafletMap(outputId = 'map',
                 width='100%',
                 height=500,
                 options=list(
                   center = c(10, 0),
                   zoom = 1))
    )
  )
))
