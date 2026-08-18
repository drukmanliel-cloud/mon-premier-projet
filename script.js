// Création de la carte Toutou Map
const map = L.map('map').setView([48.8566, 2.3522], 13);

// Ajout de la carte OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Premier distributeur de test
L.marker([48.8566, 2.3522])
    .addTo(map)
       .bindPopup('🐾 Distributeur de sacs Toutou Map');

// Géolocalisation de l'utilisateur
const boutonLocalisation = document.querySelector('button');

boutonLocalisation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas disponible sur votre appareil.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const modeTestMaisonsAlfort = true;

const latitude = modeTestMaisonsAlfort ? 48.8096 : position.coords.latitude;
const longitude = modeTestMaisonsAlfort ? 2.4398 : position.coords.longitude;

            map.setView([latitude, longitude], 16);

const distributeurs = [
    {
        nom: "Distributeur Toutou Map",
        emplacement: "23 rue Victor Basch, 94700 Maisons-Alfort",
        lat: 48.8089423,
        lng: 2.4457206
    }
];
distributeurs.forEach(distributeur => {

    const distance = map.distance(
        [latitude, longitude],
        [distributeur.lat, distributeur.lng]
    );

    L.marker([distributeur.lat, distributeur.lng])
        .addTo(map)
        .bindPopup(
            "🐾 <strong>" + distributeur.nom + "</strong>" +
            "<br>📍 " + distributeur.emplacement +
            "<br>📏 Distance : " + Math.round(distance) + " m"
        );
});
    
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("📍 Vous êtes ici")
                .openPopup();
        },
        () => {
            alert("Impossible de récupérer votre position.");
        }
    );
});
