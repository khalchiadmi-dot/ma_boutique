import { useState } from 'react';

export default function Contact() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const gererEnvoi = (e) => {
    e.preventDefault();
    if (envoiEnCours) return;
    setEnvoiEnCours(true);

    fetch("https://onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, email, sujet, message })
    })
      .then(async (r) => {
        setEnvoiEnCours(false);
        if (r.ok) {
          setEnvoye(true);
          setNom('');
          setEmail('');
          setSujet('');
          setMessage('');
        } else {
          const err = await r.json().catch(() => ({}));
          alert("⚠️ Erreur lors de l'envoi : " + (err.error || "Veuillez réessayer."));
        }
      })
      .catch(() => {
        setEnvoiEnCours(false);
        alert("⚠️ Impossible de joindre le serveur (patientez 40s s'il sort de veille).");
      });
  };

  return (
    <main className="contact-page">
      <h2 className="titre-page">Contactez-nous</h2>
      <p className="contact-intro">
        Une question sur un bijou, une commande personnalisée ou une livraison internationale ? Notre équipe AURELIA vous répond sous 24h.
      </p>

      <div className="contact-grille">
        {/* Colonne de gauche : Coordonnées */}
        <div className="contact-infos-carte">
          <h3>Service Client AURELIA</h3>

          <div className="contact-info-item">
            <span className="contact-info-icone">📧</span>
            <div>
              <strong>E-mail</strong>
              <div>contact@aurelia-bijoux.com</div>
            </div>
          </div>

          <div className="contact-info-item">
            <span className="contact-info-icone">🌍</span>
            <div>
              <strong>Livraison Internationale</strong>
              <div>Expédition suivie dans le monde entier.</div>
            </div>
          </div>

          <div className="contact-info-item">
            <span className="contact-info-icone">🕒</span>
            <div>
              <strong>Horaires de réponse</strong>
              <div>Lundi au Samedi : 9h00 – 19h00</div>
            </div>
          </div>

          <div className="contact-info-item">
            <span className="contact-info-icone">✨</span>
            <div>
              <strong>Garantie Qualité</strong>
              <div>Chaque pièce est contrôlée et emballée avec soin.</div>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Formulaire */}
        <div className="contact-form-carte">
          {envoye ? (
            <div className="contact-confirmation">
              <h3>✨ Merci pour votre message !</h3>
              <p>Nous avons bien reçu votre demande et nous vous répondrons très rapidement.</p>
              <button
                className="btn-contact-envoyer"
                onClick={() => setEnvoye(false)}
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={gererEnvoi} className="contact-form">
              <div className="contact-groupe">
                <label>Votre nom complet :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Zahra Sabrou"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>

              <div className="contact-groupe">
                <label>Votre adresse e-mail :</label>
                <input
                  type="email"
                  required
                  placeholder="Ex. zahra@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="contact-groupe">
                <label>Sujet :</label>
                <input
                  type="text"
                  required
                  placeholder="Question sur un bijou, suivi de commande..."
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                />
              </div>

              <div className="contact-groupe">
                <label>Votre message :</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Écrivez votre message ici..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-contact-envoyer"
                disabled={envoiEnCours}
              >
                {envoiEnCours ? "Envoi en cours..." : "Envoyer le message ✉️"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
