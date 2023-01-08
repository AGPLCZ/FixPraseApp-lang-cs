/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function maplibreMap() {

    var theme = "liberty";

    $("#mapbox").css("background-color", "#EFEFEF");

    var map = new mapboxgl.Map({
        container: 'mapbox',
        style: "https://maps.netsyms.net/styles/osm-liberty/style.json",
        //attributionControl: false,
        interactive: true,
        pitch: 0,
        zoom: 1,
        maxZoom: 20,
        continuousWorld: false,
        noWrap: true,
        center: [-97, 38]
    });

    map.on('click', function (e) {
        var coordinates = e.lngLat;
        try {
            var latitude = (Math.round(coordinates.lat * 10000) / 10000);
            var longitude = (Math.round(coordinates.lng * 10000) / 10000);
            lookupAndShowCoords(latitude, longitude);
        } catch (e) {
            alert(e);
        }
    });

    map.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true
    }), 'top-left');

    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
            timeout: 10 * 1000
        },
        fitBoundsOptions: {
            maxZoom: 16
        },
        trackUserLocation: true
    }), 'top-left');

    map.addControl(new mapboxgl.ScaleControl({
        unit: "imperial"
    }));

    map.mapEasing = function (t) {
        return t * (2 - t);
    };

    map.setMapHeading = function (heading) {
        if (typeof heading == 'number') {
            map.easeTo({
                bearing: heading,
                easing: map.mapEasing
            });
        }
    };

    map.setMapLocation = function (latitude, longitude) {
        map.easeTo({
            center: [
                longitude,
                latitude
            ]
        });
    };

    map.animateMapIn = function (latitude, longitude, zoom, heading) {
        if (typeof zoom == 'undefined') {
            zoom = 10;
        }
        if (typeof heading == 'undefined') {
            heading = 0;
        }
        map.flyTo({
            center: [
                longitude,
                latitude
            ],
            speed: 1,
            zoom: zoom,
            heading: heading,
            pitch: 0
        });
    };

    map.addMarker = function (latitude, longitude) {
        var el = document.createElement("div");

        el.className = "map-marker";
        new mapboxgl.Marker(el).setLngLat([longitude, latitude]).addTo(map);
    };

    map.removeMarkers = function () {
        var oldmarkers = document.getElementsByClassName("map-marker");
        if (oldmarkers.length > 0) {
            markerparent = oldmarkers[0].parentNode;
            while (oldmarkers.length > 0) {
                markerparent.removeChild(oldmarkers[0]);
            }
        }
    }

    return map;
}