require('mapbox.js');
var config = require('./config.json');

console.log(L, config)

L.mapbox.accessToken = config.mapbox.APIToken;
var map = global.map = L.mapbox.map('map', config.mapbox.mapId)
    .setView([48.8588111,2.3643813], 14),
    geocoder = L.mapbox.geocoder('mapbox.places-v1');

map._controlCorners.topright.appendChild(document.querySelector('.block'));
