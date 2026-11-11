import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [voirPanier, setVoirPanier] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [modeAdmin, setModeAdmin] = useState(window.location.pathname === '/admin');
  const [estConnecteAdmin, setEstConnecteAdmin] = useState(false);
  const [motDePasseSaisi, setMotDePasseSaisi] = useState('');
  const [commandesAdmin, setCommandesAdmin] = useState([]);

  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauPrix, setNouveauPrix] = useState('');
  const [nouvelleDesc, setNouvelleDesc] = useState('');
  const [nouvelleImg, setNouvelleImg] = useState('');
  const [etapeCommande, setEtapeCommande] = useState(false);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('Casablanca');
  const [adresse, setAdresse] = useState('');

  const sousDomaine = "ma-boutique-api-bae2.";
  const API_URL = `https://${sousDomaine}onrender.com`;

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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: nouveauNom, prix: nouveauPrix, description: nouvelleDesc, image_url: nouvelleImg })
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) alert("⚠️ " + (d.error || "Erreur"));
      else { alert("🚀 Article ajouté !"); setNouveauNom(''); setNouveauPrix(''); setNouvelleDesc(''); setNouvelleImg(''); chargerProduits(); }
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom_client: nom, telephone, ville, adresse, total: totalPanier, articles: panier.map(i => ({ nom: i.nom, prix: i.prix })) })
    }).then(r => r.json()).then(d => {
      setEnvoiEnCours(false);
      if (d.message === "Succès") { alert(`🎉 Commande #${d.commande_id} enregistrée !`); setPanier([]); setVoirPanier(false); setEtapeCommande(false); }
    }).catch(() => setEnvoiEnCours(false));
  };

  return (
    <div className={modeAdmin ? "app-container admin-mode" : "app-container"}>
      <header className="navbar">
        <div className="logo" onClick={() => { window.history.pushState({}, '', '/'); setModeAdmin(false); }} style={{ cursor: 'pointer' }}>ma_boutique</div>
        {!modeAdmin && <div className="panier-status" onClick={() => setVoirPanier(!voirPanier)} style={{ cursor: 'pointer' }}>🛒 Panier : <strong>{panier.length}</strong> art. ({totalPanier} DH)</div>}
      </header>

      {!modeAdmin && voirPanier && (
        <div className="panier-modal">
          {!etapeCommande ? (
            <>
              <h3>Votre Panier</h3>
              {panier.length === 0 ? <p>Votre panier est vide.</p> : (
                <>
                  <ul className="liste-panier">{panier.map((i, idx) => <li key={idx} className="item-panier"><span>{i.nom}</span><strong>{i.prix.toFixed(2)} DH</strong></li>)}</ul>
                  <div className="total-section"><span>Total :</span><strong>{totalPanier} DH</strong></div>
                  <div className="actions-panier"><button onClick={() => setPanier([])} className="btn-secondaire">Vider</button><button onClick={() => setEtapeCommande(true)} className="btn-primaire">Commander</button></div>
                </>
              )}
            </>
          ) : (
            <form onSubmit={envoyerCommande} className="form-livraison">
              <h3>Détails de livraison</h3>
              <label>Nom :</label><input type="text" required value={nom} onChange={e => setNom(e.target.value)} />
              <label>Téléphone :</label><input type="tel" required value={telephone} onChange={e => setTelephone(e.target.value)} />
              <label>Ville :</label><select value={ville} onChange={e => setVille(e.target.value)}><option value="Casablanca">Casablanca</option><option value="Rabat">Rabat</option><option value="Marrakech">Marrakech</option></select>
              <label>Adresse :</label><textarea required value={adresse} onChange={e => setAdresse(e.target.value)} />
              <div className="actions-panier">
                <button type="button" onClick={() => setEtapeCommande(false)} className="btn-secondaire">Retour</button>
                <button type="submit" className="btn-valider" disabled={envoiEnCours}>{envoiEnCours ? "Envoi..." : "Confirmer"}</button>
              </div>
            </form>
          )}
        </div>
      )}

      <main className="contenu">
        {modeAdmin ? (
          !estConnecteAdmin ? (
            <div className="admin-card" style={{ maxWidth: '350px', margin: '50px auto', textAlign: 'center' }}>
              <h2>🔒 Accès Réservé</h2>
              <form onSubmit={verifierConnexionAdmin} className="form-admin-ajout">
                <label>Mot de passe :</label><input type="password" required value={motDePasseSaisi} onChange={e => setMotDePasseSaisi(e.target.value)} />
                <button type="submit" className="btn-valider" style={{ marginTop: '15px' }}>Déverrouiller</button>
              </form>
            </div>
          ) : (
            <div className="admin-dashboard">
              <h1 className="titre-page">Tableau de bord Admin</h1>
              <div className="admin-grid">
                <div className="admin-card">
                  <h3>+ Ajouter un produit</h3>
                  <form onSubmit={gererAjoutProduit} className="form-admin-ajout">
                    <label>Nom :</label><input type="text" required value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} />
                    <label>Prix (DH) :</label><input type="number" required value={nouveauPrix} onChange={e => setNouveauPrix(e.target.value)} />
                    <label>Image (URL) :</label><input type="text" value={nouvelleImg} onChange={e => setNouvelleImg(e.target.value)} />
                    <label>Description :</label><textarea value={nouvelleDesc} onChange={e => setNouvelleDesc(e.target.value)} />
                    <button type="submit" className="btn-valider" style={{ marginTop: '15px' }}>Injecter</button>
                  </form>
                  <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
                  <h3>🗑️ Articles en vitrine</h3>
                  <ul className="liste-panier" style={{ maxHeight: '200px' }}>
                    {produits.map(p => (
                      <li key={p.id} className="item-panier" style={{ alignItems: 'center' }}>
                        <span><strong>#{p.id}</strong> - {p.nom} ({p.prix} DH)</span>
                        <button onClick={() => gererSuppressionProduit(p.id)} className="btn-secondaire" style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 'none' }}>Supprimer</button>
                      </li>
                    ))}
                  </ul>
                </div>
                                <div className="admin-card">
                  <h3>📦 Suivi des Commandes</h3>
                  <div className="table-responsive">
                    <table className="table-commandes">
                      <thead>
                        <tr><th>#</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        {commandesAdmin.map(c => (
                          <tr key={c.id}>
                            <td><strong>#{c.id}</strong></td>
                            <td>{c.nom_client}<br /><small>{c.telephone} ({c.ville})</small></td>
                            <td>{c.articles.map((a, i) => <div key={i}>{a.nom}</div>)}</td>
                            <td><strong>{c.total.toFixed(2)} DH</strong></td>
                            <td>{c.statut}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            <h1 className="titre-page">Notre Catalogue</h1>
            <div className="grille-produits">
              {produits.map(p => (
                <div key={p.id} className="carte-produit">
                  <img src={p.image_url} alt={p.nom} />
                  <h3>{p.nom}</h3>
                  <p>{p.description}</p>
                  <div className="prix">{p.prix.toFixed(2)} DH</div>
                  <button className="btn-ajouter" onClick={() => setPanier([...panier, p])}>Ajouter au panier</button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
