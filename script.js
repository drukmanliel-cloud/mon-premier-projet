// Création de la carte Toutou Map
const map = L.map('map').setView([48.8566, 2.3522], 13);
const SUPABASE_URL = "https://lhkmboiukbjqdgminwod.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ce2x-kfGFq7hZ7f4yH7C2A_-EuAEtEj";
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
const boutonSignaler = document.getElementById('bouton-signaler');

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

// ===== RÉCUPÉRATION DES DISTRIBUTEURS DEPUIS SUPABASE =====

const SUPABASE_URL = "https://lhkmboiukbjqdgminwod.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ce2x-kfGFq7hZ7f4yH7C2A_-EuAEtEj";

let toutesLesLignes = [];
let offset = 0;
const limite = 1000;

while (true) {

    const reponse = await fetch(
        SUPABASE_URL +
        "/rest/v1/distributeurs" +
      "?select=id,osm_id,latitude,longitude,city_name,emplacement,etat,derniere_verification,confirmations" +
        "&limit=" + limite +
        "&offset=" + offset,
        {
            headers: {
                "apikey": SUPABASE_KEY
            }
        }
    );

    if (!reponse.ok) {
        throw new Error("Impossible de récupérer les distributeurs depuis Supabase");
    }

    const lot = await reponse.json();

    toutesLesLignes = toutesLesLignes.concat(lot);

    if (lot.length < limite) {
        break;
    }

    offset += limite;
}

const distributeurs = toutesLesLignes
    .filter(distributeur =>
        distributeur.latitude !== null &&
        distributeur.longitude !== null
    )
    .map(distributeur => ({
        id: distributeur.id,
        adresse_manquante:
    !distributeur.emplacement ||
    distributeur.emplacement === "Distributeur signalé par un utilisateur" ||
    distributeur.emplacement === "Emplacement non renseigné",
        nom: "Distributeur Toutou Map",
       emplacement:
    distributeur.emplacement ||
    distributeur.city_name ||
    "Emplacement non renseigné",
        lat: parseFloat(distributeur.latitude),
        lng: parseFloat(distributeur.longitude),

        // Supabase contient plein/vide en minuscules.
        // Le reste de ton code utilise PLEIN/VIDE en majuscules.
       etat: distributeur.etat
  ? distributeur.etat.toUpperCase()
  : "À VERIFIER",
derniere_verification: distributeur.derniere_verification,
confirmations: distributeur.confirmations ?? 0,
    }));

console.log(distributeurs.length + " distributeurs chargés depuis Supabase");

let marqueurPlusProche = null;
let distanceMin = Infinity;
let distributeurPleinPlusProche = null;
let distancePleinMin = Infinity;
const DUREE_VALIDITE_STATUT = 24 * 60 * 60 * 1000; // 24 heures
const maintenant = Date.now();
         let adressesRecherchees = 0;
