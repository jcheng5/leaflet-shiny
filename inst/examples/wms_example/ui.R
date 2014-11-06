
# This is the user-interface definition of a Shiny web application.
# You can find out more about building applications with Shiny here:
#
# http://shiny.rstudio.com
#
require(leaflet)
library(shiny)

shinyUI(fluidPage(

  # Application title
  titlePanel("Leaflet WMS example"),

  # Sidebar with a slider input for number of bins
  sidebarLayout(
    sidebarPanel(
      sliderInput("bins",
                  "Number of bins:",
                  min = 1,
                  max = 50,
                  value = 30)
    ),

    # Show a plot of the generated distribution
    mainPanel(
      leafletMap(outputId = 'map',
                 width=600,
                 height=600,
                 options=list(
                   center = c(55.362, -1.50),
                   zoom = 5))
    )
  )
))
