// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson


// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create circle based on the magnitude for each event
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Set color of circle based on event magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#ff3333"
    }
    else if (magnitude < 2) {
      return "#ff9900"
    }
    else if (magnitude < 3) {
      return "#32cd32"
    }
    else if (magnitude < 4) {
      return "#0099ff"
    }
    else if (magnitude < 5) {
      return "#9966ff"
    }
    else {
      return "#666699"
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define Outdoor, Satellite, and Grayscale map layers
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultLine = new L.LayerGroup();

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Greyscale Map": grayscale,
    "Outdoor Map": outdoor,
    "Satellite Map": satellite
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine

  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [grayscale, earthquakes]
  });

  // Create a control for the map layers and add the overlay layers
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Query to retrieve the faultline data
  var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

  // Create the faultlines and add them to the faultline layer
  d3.json(tectonicURL, function (data) {
    L.geoJSON(data, {
      style: function () {
        return { color: "gold", fillOpacity: 0 }
      }
    }).addTo(faultLine)
  })

  // color function to be used when creating the legend
  function getColor(d) {
    return d > 5 ? '#666699' :
      d > 4 ? '#9966ff' :
        d > 3 ? '#0099ff' :
          d > 2 ? '#32cd32' :
            d > 1 ? '#ff9900' :
              '#ff3333';
  }

  // Add legend to the map
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      mags = [0, 1, 2, 3, 4, 5],
      labels = [];

    // Loop through density intervals to create a label with a box for each event
    for (var i = 0; i < mags.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
        mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }

    return div;
  };
  // Add legend to map layer
  legend.addTo(myMap);
}


