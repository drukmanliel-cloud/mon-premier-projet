// Création de la carte Toutou Map
const map = L.map('map').setView([48.8566, 2.3522], 13);

// Ajout de la carte OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const iconeUtilisateur = L.divIcon({
    className: 'icone-utilisateur',
    html: '<div class="point-utilisateur"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -15]
});

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
        nom: "Distributeur Toutou Map 1",
        emplacement: "23 rue Victor Basch, 94700 Maisons-Alfort",
        lat: 48.8089423,
        lng: 2.4457206
    },
    {
        nom: "Distributeur Toutou Map 2",
        emplacement: "69 rue de Vincennes, 94700 Maisons-Alfort",
        lat: 48.8104754,
        lng: 2.4480543
    }
];
let distributeurLePlusProche = null;
let distanceMin = Infinity;

distributeurs.forEach(distributeur => {
    const distance = map.distance(
        [latitude, longitude],
        [distributeur.lat, distributeur.lng]
    );
if (distance < distanceMin) {
    distanceMin = distance;
    distributeurLePlusProche = distributeur;
}
    L.marker([distributeur.lat, distributeur.lng])
        .addTo(map)
        .bindPopup(
            "🐾 <strong>" + distributeur.nom + "</strong>" +
            "<br>📍 " + distributeur.emplacement +
            "<br>📏 Distance : " + Math.round(distance) + " m"
        );
});
    if (distributeurLePlusProche) {
  const limites = L.latLngBounds(
    [latitude, longitude],
    [distributeurLePlusProche.lat, distributeurLePlusProche.lng]
);

map.fitBounds(limites, {
    padding: [80, 80],
    maxZoom: 16
}); 
 L.popup()
        .setLatLng([distributeurLePlusProche.lat, distributeurLePlusProche.lng])
        .setContent(
            "⭐ <strong>Distributeur le plus proche</strong>" +
            "<br>📍 " + distributeurLePlusProche.emplacement +
            "<br>📏 Distance : " + Math.round(distanceMin) + " m"
        )
        .openOn(map);
}
           L.marker([latitude, longitude], { icon: iconeUtilisateur })
                .addTo(map)
                .bindPopup("📍 Vous êtes ici");
        },
        () => {
            alert("Impossible de récupérer votre position.");
        }
    );
});
