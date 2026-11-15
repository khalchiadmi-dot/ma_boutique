import { useState } from 'react';

export default function Contact() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [envoye, setEnvoye] = useState(false);

  const gererEnvoi = (e) => {
    e.preventDefault();
    setEnvoye(true);
    setNom('');
    setEmail('');
    setSujet('');
    setMessage('');
  };

  return (
    <main className="contenu">
      <h2 className="titre-page">Contactez-nous</h2>
      <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 30px' }}>
        Une question sur un bijou, une commande ou une livraison internationale ? Notre équipe AURELIA vous répond sous 24h.
      </p>

      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        {envoye ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>✨ Merci pour votre message !</h3>
            <p>Nous avons bien reçu votre demande et nous vous répondrons très rapidement.</p>
            <button
              className="btn-primaire"
              onClick={() => setEnvoye(false)}
              style={{ marginTop: '15px' }}
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={gererEnvoi} className="form-livraison">
            <label>Votre nom complet :</label>
            <input
              type="text"
              required
              placeholder="Ex. Sarah Martin"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />

            <label>Votre adresse e-mail :</label>
            <input
              type="email"
              required
              placeholder="Ex. sarah@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Sujet :</label>
            <input
              type="text"
              required
              placeholder="Question sur un produit, suivi de commande..."
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
            />

            <label>Votre message :</label>
            <textarea
              required
              rows="5"
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button type="submit" className="btn-valider" style={{ width: '100%', marginTop: '10px' }}>
              Envoyer le message ✉️
            </button>
          </form>
        )}

        <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #eee', fontSize: '0.95rem', textAlign: 'center' }}>
          <p><strong>Service Client AURELIA</strong></p>
          <p>📧 Email : contact@aurelia-bijoux.com</p>
          <p>🌍 Livraison internationale disponible</p>
        </div>
      </div>
    </main>
  );
}