const MAX_ADRESSES_PAR_CHARGEMENT = 3;  
 distributeurs.sort((a, b) => {
    const aPrioritaire =
        a.emplacement === "Distributeur signalé par un utilisateur";

    const bPrioritaire =
        b.emplacement === "Distributeur signalé par un utilisateur";

    return Number(bPrioritaire) - Number(aPrioritaire);
});               
distributeurs.forEach(distributeur => {
    // Un statut PLEIN ou VIDE n'est considéré fiable que pendant 24 heures
if (!distributeur.derniere_verification) {
    distributeur.etat = "À VÉRIFIER";
} else {
    const dateVerification = new Date(
        distributeur.derniere_verification
    ).getTime();

    const dateInvalide = Number.isNaN(dateVerification);
    const tropAncienne =
        maintenant - dateVerification > DUREE_VALIDITE_STATUT;

    if (dateInvalide || tropAncienne) {
        distributeur.etat = "À VÉRIFIER";
    }
}
    const distance = map.distance(
        [latitude, longitude],
        [distributeur.lat, distributeur.lng]
     );   
if (distance < distanceMin) {
    distanceMin = distance;
    distributeurLePlusProche = distributeur;
}

if (distributeur.etat === "PLEIN" && distance < distancePleinMin) {
    distancePleinMin = distance;
    distributeurPleinPlusProche = distributeur;
}

    if (distance <= 5000) {
        if (
    distributeur.adresse_manquante &&
    adressesRecherchees < MAX_ADRESSES_PAR_CHARGEMENT
) {
    adressesRecherchees++;
           recupererAdresseDistributeur(distributeur); 
}
      const couleurMarqueur =
    distributeur.etat === "PLEIN" ? "#22c55e" :
    distributeur.etat === "VIDE" ? "#ef4444" :
    "#a78bfa";

const iconeEtat = L.divIcon({
    className: "",
    html: "<div style='width:22px;height:22px;border-radius:50%;background:" + couleurMarqueur + ";border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4);'></div>",
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});
       L.marker([distributeur.lat, distributeur.lng], { icon: iconeEtat })
            .addTo(map)
           .bindPopup(
    "🐾 <strong>" + distributeur.nom + "</strong>" +
    "<br>📍 " + distributeur.emplacement +
   "<br>" + (distributeur.etat === "PLEIN" ? "🟢" : distributeur.etat === "VIDE" ? "🔴" : "🟣") +
" <strong>" + distributeur.etat + "</strong>" +
"<br>📏 Distance : " + Math.round(distance) + " m" +

(distributeur.etat === "À VÉRIFIER"
  ? "<br>🐾 Confirmations : <strong>" + distributeur.confirmations + " / 3</strong>"
  : "") +
(distributeur.etat === "À VÉRIFIER"
  ? "<br><button class='btn-confirmer-distributeur' onclick='confirmerDistributeur(" +
  distributeur.id + ", " + distributeur.confirmations +
  ")'>✅ Je confirme ce distributeur</button>"
  : "") +
"<br><br>" +
    "<a href='fiche-distributeur.html?emplacement=" +
    encodeURIComponent(distributeur.emplacement) +
    "&id=" + distributeur.id +    
    "&lat=" + distributeur.lat +
    "&lng=" + distributeur.lng +
    "&etat=" + encodeURIComponent(distributeur.etat) +
     "&verification=" + encodeURIComponent(distributeur.derniere_verification || "") +     
    "' style='display:inline-block;padding:10px 14px;background:#ffffff;color:#0B8F3C;text-decoration:none;border:2px solid #0B8F3C;border-radius:8px;font-weight:bold;margin-right:8px;'>📄 Voir la fiche</a>" +
    "<a href='https://www.google.com/maps/dir/?api=1&destination=" +
    distributeur.lat + "," + distributeur.lng +
    "' target='_blank' style='display:inline-block;padding:10px 14px;background:#0B8F3C;color:white;text-decoration:none;border-radius:8px;font-weight:bold;'>🚶 Y aller</a>"
);
    }
});
       if (distributeurPleinPlusProche) {
    distributeurLePlusProche = distributeurPleinPlusProche;
    distanceMin = distancePleinMin;
}         
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
    "⭐ <strong>Distributeur avec sacs le plus proche</strong>" +
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
marqueurPlusProche.openPopup();
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
let modeSignalement = false;

boutonSignaler.addEventListener('click', () => {
    modeSignalement = true;
    alert("Cliquez maintenant sur la carte à l'endroit où se trouve le distributeur.");
});

