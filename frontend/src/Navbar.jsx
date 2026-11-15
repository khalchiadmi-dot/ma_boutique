import { useState } from 'react';

export default function Navbar({
  modeAdmin,
  setModeAdmin,
  pageActive,
  setPageActive,
  panierCount,
  totalPanier,
  voirPanier,
  setVoirPanier
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-gauche">
        {!modeAdmin && (
          <div className="menu-burger-zone">
            <button
              className="btn-burger"
              onClick={() => setMenuOuvert(!menuOuvert)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {menuOuvert && (
              <div className="menu-deroulant">
                <a
                  href="#accueil"
                  onClick={(e) => {
                    e.preventDefault();
                    setPageActive('accueil');
                    setVoirPanier(false);
                    setMenuOuvert(false);
                  }}
                >
                  Accueil
                </a>
                <a
                  href="#boutique"
                  onClick={(e) => {
                    e.preventDefault();
                    setPageActive('boutique');
                    setMenuOuvert(false);
                  }}
                >
                  Notre Boutique (Vente)
                </a>
                 <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    setPageActive('contact');
                    setVoirPanier(false);
                    setMenuOuvert(false);
                  }}
                >
                  Contact
                </a>
              </div>
            )}
          </div>
        )}

        <div
          className="logo"
          onClick={() => {
            window.history.pushState({}, '', '/');
            setModeAdmin(false);
            setPageActive('accueil');
            setVoirPanier(false);
            setMenuOuvert(false);
          }}
        >
          <img src="/images/AURELIA1.png" alt="AURELIA" className="logo-img" />
          <div className="logo-textes-bloc">
            <span className="logo-texte">AURELIA</span>
            <span className="logo-texte-slogan">Bijoux & Accessoires</span>
          </div>
        </div>
      </div>

      {!modeAdmin && pageActive !== 'accueil' && (
        <div
          className="panier-status"
          onClick={() => setVoirPanier(!voirPanier)}
          style={{ cursor: 'pointer' }}
        >
          🛒 Panier : <strong>{panierCount}</strong> art. ({totalPanier} €)
        </div>
      )}
    </header>
  );
}
