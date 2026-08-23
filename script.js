// Création de la carte Toutou Map
const map = L.map('map').setView([48.8566, 2.3522], 13);

// Ajout de la carte OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const iconeUtilisateur = L.divIcon({
    className: 'icone-utilisateur',
    html: '<div class="point-utilisateur"><div class="centre-utilisateur"></div></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18]
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
            async (position) => {
            const modeTestMaisonsAlfort = false;

const latitude = modeTestMaisonsAlfort ? 48.8096 : position.coords.latitude;
const longitude = modeTestMaisonsAlfort ? 2.4398 : position.coords.longitude;

            map.setView([latitude, longitude], 16);

const reponse = await fetch('distributeurs-sacs-canins.csv');
const texteCSV = await reponse.text();

const lignes = texteCSV.trim().split('\n');
lignes.shift();

const distributeurs = lignes.map(ligne => {
    const colonnes = ligne.split(',');

   return {
    nom: "Distributeur Toutou Map",
    emplacement: colonnes[4],
    lat: parseFloat(colonnes[1]),
    lng: parseFloat(colonnes[2]),
    etat: "À VÉRIFIER"
};
}).filter(distributeur =>
    !isNaN(distributeur.lat) &&
    !isNaN(distributeur.lng)
);
let distributeurLePlusProche = null;
let distanceMin = Infinity;

let marqueurPlusProche = null;
distributeurs.forEach(distributeur => {
    const distance = map.distance(
        [latitude, longitude],
        [distributeur.lat, distributeur.lng]
    );

    if (distance < distanceMin) {
    distanceMin = distance;
    distributeurLePlusProche = distributeur;
}

    if (distance <= 5000) {
        L.marker([distributeur.lat, distributeur.lng])
            .addTo(map)
           .bindPopup(
    "🐾 <strong>" + distributeur.nom + "</strong>" +
    "<br>📍 " + distributeur.emplacement +
    "<br>" + (distributeur.etat === "PLEIN" ? "🟢" : distributeur.etat === "VIDE" ? "🔴" : "⚪") +
" <strong>" + distributeur.etat + "</strong>" +
    "<br>📏 Distance : " + Math.round(distance) + " m"
);
    }
});
    if (distributeurLePlusProche) {
const iconeDistributeurProche = L.divIcon({
    className: 'icone-distributeur-proche',
html: `
<div class="marqueur-distributeur-proche">
    <span class="coussinet coussinet-1"></span>
    <span class="coussinet coussinet-2"></span>
    <span class="coussinet coussinet-3"></span>
    <span class="coussinet coussinet-4"></span>
    <span class="coussinet-central"></span>
</div>
`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
});

marqueurPlusProche = L.marker(
    [distributeurLePlusProche.lat, distributeurLePlusProche.lng],
    { icon: iconeDistributeurProche }
).addTo(map);

marqueurPlusProche.bindPopup(
    "⭐ <strong>Distributeur le plus proche</strong>" +
    "<br>📍 " + distributeurLePlusProche.emplacement +
    "<br>" + (distributeurLePlusProche.etat === "PLEIN" ? "🟢" : distributeurLePlusProche.etat === "VIDE" ? "🔴" : "⚪") + " <strong>" + distributeurLePlusProche.etat + "</strong>" +
    "<br>📏 Distance : " + Math.round(distanceMin) + " m" +
"<br><br>" +
"<a href='fiche-distributeur.html?emplacement=" +
encodeURIComponent(distributeurLePlusProche.emplacement) +
"&lat=" + distributeurLePlusProche.lat +
"&lng=" + distributeurLePlusProche.lng +
"&etat=" + encodeURIComponent(distributeurLePlusProche.etat) + "' style='display:inline-block;padding:10px 14px;background:#ffffff;color:#0B8F3C;text-decoration:none;border:2px solid #0B8F3C;border-radius:8px;font-weight:bold;margin-right:8px;'>📄 Voir la fiche</a>" +
    "<a href='https://www.google.com/maps/dir/?api=1&destination=" +
    distributeurLePlusProche.lat + "," + distributeurLePlusProche.lng +
    "' target='_blank' style='display:inline-block;padding:10px 14px;background:#0B8F3C;color:white;text-decoration:none;border-radius:8px;font-weight:bold;'>🚶 Y aller</a>"
);
  const limites = L.latLngBounds(
    [latitude, longitude],
    [distributeurLePlusProche.lat, distributeurLePlusProche.lng]
);

map.fitBounds(limites, {
    padding: [80, 80],
    maxZoom: 16
}); 

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
