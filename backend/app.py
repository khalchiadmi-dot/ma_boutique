import os
import json
import urllib.request
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL")
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "contact@aurelia.com")

def get_db():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    if not DATABASE_URL:
        return
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS produits (
            id SERIAL PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            prix NUMERIC(10, 2) NOT NULL,
            description TEXT,
            image_url TEXT
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS commandes (
            id SERIAL PRIMARY KEY,
            nom_client VARCHAR(255) NOT NULL,
            telephone VARCHAR(50) NOT NULL,
            ville VARCHAR(255) NOT NULL,
            adresse TEXT NOT NULL,
            total NUMERIC(10, 2) NOT NULL,
            articles TEXT,
            statut VARCHAR(50) DEFAULT 'En préparation',
            date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cur.execute("ALTER TABLE commandes ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'En préparation';")
    conn.commit()
    cur.close()
    conn.close()

try:
    init_db()
except Exception as e:
    print("Erreur init_db:", e)

@app.route('/')
def home():
    return jsonify({"status": "API Boutique en ligne opérationnelle"})

# --- PRODUITS ---
@app.route('/api/produits', methods=['GET'])
def get_produits():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM produits ORDER BY id DESC;")
    produits = cur.fetchall()
    cur.close()
    conn.close()
    for p in produits:
        p['prix'] = float(p['prix'])
    return jsonify(produits)

@app.route('/api/produits', methods=['POST'])
def add_produit():
    data = request.get_json()
    nom = data.get('nom')
    prix = data.get('prix')
    description = data.get('description', '')
    image_url = data.get('image_url', '')

    if not nom or prix is None:
        return jsonify({"error": "Nom et prix obligatoires"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO produits (nom, prix, description, image_url) VALUES (%s, %s, %s, %s) RETURNING id;",
        (nom, float(prix), description, image_url)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Produit ajouté", "id": new_id}), 201

@app.route('/api/produits/<int:produit_id>', methods=['DELETE'])
def delete_produit(produit_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM produits WHERE id = %s;", (produit_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Produit supprimé"})

# --- COMMANDES ---
@app.route('/api/commandes', methods=['GET'])
def get_commandes():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM commandes ORDER BY id DESC;")
    commandes = cur.fetchall()
    cur.close()
    conn.close()
    for c in commandes:
        c['total'] = float(c['total'])
    return jsonify(commandes)

@app.route('/api/commandes', methods=['POST'])
def create_commande():
    data = request.get_json()
    nom_client = data.get('nom_client')
    telephone = data.get('telephone')
    ville = data.get('ville')
    adresse = data.get('adresse')
    total = data.get('total', 0)
    articles = json.dumps(data.get('articles', []), ensure_ascii=False)

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO commandes (nom_client, telephone, ville, adresse, total, articles, statut)
        VALUES (%s, %s, %s, %s, %s, %s, 'En préparation')
        RETURNING id;
        """,
        (nom_client, telephone, ville, adresse, float(total), articles)
    )
    commande_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Succès", "commande_id": commande_id}), 201

# --- SUIVI DE COMMANDE ---
@app.route('/api/commandes/<int:commande_id>/statut', methods=['PUT'])
def modifier_statut_commande(commande_id):
    data = request.get_json()
    nouveau_statut = data.get('statut', 'En préparation')
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE commandes SET statut = %s WHERE id = %s;", (nouveau_statut, commande_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Statut mis à jour"})

@app.route('/api/suivi/<int:commande_id>', methods=['GET'])
def suivre_commande(commande_id):
    telephone = request.args.get('telephone', '').strip()
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT id, nom_client, ville, total, statut FROM commandes WHERE id = %s AND telephone = %s;",
        (commande_id, telephone)
    )
    commande = cur.fetchone()
    cur.close()
    conn.close()

    if not commande:
        return jsonify({"error": "Aucune commande trouvée avec ce numéro et ce téléphone."}), 404

    commande['total'] = float(commande['total'])
    commande['statut'] = commande.get('statut') or "En préparation"
    return jsonify(commande)

# --- CONTACT (BREVO) ---
@app.route('/api/contact', methods=['POST'])
def envoyer_contact():
    data = request.get_json()
    nom = data.get('nom', 'Client')
    email = data.get('email', '')
    message = data.get('message', '')

    if not BREVO_API_KEY:
        return jsonify({"message": "Message enregistré (clé Brevo non configurée)."}), 200

    payload = {
        "sender": {"name": "Boutique Aurelia", "email": ADMIN_EMAIL},
        "to": [{"email": ADMIN_EMAIL}],
        "replyTo": {"email": email, "name": nom} if email else {"email": ADMIN_EMAIL},
        "subject": f"Nouveau message de {nom}",
        "htmlContent": f"<p><strong>Nom :</strong> {nom}</p><p><strong>Email :</strong> {email}</p><p><strong>Message :</strong><br>{message}</p>"
    }

    req = urllib.request.Request(
        "https://brevo.com",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        },
        method="POST"
    )
    try:
        urllib.request.urlopen(req)
        return jsonify({"message": "Message envoyé avec succès !"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
