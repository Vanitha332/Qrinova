
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
const arrivalDistance = 100;

// Tracking variables
let arrived = false;
let watchId = null;


// ==========================================
// GET PAGE ELEMENTS
// ==========================================

const welcome = document.getElementById("welcomeSection");
const thankYou = document.getElementById("thankYouSection");

const welcomeVideo = document.getElementById("welcomeVideo");
const thankYouVideo = document.getElementById("thankYouVideo");


// ==========================================
// RESET FOR EVERY FRESH PAGE LOAD
// ==========================================

function resetExperience() {

    arrived = false;

    if (welcome) {
        welcome.style.display = "block";
    }

    if (thankYou) {
        thankYou.style.display = "none";
    }

    if (welcomeVideo) {
        welcomeVideo.pause();
        welcomeVideo.currentTime = 0;
    }

    if (thankYouVideo) {
        thankYouVideo.pause();
        thankYouVideo.currentTime = 0;
    }
}

resetExperience();


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

    // Stop GPS after arrival is confirmed
    stopLocationTracking();

    if (!welcome || !thankYou) {
        console.error("Welcome or thank-you section not found.");
        return;
    }

    // Stop welcome video
    if (welcomeVideo) {
        welcomeVideo.pause();
    }

    // Reset thank-you video to beginning
    if (thankYouVideo) {
        thankYouVideo.pause();
        thankYouVideo.currentTime = 0;
    }

    // Display thank-you section
    welcome.style.display = "none";
    thankYou.style.display = "block";

    // Thank-you video remains manual play
    console.log("Arrival confirmed. Thank-you section displayed.");
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

    // Calculate distance from wedding venue
    const distance = calculateDistance(
        guestLat,
        guestLng,
        venueLat,
        venueLng
    );

    // GPS information stays inside the browser
    // and is not displayed or saved.
    console.log("GPS accuracy:", accuracy, "metres");

    // Check whether guest is within 100 metres
    if (distance <= arrivalDistance) {

        showThankYouSection();
    }
}


// ==========================================
// HANDLE GPS ERRORS
// ==========================================

function handleLocationError(error) {

    console.error(
        "GPS error:",
        error.code,
        error.message
    );

    if (error.code === 1) {

        console.error("Location permission denied.");

    } else if (error.code === 2) {

        console.error("Position unavailable.");

    } else if (error.code === 3) {

        console.error("GPS request timed out.");

    } else {

        console.error("Unknown GPS error.");
    }
}


// ==========================================
// START LOCATION TRACKING
// ==========================================

function startLocationTracking() {

    if (arrived || watchId !== null) return;

    if (!navigator.geolocation) {

        console.error("Geolocation is not supported.");

        return;
    }

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

    // Preserve thank-you section after arrival
    // during the same QR experience.
    if (arrived) return;

    stopLocationTracking();

    startLocationTracking();
}


// ==========================================
// OPEN GOOGLE MAPS
// ==========================================

if (mapBtn) {

    mapBtn.addEventListener("click", function() {

        const mapUrl =
            "https://www.google.com/maps/dir/?api=1&destination=" +
            encodeURIComponent(venue);

        // Open Maps in the same tab
        window.location.href = mapUrl;

    });
}


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

// Every fresh page load starts a new GPS check.
// No previous arrival status is restored.

startLocationTracking();


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
