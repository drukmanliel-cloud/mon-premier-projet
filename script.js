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