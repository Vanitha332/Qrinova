
// Get the navigation button
const mapBtn = document.getElementById("mapBtn");

// Wedding venue address
const venue = "Gowrishankara Kalyana Mantapa, KT99/A 5th Cross, Bannur Main Rd, Marigowda Layout, PES Kyathengere Layout, Kyathumgere, Karnataka 571401";

// Open Google Maps when the guest clicks
mapBtn.addEventListener("click", function() {

    const mapUrl = "https://www.google.com/maps/dir/?api=1&destination="
        + encodeURIComponent(venue);

    window.open(mapUrl, "_blank");

});

// Wedding venue coordinates
const venueLat = 12.510803;
const venueLng = 76.877504;

// Distance in metres to consider the guest arrived
const arrivalDistance = 30;

// TEMPORARY TEST MODE
// Change to false after testing
const testMode = false;

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

    const welcome = document.getElementById("welcomeSection");
    const section = document.getElementById("thankYouSection");
    const video = document.getElementById("thankYouVideo");

    // Hide welcome section
    welcome.style.display = "none";

    // Show thank-you section
    section.style.display = "block";

    // Attempt to play thank-you video
    video.play().catch(function() {
        console.log("Guest may need to press Play.");
    });
}

// Check guest location
let watchId;

if ("geolocation" in navigator) {

    watchId = navigator.geolocation.watchPosition(

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

            // Temporary test or actual arrival detection
            if (testMode || distance <= arrivalDistance) {

                showThankYouSection();

                navigator.geolocation.clearWatch(watchId);
            }
        },

        function(error) {
            console.log(
                "Location permission or location error:",
                error.message
            );
        },

        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 15000
        }
    );

}
