
// ==========================================
// QRINOVA - WEDDING LOCATION EXPERIENCE
// ==========================================

// Navigation button
const mapBtn = document.getElementById("mapBtn");

// Wedding venue address
const venue = "Gowrishankara Kalyana Mantapa, KT99/A 5th Cross, Bannur Main Rd, Marigowda Layout, PES Kyathengere Layout, Kyathumgere, Karnataka 571401";

// Actual wedding venue coordinates
const venueLat = 12.510803;
const venueLng = 76.877504;

// Arrival detection distance
const arrivalDistance = 50;

// Prevent repeated arrival detection
let arrived = false;
let watchId = null;
let checkingLocation = false;


// ==========================================
// OPEN GOOGLE MAPS
// ==========================================

mapBtn.addEventListener("click", function() {

    const mapUrl =
        "https://www.google.com/maps/dir/?api=1&destination="
        + encodeURIComponent(venue);

    // Open Maps using the same browser tab
    window.location.href = mapUrl;

});


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
// SHOW THANK-YOU VIDEO
// ==========================================

function showThankYouSection() {

    if (arrived) return;

    arrived = true;

    // Stop location tracking
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    const welcome = document.getElementById("welcomeSection");
    const section = document.getElementById("thankYouSection");

    const welcomeVideo = document.getElementById("welcomeVideo");
    const thankYouVideo = document.getElementById("thankYouVideo");

    // Stop welcome video
    if (welcomeVideo) {
        welcomeVideo.pause();
    }

    // Change displayed section
    welcome.style.display = "none";
    section.style.display = "block";

    // Start thank-you video
    thankYouVideo.play().catch(function(error) {
        console.log(
            "Automatic video playback was blocked:",
            error
        );
    });

}


// ==========================================
// PROCESS GUEST LOCATION
// ==========================================

function processLocation(position) {

    if (arrived) return;

    const guestLat = position.coords.latitude;
    const guestLng = position.coords.longitude;

    const distance = calculateDistance(
        guestLat,
        guestLng,
        venueLat,
        venueLng
    );

    console.log(
        "Distance from wedding venue:",
        Math.round(distance),
        "metres"
    );

    console.log(
        "GPS accuracy:",
        Math.round(position.coords.accuracy),
        "metres"
    );

    if (distance <= arrivalDistance) {
        showThankYouSection();
    }

}


// ==========================================
// CHECK LOCATION ONCE
// ==========================================

function checkGuestLocation() {

    if (arrived || checkingLocation) return;

    if (!navigator.geolocation) {
        console.log("Geolocation is not supported.");
        return;
    }

    checkingLocation = true;

    navigator.geolocation.getCurrentPosition(

        function(position) {

            checkingLocation = false;
            processLocation(position);

        },

        function(error) {

            checkingLocation = false;

            console.log(
                "Location error:",
                error.message
            );

        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 20000
        }

    );

}


// ==========================================
// CONTINUOUS LOCATION TRACKING
// ==========================================

function startLocationTracking() {

    if (arrived || watchId !== null) return;

    if (!navigator.geolocation) return;

    watchId = navigator.geolocation.watchPosition(

        function(position) {
            processLocation(position);
        },

        function(error) {
            console.log(
                "Location tracking error:",
                error.message
            );
        },

        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 20000
        }

    );

}


// ==========================================
// INITIAL LOCATION CHECK
// ==========================================

checkGuestLocation();
startLocationTracking();


// ==========================================
// CHECK WHEN GUEST RETURNS TO QRINOVA
// ==========================================

document.addEventListener("visibilitychange", function() {

    if (document.visibilityState === "visible") {

        checkGuestLocation();

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        startLocationTracking();

    }

});


// ==========================================
// CHECK WHEN BROWSER RESTORES THE PAGE
// ==========================================

window.addEventListener("pageshow", function() {

    checkGuestLocation();

    startLocationTracking();

});
