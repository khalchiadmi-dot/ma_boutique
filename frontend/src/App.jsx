import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Navbar';
import Accueil from './Accueil';
import Admin from './Admin';
import Contact from './Contact';
import Suivi from './Suivi';

export default function App() {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState(() => {
    const sauvegarde = localStorage.getItem('panier_auralia');
    return sauvegarde ? JSON.parse(sauvegarde) : [];
  });
  const [voirPanier, setVoirPanier] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [modeAdmin, setModeAdmin] = useState(window.location.pathname === '/admin');
  const [estConnecteAdmin, setEstConnecteAdmin] = useState(false);
  const [motDePasseSaisi, setMotDePasseSaisi] = useState('');
  const [commandesAdmin, setCommandesAdmin] = useState([]);
  const [pageActive, setPageActive] = useState('accueil');

  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauPrix, setNouveauPrix] = useState('');
  const [nouvelleDesc, setNouvelleDesc] = useState('');
  const [nouvelleImg, setNouvelleImg] = useState('');
  const [etapeCommande, setEtapeCommande] = useState(false);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [modePaiement, setModePaiement] = useState('Paiement à la livraison');

  const API_URL = "https://onrender.com";

  useEffect(() => {
    localStorage.setItem('panier_auralia', JSON.stringify(panier));
  }, [panier]);

  const verifierConnexionAdmin = (e) => {
    e.preventDefault();
    if (motDePasseSaisi === 'joujou') setEstConnecteAdmin(true);
    else alert("❌ Mot de passe incorrect !");
  };

  const chargerProduits = () => {
    fetch(`${API_URL}/api/produits`).then(r => r.json()).then(setProduits).catch(console.error);
  };

  const chargerCommandesAdmin = () => {
    fetch(`${API_URL}/api/commandes`).then(r => r.json()).then(setCommandesAdmin).catch(console.error);
  };

  useEffect(() => { chargerProduits(); }, []);
  useEffect(() => { if (modeAdmin) chargerCommandesAdmin(); }, [modeAdmin]);

  const totalPanier = panier.reduce((acc, item) => acc + item.prix, 0).toFixed(2);

  const gererAjoutProduit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/produits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: nouveauNom, prix: nouveauPrix, description: nouvelleDesc, image_url: nouvelleImg })
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) alert("⚠️ " + (d.error || "Erreur"));
      else {
        alert("🚀 Article ajouté !");
        setNouveauNom(''); setNouveauPrix(''); setNouvelleDesc(''); setNouvelleImg('');
        chargerProduits();
      }
    });
  };

  const gererSuppressionProduit = (id) => {
    if (window.confirm("Supprimer cet article ?")) {
      fetch(`${API_URL}/api/produits/${id}`, { method: 'DELETE' }).then(chargerProduits);
    }
  };

  const envoyerCommande = (e) => {
    e.preventDefault();
    if (envoiEnCours) return;
    setEnvoiEnCours(true);

    fetch(`${API_URL}/api/commandes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client: nom,
        telephone,
        ville,
        adresse,
        mode_paiement: modePaiement,
        total: totalPanier,
        articles: panier.map(i => ({ nom: i.nom, prix: i.prix }))
      })
    }).then(async r => {
      const d = await r.json();
      setEnvoiEnCours(false);
      if (r.ok && d.message === "Succès") {
        alert(`🎉 Commande #${d.commande_id} enregistrée !\nMode de paiement : ${modePaiement}`);
        setPanier([]); setVoirPanier(false); setEtapeCommande(false);
      } else {
        alert("⚠️ Erreur : " + (d.error || "Impossible d'enregistrer la commande."));
      }
    }).catch(() => {
      setEnvoiEnCours(false);
      alert("⚠️ Le serveur met du temps à répondre, veuillez réessayer dans quelques secondes.");
    });
  };

  return (
    <div className={modeAdmin ? "app-container admin-mode" : "app-container"}>
      <Navbar
        modeAdmin={modeAdmin} setModeAdmin={setModeAdmin}
        pageActive={pageActive} setPageActive={setPageActive}
        panierCount={panier.length} totalPanier={totalPanier}
        voirPanier={voirPanier} setVoirPanier={setVoirPanier}
      />

      {!modeAdmin && pageActive !== 'accueil' && voirPanier && (
        <div className="panier-modal">
          {!etapeCommande ? (
            <>
              <h3>Votre Panier</h3>
              {panier.length === 0 ? <p>Votre panier est vide.</p> : (
                <>
                  <ul className="liste-panier">
                    {panier.map((i, idx) => (
                      <li key={idx} className="item-panier">
                        <span>{i.nom}</span><strong>{i.prix.toFixed(2)} €</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="total-section"><span>Total :</span><strong>{totalPanier} €</strong></div>
                  <div className="actions-panier">
                    <button onClick={() => setPanier([])} className="btn-secondaire">Vider</button>
                    <button onClick={() => setEtapeCommande(true)} className="btn-primaire">Commander</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <form onSubmit={envoyerCommande} className="form-livraison">
              <h3>Livraison & Paiement 🌍</h3>
              <label>Nom complet :</label>
              <input type="text" required value={nom} onChange={e => setNom(e.target.value)} />
              <label>Téléphone :</label>
              <input type="tel" required value={telephone} onChange={e => setTelephone(e.target.value)} />
              <label>Ville & Pays :</label>
              <input type="text" required value={ville} onChange={e => setVille(e.target.value)} />
              <label>Adresse complète :</label>
              <textarea required value={adresse} onChange={e => setAdresse(e.target.value)} />

              <label>Mode de paiement :</label>
              <select
                value={modePaiement}
                onChange={e => setModePaiement(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #73a9d9', backgroundColor: '#ffffff' }}
              >
                <option value="Paiement à la livraison">💵 Paiement à la livraison (Espèces)</option>
                <option value="Virement / Wafacash / Cash Plus">🏦 Virement bancaire / Wafacash / Cash Plus</option>
                <option value="Carte bancaire (Lien sécurisé)">💳 Carte bancaire (Lien envoyé par WhatsApp/Email)</option>
              </select>

              <div className="actions-panier">
                <button type="button" onClick={() => setEtapeCommande(false)} className="btn-secondaire">Retour</button>
                <button type="submit" className="btn-valider" disabled={envoiEnCours}>
                  {envoiEnCours ? "Envoi..." : "Confirmer"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {modeAdmin ? (
        <main className="contenu">
          <Admin
            estConnecteAdmin={estConnecteAdmin} verifierConnexionAdmin={verifierConnexionAdmin}
            motDePasseSaisi={motDePasseSaisi} setMotDePasseSaisi={setMotDePasseSaisi}
            gererAjoutProduit={gererAjoutProduit} nouveauNom={nouveauNom} setNouveauNom={setNouveauNom}
            nouveauPrix={nouveauPrix} setNouveauPrix={setNouveauPrix} nouvelleImg={nouvelleImg}
            setNouvelleImg={setNouvelleImg} nouvelleDesc={nouvelleDesc} setNouvelleDesc={setNouvelleDesc}
            produits={produits} gererSuppressionProduit={gererSuppressionProduit}
            commandesAdmin={commandesAdmin} chargerCommandesAdmin={chargerCommandesAdmin}
            API_URL={API_URL}
          />
        </main>
      ) : pageActive === 'accueil' ? (
        <Accueil />
      ) : pageActive === 'contact' ? (
        <main className="contenu">
          <Contact />
        </main>
      ) : pageActive === 'suivi' ? (
        <main className="contenu">
          <Suivi API_URL={API_URL} />
        </main>
      ) : (
        <main className="contenu">
          <h2 className="titre-page">Notre Catalogue</h2>
          <div className="grille-produits">
            {produits.map(p => (
              <div key={p.id} className="carte-produit">
                {p.image_url && p.image_url.toLowerCase().endsWith('.mp4') ? (
                  <video src={p.image_url} autoPlay loop muted playsInline />
                ) : (
                  <img src={p.image_url || "/images/AURELIA1.png"} alt={p.nom} />
                )}

                <h3>{p.nom}</h3>
                <p>{p.description}</p>
                <div className="prix">{Number(p.prix).toFixed(2)} €</div>
                <button className="btn-ajouter" onClick={() => setPanier([...panier, { ...p, prix: Number(p.prix) }])}>
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
