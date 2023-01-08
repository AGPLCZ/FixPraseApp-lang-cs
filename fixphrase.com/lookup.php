<?php

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

require_once __DIR__ . "/FixPhrase.lib.php";

header("Access-Control-Allow-Origin: *");

/**
 * Build and send a simple JSON response.
 * @param string $msg A message
 * @param string $status "OK" or "ERROR"
 * @param array $data More JSON data
 */
function sendJsonResp(string $msg = null, string $status = "OK", array $data = null) {
    $resp = [];
    if (!is_null($data)) {
        $resp = $data;
    }
    if (!is_null($msg)) {
        $resp["msg"] = $msg;
    }
    $resp["status"] = $status;
    header("Content-Type: application/json");
    exit(json_encode($resp));
}

function exitWithJson(array $json) {
    header("Content-Type: application/json");
    exit(json_encode($json));
}

$output = [];

try {
    if (!empty($_GET["words"])) {
        // convert words to coordinates
        $words = urldecode($_GET["words"]);
        $words = trim(strtolower($words));
        $words = preg_replace('/\s+/', ' ', $words);
        $coords = FixPhrase::decode($words);

        $output = [
            "status" => "OK",
            "action" => "decodeFromWords",
            "words" => $words,
            "coords" => $coords
        ];
    } else if (!empty($_GET["latitude"]) && !empty($_GET["longitude"])) {
        // convert coordinates to words
        $lat = round($_GET["latitude"], 4);
        $lon = round($_GET["longitude"], 4);

        $words = FixPhrase::encode($lat, $lon);
        $output = [
            "status" => "OK",
            "action" => "encodeToWords",
            "words" => $words,
            "coords" => [
                $lat,
                $lon
            ]
        ];
    } else if (!empty($_GET["search"])) {
        /*
         * Please don't access this API endpoint if forking the code.  Substitute for a different API.
         */
        $resp = file_get_contents("https://data.netsyms.net/v1/gis/geocode/?address=" . urlencode($_GET["search"]));
        $data = json_decode($resp, true);

        if ($data["status"] == "OK") {
            $output = [
                "status" => "OK",
                "action" => "geocode",
                "coords" => $data["coords"]
            ];
        } else {
            throw new Exception($data["message"]);
        }
    } else {
        throw new Exception("Must supply either a string of words, a latitude/longitude pair, or a search query.");
    }
} catch (Exception $ex) {
    sendJsonResp($ex->getMessage(), "ERROR");
}

exitWithJson($output);
