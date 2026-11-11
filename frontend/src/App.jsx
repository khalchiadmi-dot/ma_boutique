  return (
    <div className={modeAdmin ? "app-container admin-mode" : "app-container"}>
      <header className="navbar">
              <div
        className="logo"
        onClick={() => { window.history.pushState({}, '', '/'); setModeAdmin(false); }}
      >
        <img src="/images/AURELIA.png" alt="AURELIA" className="logo-img" />
      </div>

        {!modeAdmin && <div className="panier-status" onClick={() => setVoirPanier(!voirPanier)} style={{ cursor: 'pointer' }}>🛒 Panier : <strong>{panier.length}</strong> art. ({totalPanier} €)</div>}
      </header>

      {!modeAdmin && voirPanier && (
        <div className="panier-modal">
          {!etapeCommande ? (
            <>
              <h3>Votre Panier</h3>
              {panier.length === 0 ? <p>Votre panier est vide.</p> : (
                <>
                  <ul className="liste-panier">{panier.map((i, idx) => <li key={idx} className="item-panier"><span>{i.nom}</span><strong>{i.prix.toFixed(2)} €</strong></li>)}</ul>
                  <div className="total-section"><span>Total :</span><strong>{totalPanier} €</strong></div>
                  <div className="actions-panier"><button onClick={() => setPanier([])} className="btn-secondaire">Vider</button><button onClick={() => setEtapeCommande(true)} className="btn-primaire">Commander</button></div>
                </>
              )}
            </>
          ) : (
            <form onSubmit={envoyerCommande} className="form-livraison">
              <h3>Livraison internationale 🌍</h3>
              <label>Nom complet :</label><input type="text" required placeholder="Votre nom et prénom" value={nom} onChange={e => setNom(e.target.value)} />
              <label>Téléphone (avec indicatif) :</label><input type="tel" required placeholder="Ex: +32 470 00 00 00" value={telephone} onChange={e => setTelephone(e.target.value)} />
              <label>Ville & Pays :</label><input type="text" required placeholder="Ex: Bruxelles, Belgique" value={ville} onChange={e => setVille(e.target.value)} />
              <label>Adresse complète & Code postal :</label><textarea required placeholder="Rue, numéro, code postal..." value={adresse} onChange={e => setAdresse(e.target.value)} />
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
                    <label>Prix (€) :</label><input type="number" step="0.01" required value={nouveauPrix} onChange={e => setNouveauPrix(e.target.value)} />
                    <label>Image (URL) :</label><input type="text" value={nouvelleImg} onChange={e => setNouvelleImg(e.target.value)} />
                    <label>Description :</label><textarea value={nouvelleDesc} onChange={e => setNouvelleDesc(e.target.value)} />
                    <button type="submit" className="btn-valider" style={{ marginTop: '15px' }}>Injecter</button>
                  </form>
                  <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
                  <h3>🗑️ Articles en vitrine</h3>
                  <ul className="liste-panier" style={{ maxHeight: '200px' }}>
                    {produits.map(p => (
                      <li key={p.id} className="item-panier" style={{ alignItems: 'center' }}>
                        <span><strong>#{p.id}</strong> - {p.nom} ({p.prix} €)</span>
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
                        <tr><th>#</th><th>Client</th><th>Destination & Adresse</th><th>Articles</th><th>Total</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        {commandesAdmin.map(c => (
                          <tr key={c.id}>
                            <td><strong>#{c.id}</strong></td>
                            <td>{c.nom_client}<br /><small>{c.telephone}</small></td>
                            <td><strong>{c.ville}</strong><br /><small>{c.adresse}</small></td>
                            <td>{c.articles.map((a, i) => <div key={i}>{a.nom}</div>)}</td>
                            <td><strong>{c.total.toFixed(2)} €</strong></td>
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
                  <div className="prix">{p.prix.toFixed(2)} €</div>
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
