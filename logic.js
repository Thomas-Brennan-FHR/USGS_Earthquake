// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesURL ="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

  // get the tectonic plate data
  d3.json(platesURL, function(json) {

      createFeatures(data.features, json.features);
  });
  
});


function createFeatures(earthquakeData, plateData) {

  var earthquakes=[];
  var plates=[];

  for (var i = 0; i < earthquakeData.length; i++) {

    earthquakes.push(
      L.circle([earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]], {
        stroke: false,
        fillOpacity: 0.75,
        color: colors(earthquakeData[i].properties.mag),
        fillColor: colors(earthquakeData[i].properties.mag),
        radius: Math.pow(earthquakeData[i].properties.mag,2)*10000
      }).bindPopup(`${earthquakeData[i].properties.place}`));
  };



  for (var i = 0; i < plateData.length; i++) {

    plates.push(
      L.geoJson(plateData, {
        style: {color: "white",
                weight: 1.5}
      }));
  };


  var plates_layer = L.layerGroup(plates);
  var earthquake_layer = L.layerGroup(earthquakes);

  createMap(earthquake_layer,plates_layer);

}


function colors(mag) {
  if (mag<1){
    var color = "#FFFF33";
  }
  else if (mag<2){
    var color = "#FFFF00";
  }
  else if (mag<3){
    var color = "#CCCC00";
  }
  else if (mag<4){
    var color = "#999900";
  }
  else if (mag<5){
    var color = "#666600";
  }
  else {var color = "#333300";}
return color;
}



function createMap(earthquake_layer,plates_layer) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Outdoor Map": outdoormap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquake_layer,
    "Fault Lines": plates_layer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquake_layer, plates_layer]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


//Legend
var plotLegend = L.control({position: 'bottomright'});

  plotLegend.onAdd = function (myMap) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = ["#FFFF33", "#FFFF00", "#CCCC00", "#999900", "#666600", "#333300"];

      div.setAttribute("style", "background-color:#777777;padding:3px;color:#FFFFFF;");

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              // '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
              '<i style="background:' + labels[i] + '">&nbsp;&nbsp;&nbsp;</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };
  plotLegend.addTo(myMap);
}