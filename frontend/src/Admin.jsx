export default function Admin({
  estConnecteAdmin,
  verifierConnexionAdmin,
  motDePasseSaisi,
  setMotDePasseSaisi,
  gererAjoutProduit,
  nouveauNom,
  setNouveauNom,
  nouveauPrix,
  setNouveauPrix,
  nouvelleImg,
  setNouvelleImg,
  nouvelleDesc,
  setNouvelleDesc,
  produits,
  gererSuppressionProduit,
  commandesAdmin,
  chargerCommandesAdmin,
  API_URL
}) {
  const changerStatut = (id, nouveauStatut) => {
    fetch(`${API_URL}/api/commandes/${id}/statut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: nouveauStatut })
    })
      .then((r) => r.json())
      .then(() => {
        if (chargerCommandesAdmin) chargerCommandesAdmin();
      })
      .catch(console.error);
  };

  if (!estConnecteAdmin) {
    return (
      <div className="admin-card" style={{ maxWidth: '350px', margin: '50px auto', textAlign: 'center' }}>
        <h2>🔒 Accès Réservé</h2>
        <form onSubmit={verifierConnexionAdmin} className="form-admin-ajout">
          <label>Mot de passe :</label>
          <input
            type="password"
            required
            value={motDePasseSaisi}
            onChange={(e) => setMotDePasseSaisi(e.target.value)}
          />
          <button type="submit" className="btn-valider" style={{ marginTop: '15px' }}>
            Déverrouiller
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="titre-page">Tableau de bord Admin</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <h3>+ Ajouter un produit</h3>
          <form onSubmit={gererAjoutProduit} className="form-admin-ajout">
            <label>Nom :</label>
            <input type="text" required value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} />
            <label>Prix (€) :</label>
            <input type="number" step="0.01" required value={nouveauPrix} onChange={(e) => setNouveauPrix(e.target.value)} />
            <label>Image ou Vidéo (.mp4) :</label>
            <input type="text" value={nouvelleImg} onChange={(e) => setNouvelleImg(e.target.value)} />
            <label>Description :</label>
            <textarea value={nouvelleDesc} onChange={(e) => setNouvelleDesc(e.target.value)} />
            <button type="submit" className="btn-valider" style={{ marginTop: '15px' }}>
              Injecter
            </button>
          </form>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid var(--bordure-bleue)' }} />
          <h3>🗑️ Articles en vitrine</h3>
          <ul className="liste-panier" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {produits.map((p) => (
              <li key={p.id} className="item-panier" style={{ alignItems: 'center' }}>
                <span>{p.nom} ({p.prix} €)</span>
                <button
                  type="button"
                  onClick={() => gererSuppressionProduit(p.id)}
                  style={{
                    backgroundColor: '#d9534f',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <h3>📦 Commandes reçues</h3>
          <div className="table-responsive">
            <table className="table-commandes">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Ville & Adresse</th>
                  <th>Paiement</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {commandesAdmin.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nom_client}<br /><small>{c.telephone}</small></td>
                    <td>
                      <strong>{c.ville}</strong>
                      {c.adresse && <><br /><small>{c.adresse}</small></>}
                    </td>
                    <td>
                      <small style={{ fontWeight: '600', color: 'var(--bleu-profond)' }}>
                        {c.mode_paiement || 'Paiement à la livraison'}
                      </small>
                    </td>
                    <td><strong>{c.total} €</strong></td>
                    <td>
                      <select
                        value={c.statut || "En préparation"}
                        onChange={(e) => changerStatut(c.id, e.target.value)}
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          border: '1px solid var(--bordure-bleue)',
                          background: '#ffffff'
                        }}
                      >
                        <option value="En préparation">⏳ En préparation</option>
                        <option value="Expédiée">🚚 Expédiée</option>
                        <option value="Livrée">✅ Livrée</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
