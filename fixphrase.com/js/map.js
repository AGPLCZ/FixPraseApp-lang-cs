/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var map = null;
var popup = null;
function createMap() {
    if (mapboxgl.supported()) {
        $("#mapbox").css("display", "");
        map = maplibreMap();
    } else {
        console.log("maplibre-gl not supported, disabling map");
        $("#mapbox").css("display", "none");
    }
}

function setMapStyle(style) {
    var styleurl = "https://maps.netsyms.net/styles/osm-liberty/style.json";
    switch (style) {
        case "street":
            styleurl = "https://maps.netsyms.net/styles/osm-liberty/style.json";
            break;
        case "dark":
            styleurl = "https://maps.netsyms.net/styles/osm-liberty-dark/style.json";
            break;
        case "terrain":
            styleurl = "https://maps.netsyms.net/styles/klokantech-terrain/style.json";
            break;
        case "satellite":
            styleurl = "https://api.maptiler.com/maps/hybrid/style.json?key=AYuZSCBTy6vqGBlP0PwL";
            break;
        default:
            styleurl = "https://maps.netsyms.net/styles/osm-liberty/style.json";
    }
    map.setStyle(styleurl);
}

function centerMapOnLocation(latitude, longitude) {
    map.removeMarkers();
    map.addMarker(latitude, longitude);
    map.animateMapIn(latitude, longitude, 16);
}

/**
 * Destroy and re-create the map.
 * @returns {undefined}
 */
function reloadMap() {
    try {
        if (map != null && typeof map != 'undefined') {
            map.off();
            map.remove();
            map = null;
            createMap();
        } else {
            createMap();
        }
    } catch (ex) {
// oh well ¯\(°_o)/¯
        console.log(ex);
        $("#mapbox").css("display", "none");
    }
}

function setMapLocation(latitude, longitude) {
    if (map == null) {
        return;
    }
    map.setMapLocation(latitude, longitude);
}

function animateMapIn(latitude, longitude, zoom, heading) {
    if (map == null) {
        return;
    }
    if (typeof zoom == 'undefined') {
        zoom = 1;
    }
    if (typeof heading == 'undefined') {
        heading = 0;
    }
    map.animateMapIn(latitude, longitude, zoom, heading);
}

function showLocationPopup(latitude, longitude, words, accuracy) {
    if (popup != null) {
        popup.remove();
        clearRectangle();
    }
    popup = new mapboxgl.Popup();
    popup.setLngLat({lat: latitude, lng: longitude});
    popup.setHTML("<b><span class='copyonclick'>" + words + "</span></b><br>" + (Math.round(latitude * 10000) / 10000) + ", " + (Math.round(longitude * 10000) / 10000));
    popup.addTo(map);
    popup._closeButton.onclick = clearRectangle;
    drawRectangle(
            latitude - (accuracy / 2),
            longitude - (accuracy / 2),
            latitude + (accuracy / 2),
            longitude + (accuracy / 2)
            );
    window.location.hash = words.replaceAll(" ", "-");
}

function drawRectangle(fromlat, fromlng, tolat, tolng) {
    var geojson = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [
                [
                    [fromlng, fromlat],
                    [fromlng, tolat],
                    [tolng, tolat],
                    [tolng, fromlat],
                    [fromlng, fromlat]
                ]
            ]
        }
    };
    if (typeof map.getSource("rectangle") == "undefined") {
        map.addSource('rectangle', {
            'type': 'geojson',
            data: geojson
        });
    }
    if (typeof map.getLayer('rectangle') == "undefined") {
        map.addLayer({
            'id': 'rectangle',
            'type': 'fill',
            'source': 'rectangle',
            'layout': {},
            'paint': {
                'fill-color': '#088',
                'fill-opacity': 0.5
            }
        });
    }
    map.getSource("rectangle").setData(geojson);
}

function clearRectangle() {
    if (typeof map.getLayer("rectangle") != "undefined") {
        map.removeLayer('rectangle');
    }
}

function lookupAndShowCoords(latitude, longitude) {
    var words = FixPhrase.encode(latitude, longitude);

    map.flyTo({
        center: {
            lat: latitude,
            lng: longitude
        },
        zoom: Math.max(map.getZoom(), 14)
    });

    showLocationPopup(latitude, longitude, words, 0.0001);
}