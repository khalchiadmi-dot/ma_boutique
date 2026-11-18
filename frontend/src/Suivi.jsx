import { useState } from 'react';

export default function Suivi({ API_URL }) {
  const [commandeId, setCommandeId] = useState('');
  const [telephone, setTelephone] = useState('');
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const rechercherCommande = (e) => {
    e.preventDefault();
    setErreur('');
    setResultat(null);
    setChargement(true);

    fetch(`${API_URL}/api/suivi/${commandeId}?telephone=${encodeURIComponent(telephone)}`)
      .then(async (r) => {
        const data = await r.json();
        setChargement(false);
        if (!r.ok) {
          setErreur(data.error || "Commande introuvable.");
        } else {
          setResultat(data);
        }
      })
      .catch(() => {
        setChargement(false);
        setErreur("Impossible de contacter le serveur. Réessayez dans quelques secondes.");
      });
  };

  const getEtape = (statut) => {
    if (!statut) return 1;
    if (statut.includes('Livrée')) return 3;
    if (statut.includes('Expédiée')) return 2;
    return 1;
  };

  const etapeActuelle = resultat ? getEtape(resultat.statut) : 0;

  return (
    <div className="contact-page">
      <h2 className="titre-page">Suivi de commande 📦</h2>
      <p style={{ textAlign: 'center', marginBottom: '22px', color: 'var(--texte-secondaire)' }}>
        Saisissez votre numéro de commande et votre téléphone pour suivre l'acheminement de votre colis.
      </p>

      <form onSubmit={rechercherCommande} className="form-livraison">
        <label>Numéro de commande :</label>
        <input
          type="number"
          required
          placeholder="Ex: 14"
          value={commandeId}
          onChange={(e) => setCommandeId(e.target.value)}
        />

        <label>Numéro de téléphone :</label>
        <input
          type="tel"
          required
          placeholder="Numéro indiqué lors de la commande"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <button type="submit" className="btn-valider" style={{ marginTop: '10px' }} disabled={chargement}>
          {chargement ? "Recherche en cours..." : "Suivre mon colis"}
        </button>
      </form>

      {erreur && (
        <p style={{ marginTop: '20px', color: '#c0392b', fontWeight: 'bold', textAlign: 'center' }}>
          ⚠️ {erreur}
        </p>
      )}

      {resultat && (
        <div style={{
          marginTop: '28px',
          padding: '22px',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid var(--bordure-bleue)',
          boxShadow: 'var(--ombre-carte)'
        }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--bleu-profond)', textAlign: 'center' }}>
            Commande #{resultat.id}
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: '20px 0',
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--fond-debut)',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textAlign: 'center',
            gap: '6px'
          }}>
            <div style={{ flex: 1, color: etapeActuelle >= 1 ? 'var(--bleu-profond)' : '#999' }}>
              ⏳<br />En préparation
            </div>
            <div style={{ flex: 1, color: etapeActuelle >= 2 ? 'var(--bleu-profond)' : '#999' }}>
              🚚<br />Expédiée
            </div>
            <div style={{ flex: 1, color: etapeActuelle >= 3 ? '#27ae60' : '#999' }}>
              ✅<br />Livrée
            </div>
          </div>

          <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
            <p><strong>Client :</strong> {resultat.nom_client}</p>
            <p><strong>Destination :</strong> {resultat.ville}</p>
            <p><strong>Montant réglé :</strong> {resultat.total.toFixed(2)} €</p>
            <p><strong>Statut actuel :</strong> <span style={{ color: 'var(--bleu-profond)', fontWeight: 'bold' }}>{resultat.statut}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