map.on('click', (e) => {
    if (!modeSignalement) return;

    modeSignalement = false;

    const latitudeSignalement = e.latlng.lat;
    const longitudeSignalement = e.latlng.lng;

  const marqueurSignalement = L.marker([latitudeSignalement, longitudeSignalement])
    .addTo(map);

marqueurSignalement.bindPopup(`
    <div style="text-align:center;">
        <strong>➕ Nouveau distributeur</strong>
        <br><br>
        Est-ce bien ici ?
        <br><br>

        <button onclick="confirmerSignalement(${latitudeSignalement}, ${longitudeSignalement})"
            style="padding:10px 14px;background:#0B8F3C;color:white;border:none;border-radius:8px;font-weight:bold;">
            ✅ Confirmer
        </button>

        <button onclick="annulerSignalement()"
            style="padding:10px 14px;background:white;color:#333;border:1px solid #ccc;border-radius:8px;font-weight:bold;margin-left:5px;">
            ❌ Annuler
        </button>
    </div>
`).openPopup();
});
function annulerSignalement() {
    map.closePopup();

    map.eachLayer((layer) => {
        if (
            layer instanceof L.Marker &&
            layer.getPopup() &&
            layer.getPopup().getContent().includes("Nouveau distributeur")
        ) {
            map.removeLayer(layer);
        }
    });
}

async function confirmerSignalement(latitude, longitude) {

    const reponse = await fetch(
        SUPABASE_URL + "/rest/v1/distributeurs",
        {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                etat: "A_VERIFIER",
                type: "signalement_utilisateur"
            })
        }
    );

    if (!reponse.ok) {
        const erreur = await reponse.text();
        console.error("Erreur Supabase :", erreur);
        alert("❌ Le distributeur n'a pas pu être enregistré.");
        return;
    }

    map.closePopup();

    alert("✅ Merci ! Le distributeur a bien été signalé.");

    console.log(
        "Nouveau distributeur signalé :",
        latitude,
        longitude
    );
}
async function confirmerDistributeur(id, confirmationsActuelles) {
   const cleConfirmation = "toutoumap_confirmation_" + id;

if (localStorage.getItem(cleConfirmation)) {
    alert("🐾 Vous avez déjà confirmé ce distributeur. Merci !");
    return;
}
    const nouvellesConfirmations = confirmationsActuelles + 1;

    const reponse = await fetch(
        SUPABASE_URL + "/rest/v1/distributeurs?id=eq." + id,
        {
            method: "PATCH",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
           body: JSON.stringify(
    nouvellesConfirmations >= 3
        ? {
            confirmations: nouvellesConfirmations,
            etat: "PLEIN",
            derniere_verification: new Date().toISOString()
          }
        : {
            confirmations: nouvellesConfirmations
          }
)
        }
    );

    if (!reponse.ok) {
    const erreur = await reponse.text();
    console.error("Erreur confirmation :", erreur);

    alert(
        "❌ Impossible d'enregistrer la confirmation.\n\n" +
        "Erreur Supabase : " + erreur
    );

    return;
}
localStorage.setItem(cleConfirmation, "oui");
    alert("✅ Merci ! Confirmation enregistrée.");

    window.location.reload();
}
async function recupererAdresseDistributeur(distributeur) {
    try {
        const reponse = await fetch(
            "https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=" +
            encodeURIComponent(distributeur.lat) +
            "&lon=" +
            encodeURIComponent(distributeur.lng)
        );

        if (!reponse.ok) {
            return;
        }

        const data = await reponse.json();

        if (!data || !data.address) {
            return;
        }

        const adresse = data.address;

        const rue =
            adresse.road ||
            adresse.pedestrian ||
            adresse.path ||
            adresse.residential ||
            "Emplacement";

        const codePostal = adresse.postcode || "";

        const ville =
            adresse.city ||
            adresse.town ||
            adresse.village ||
            adresse.municipality ||
            "";

        const adresseCourte =
            rue +
            (codePostal ? ", " + codePostal : "") +
            (ville ? " " + ville : "");

        distributeur.emplacement = adresseCourte;
        distributeur.adresse_manquante = false;

        const sauvegarde = await fetch(
            SUPABASE_URL + "/rest/v1/distributeurs?id=eq." + distributeur.id,
            {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    emplacement: adresseCourte
                })
            }
        );

        if (!sauvegarde.ok) {
            console.error(
                "Erreur sauvegarde adresse :",
                await sauvegarde.text()
            );
        }

    } catch (error) {
        console.error("Erreur récupération adresse :", error);
    }
}
