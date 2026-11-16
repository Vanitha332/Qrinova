
// ==========================================
// QRINOVA - WEDDING LOCATION EXPERIENCE
// ==========================================

// Navigation button
const mapBtn = document.getElementById("mapBtn");

// Wedding destination
const venue = "8MGX+4V3 VTU PG Studies MCA, MBA and MTech, Sathgalli, Rammanahalli, Karnataka 570029";

// Exact destination coordinates
const venueLat = 12.325804;
const venueLng = 76.699837;

// Arrival radius in metres
const arrivalDistance = 50;

// Save arrival for this wedding destination
const arrivalKey = "qrinova_vtu_pg_arrived";

// Tracking variables
let arrived = false;
let watchId = null;


// ==========================================
// TEMPORARY GPS DIAGNOSTIC DISPLAY
// ==========================================

let debugPanel = null;

function showDebug(message) {

    if (!debugPanel) {

        debugPanel = document.createElement("div");

        debugPanel.style.background = "#f1f5ff";
        debugPanel.style.color = "#222";
        debugPanel.style.padding = "15px";
        debugPanel.style.marginTop = "20px";
        debugPanel.style.borderRadius = "12px";
        debugPanel.style.textAlign = "left";
        debugPanel.style.whiteSpace = "pre-line";
        debugPanel.style.fontSize = "14px";

        document.querySelector(".container").appendChild(debugPanel);
    }

    debugPanel.textContent = "QRINOVA GPS TEST\n\n" + message;
}

showDebug("Waiting for GPS location...");


// ==========================================
// STOP LOCATION TRACKING
// ==========================================

function stopLocationTracking() {

    if (watchId !== null && navigator.geolocation) {

        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}


// ==========================================
// SHOW THANK-YOU SECTION
// ==========================================

function showThankYouSection() {

    if (arrived) return;

    arrived = true;

    // Remember confirmed arrival on this device
    try {
        localStorage.setItem(arrivalKey, "true");
    } catch (error) {
        console.error("Could not save arrival:", error);
    }

    stopLocationTracking();

    const welcome = document.getElementById("welcomeSection");
    const thankYou = document.getElementById("thankYouSection");

    const welcomeVideo = document.getElementById("welcomeVideo");

    if (!welcome || !thankYou) {
        console.error("Welcome or thank-you section not found.");
        return;
    }

    // Stop welcome video
    if (welcomeVideo) {
        welcomeVideo.pause();
    }

    // Switch sections
    welcome.style.display = "none";
    thankYou.style.display = "block";

    // Thank-you video remains manual play

    console.log("Arrival confirmed. Thank-you section displayed.");
}


// ==========================================
// RESTORE PREVIOUSLY CONFIRMED ARRIVAL
// ==========================================

function restoreArrival() {

    let savedArrival = false;

    try {
        savedArrival = localStorage.getItem(arrivalKey) === "true";
    } catch (error) {
        console.error("Could not read saved arrival:", error);
    }

    if (savedArrival) {

        arrived = true;

        stopLocationTracking();

        const welcome = document.getElementById("welcomeSection");
        const thankYou = document.getElementById("thankYouSection");

        if (welcome && thankYou) {

            welcome.style.display = "none";
            thankYou.style.display = "block";
        }

        console.log("Previously confirmed arrival restored.");

        return true;
    }

    return false;
}


// ==========================================
// CALCULATE DISTANCE BETWEEN TWO LOCATIONS
// ==========================================

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}


// ==========================================
// PROCESS GPS LOCATION
// ==========================================

function processLocation(position) {

    if (arrived) return;

    const guestLat = position.coords.latitude;
    const guestLng = position.coords.longitude;

    const accuracy = position.coords.accuracy;

    const distance = calculateDistance(
        guestLat,
        guestLng,
        venueLat,
        venueLng
    );

    console.log("Guest latitude:", guestLat);
    console.log("Guest longitude:", guestLng);
    console.log("Distance from venue:", Math.round(distance), "metres");
    console.log("GPS accuracy:", Math.round(accuracy), "metres");

    showDebug(
        "GPS: Active\n" +
        "Latitude: " + guestLat + "\n" +
        "Longitude: " + guestLng + "\n" +
        "Distance: " + Math.round(distance) + " metres\n" +
        "Accuracy: " + Math.round(accuracy) + " metres\n" +
        "Arrival radius: " + arrivalDistance + " metres\n" +
        "Status: " +
        (distance <= arrivalDistance
            ? "Within arrival radius"
            : "Outside arrival radius")
    );

    if (distance <= arrivalDistance) {

        showThankYouSection();
    }
}


// ==========================================
// HANDLE GPS ERRORS
// ==========================================

function handleLocationError(error) {

    console.error("GPS error:", error.code, error.message);

    let errorMessage = "";

    if (error.code === 1) {

        errorMessage = "Permission denied. Allow location access in Chrome.";

    } else if (error.code === 2) {

        errorMessage = "Position unavailable. Phone could not obtain GPS location.";

    } else if (error.code === 3) {

        errorMessage = "GPS request timed out. Waiting for another location result.";

    } else {

        errorMessage = "Unknown GPS error: " + error.message;
    }

    showDebug(
        "GPS: ERROR\n\n" +
        errorMessage +
        "\n\nError code: " + error.code +
        "\n\nWaiting for another location update..."
    );
}


// ==========================================
// START LOCATION TRACKING
// ==========================================

function startLocationTracking() {

    if (arrived || watchId !== null) return;

    if (!navigator.geolocation) {

        showDebug("GPS ERROR\n\nThis browser does not support location services.");

        console.error("Geolocation is not supported.");

        return;
    }

    showDebug("Waiting for GPS location...");

    watchId = navigator.geolocation.watchPosition(

        function(position) {

            processLocation(position);
        },

        function(error) {

            handleLocationError(error);
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 30000
        }
    );

    console.log("Qrinova GPS tracking started.");
}


// ==========================================
// REFRESH LOCATION WHEN RETURNING TO PAGE
// ==========================================

function refreshLocation() {

    if (restoreArrival()) return;

    stopLocationTracking();

    startLocationTracking();
}


// ==========================================
// OPEN GOOGLE MAPS
// ==========================================

mapBtn.addEventListener("click", function() {

    const mapUrl =
        "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(venue);

    // Open Maps in the same tab
    window.location.href = mapUrl;

});


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

if (!restoreArrival()) {

    startLocationTracking();
}


// ==========================================
// WHEN GUEST RETURNS TO QRINOVA
// ==========================================

document.addEventListener("visibilitychange", function() {

    if (document.visibilityState === "hidden") {

        stopLocationTracking();

    } else {

        refreshLocation();
    }

});


// ==========================================
// WHEN BROWSER RESTORES THE PAGE
// ==========================================

window.addEventListener("pageshow", function() {

    refreshLocation();
});


// ==========================================
// WHEN GUEST LEAVES THE PAGE
// ==========================================

window.addEventListener("pagehide", function() {

    stopLocationTracking();
});
