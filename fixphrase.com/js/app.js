/*
 Copyright 2021 Netsyms Technologies.

 Redistribution and use in source and binary forms, with or without modification, are permitted
 provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice, this list of conditions
 and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice, this list of
 conditions and the following disclaimer in the documentation and/or other materials provided with
 the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors may be used to
 endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

window.onload = function () {
    $("#mapbox").css("height", "calc(100% - " + $("#map-style-switcher").css("height") + ")");

    createMap();

    var bgs = [
        "dale-nibbe-GR09HcWwP-w-unsplash.jpg",
        "hide-obara-VzWx1l2LuIA-unsplash.jpg",
        "john-fowler-jcbq3qWpKoo-unsplash.jpg",
        "mark-harpur-K2s_YE031CA-unsplash.jpg",
        "renns-art-TXhxOXHN1EE-unsplash.jpg",
        "solotravelgoals-7kLufxYoqWk-unsplash.jpg"
    ];
    var bgimg = bgs[Math.floor(Math.random() * bgs.length)];
    $("body").css("background-image", "url(./img/bg/" + bgimg + ")");

    map.resize();

    // Load style preference from cookie
    var cookies = decodeURIComponent(document.cookie).split("; ");
    cookies.forEach(val => {
        if (val.indexOf("mapstyle") === 0) {
            var style = val.substring(9);
            setMapStyle(style);
            $("#map-style-switcher a.nav-link").removeClass("active");
            $("#map-style-switcher a.nav-link[data-style=" + style + "]").addClass("active");
        }
    });

    $("body").on("click", ".copyonclick", function () {
        var copyitem = $(this);
        var copytext = copyitem.text();
        if (copytext == "Copied to clipboard!") {
            // prevent copying copied text if double-clicked
            return;
        }
        navigator.clipboard.writeText(copytext).then(() => {
            copyitem.text("Copied to clipboard!");
            setTimeout(function () {
                copyitem.text(copytext);
            }, 1000);
        });
    });

    $("body").on("keypress", "#wordbox,#wordbox-mobile", function (e) {
        if (e.which == 13) {
            dolookup($(this).val());
        }
    });

    $("#map-style-switcher").on("click", "a.nav-link", function (e) {
        e.preventDefault();
        $("#map-style-switcher a.nav-link").removeClass("active");
        setMapStyle($(this).data("style"));
        $(this).addClass("active");

        // Save style preference in cookie
        var date = new Date();
        date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
        document.cookie = "mapstyle=" + $(this).data("style") + "; expires=" + date.toUTCString();
    });

    // Read URL hash and try to parse it
    window.addEventListener('hashchange', function () {
        parseWindowHash();
    }, false);
    // Don't try to read hash until map is loaded, this prevents errors
    var checkIfMapLoaded = function () {
        if (map.isStyleLoaded()) {
            parseWindowHash();
        } else {
            setTimeout(checkIfMapLoaded, 200);
        }
    };
    checkIfMapLoaded();
};

function dolookup(words) {
    try {
        words = words.trim().toLowerCase().replace(/\s+/g, ' ');

        if (!/^[a-z ]+?$/i.test(words)) {
            // Not a FixPhrase, run a search
            $.getJSON("lookup.php", {
                search: words
            }, function (resp) {
                if (resp.status == "OK") {
                    lookupAndShowCoords(resp.coords[0], resp.coords[1]);
                } else {
                    alert("Error: " + resp.msg);
                }
            });
            return;
        }

        var coords = FixPhrase.decode(words);

        showLocationPopup(coords[0], coords[1], coords[3], coords[2]);
        $("#wordbox").val(coords[3]);
        $("#wordbox-mobile").val(coords[3]);

        var zoomlevel = 18;
        switch (coords[2]) {
            case 0.1:
                zoomlevel = 10;
                break;
            case 0.01:
                zoomlevel = 13;
                break;
        }
        map.animateMapIn(coords[0], coords[1], zoomlevel);
    } catch (e) {
        alert(e);
    }
}

function parseWindowHash() {
    var hash = window.location.hash.substr(1);
    if (/^-?[0-9]{1,2}\.?[0-9]*,-?[0-9]{1,3}\.?[0-9]*$/.test(hash)) {
        var lat = hash.split(",")[0];
        var lon = hash.split(",")[1];
        lat = (Math.round(lat * 10000) / 10000);
        lon = (Math.round(lon * 10000) / 10000);
        lookupAndShowCoords(lat, lon);
    } else if (/^[a-z]+\-[a-z]+\-?[a-z]+?\-?[a-z]+?$/.test(hash)) {
        var words = hash.replaceAll("-", " ");
        dolookup(words);
        $("#wordbox").val(words);
        $("#wordbox-mobile").val(words);
    } else if (/^[a-z]+\ [a-z]+\ ?[a-z]+?\ ?[a-z]+?$/.test(decodeURI(hash))) {
        var words = decodeURI(hash);
        dolookup(words);
    }
}