
// Get the navigation button
const mapBtn = document.getElementById("mapBtn");

// Wedding venue address
const venue = "Gowrishankara Kalyana Mantapa, KT99/A 5th Cross, Bannur Main Rd, Marigowda Layout, PES Kyathengere Layout, Kyathumgere, Karnataka 571401";

// Wedding venue coordinates
const venueLat = 12.510803;
const venueLng = 76.877504;

// Arrival distance in metres
const arrivalDistance = 50;

// Test mode OFF
const testMode = false;

// Track whether arrival has been detected
let arrived = false;

// Open Google Maps
mapBtn.addEventListener("click", function() {

    const mapUrl = "https://www.google.com/maps/dir/?api=1&destination="
        + encodeURIComponent(venue);

    window.open(mapUrl, "_blank");

});

// Calculate distance between two locations
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

// Show thank-you section
function showThankYouSection() {

    if (arrived) return;

    arrived = true;

    const welcome = document.getElementById("welcomeSection");
    const section = document.getElementById("thankYouSection");
    const video = document.getElementById("thankYouVideo");

    welcome.style.display = "none";
    section.style.display = "block";

    video.play().catch(function() {
        console.log("Browser blocked autoplay. Guest may need to press Play.");
    });
}

// Check current location
function checkGuestLocation() {

    if (arrived || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const guestLat = position.coords.latitude;
            const guestLng = position.coords.longitude;

            const distance = calculateDistance(
                guestLat,
                guestLng,
                venueLat,
                venueLng
            );

            console.log(
                "Distance from venue:",
                Math.round(distance),
                "metres"
            );

            if (testMode || distance <= arrivalDistance) {
                showThankYouSection();
            }
        },

        function(error) {
            console.log("Location error:", error.message);
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 20000
        }
    );
}

// Initial location check
checkGuestLocation();

// Check location when guest returns to Qrinova
document.addEventListener("visibilitychange", function() {

    if (document.visibilityState === "visible") {
        checkGuestLocation();
    }

});

// Also check when the browser restores the page
window.addEventListener("pageshow", function() {
    checkGuestLocation();
});
