const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    console.log(data);
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Create an array to store earthquake markers
    let markers = [];

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the earthquake.
    function onEachFeature(feature, layer) {
        // Determine the depth from the third coordinate
        let depth = feature.geometry.coordinates[2];

        // Define the marker style
        let markerStyle = {
            radius: feature.properties.mag * 4,
            color: 'white',
            fillColor: getColor(depth),
            fillOpacity: 0.8
        };

        // Bind popup to each feature
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${depth}</p>`);

        // Create a circle marker and add it to the markers array
        let circleMarker = L.circleMarker(layer.getLatLng(), markerStyle);
        markers.push(circleMarker);
    }
    
    // Function to determine the fill color based on depth
    function getColor(depth) {
        if (depth > 89.5) {
            return 'red';
        } else if (depth > 69.5) {
            return 'darkorange';
        } else if (depth > 49.5) {
            return 'orange';
        } else if (depth > 29.5) {
            return 'yellow';
        } else if (depth > 9.5) {
            return 'limegreen';
        } else {
            return 'green';
        }
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: function (feature) {
            let depth = feature.geometry.coordinates[2];
            return {
                radius: feature.properties.mag * 4,
                fillColor: getColor(depth),
                color: 'white',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
        },
        onEachFeature: onEachFeature
    });

    // Create the base layer.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", { 
        center: [37.09, -95.71],
        zoom: 3,
        layers: [street, earthquakes]
    });

    // Add legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            depthRanges = ['0-10', '10-30', '30-50', '50-70', '70-90', '90+'],
            colors = ['green', 'limegreen', 'yellow', 'orange', 'darkorange', 'red'];

        // Loop through depth ranges and generate a label with a colored square for each depth range
        for (let i = 0; i < depthRanges.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                depthRanges[i] + '<br>';
        }

        return div;
    };

    legend.addTo(myMap);
}


