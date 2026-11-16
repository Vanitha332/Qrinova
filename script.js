
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

// Arrival radius
const arrivalDistance = 50;

// Save arrival separately for this wedding destination
const arrivalKey = "qrinova_vtu_pg_arrived";

// Tracking variables
let arrived = false;
let watchId = null;


// ==========================================
// SHOW THANK-YOU SECTION
// ==========================================

function showThankYouSection() {

    if (arrived) return;

    arrived = true;

    // Remember confirmed arrival on this device
    localStorage.setItem(arrivalKey, "true");

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

    // Do not autoplay the thank-you video.
    // Guest can press its Play button.

    console.log("Arrival confirmed. Thank-you section displayed.");
}


// ==========================================
// RESTORE PREVIOUSLY CONFIRMED ARRIVAL
// ==========================================

function restoreArrival() {

    if (localStorage.getItem(arrivalKey) === "true") {
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
// CALCULATE DISTANCE
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
// CHECK GUEST LOCATION
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

    console.log("Distance from venue:", Math.round(distance), "metres");
    console.log("GPS accuracy:", Math.round(accuracy), "metres");

    if (distance <= arrivalDistance) {
        showThankYouSection();
    }
}


// ==========================================
// STOP LOCATION TRACKING
// ==========================================

function stopLocationTracking() {

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}


// ==========================================
// START LOCATION TRACKING
// ==========================================

function startLocationTracking() {

    if (arrived || watchId !== null) return;

    if (!navigator.geolocation) {
        console.error("This browser does not support GPS location.");
        return;
    }

    watchId = navigator.geolocation.watchPosition(

        function(position) {
            processLocation(position);
        },

        function(error) {
            console.error("GPS error:", error.message);
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
// REFRESH LOCATION WHEN RETURNING
// ==========================================

function refreshLocation() {

    if (restoreArrival()) return;

    // Restart GPS tracking
    stopLocationTracking();
    startLocationTracking();
}


// ==========================================
// OPEN GOOGLE MAPS
// ==========================================

mapBtn.addEventListener("click", function() {

    const mapUrl =
        "https://www.google.com/maps/dir/?api=1&destination="
        + encodeURIComponent(venue);

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
