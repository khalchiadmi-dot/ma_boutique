import os
import json
import urllib.request
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg
from psycopg.rows import dict_row

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "contact@aurelia.com")

def get_db():
    return psycopg.connect(DATABASE_URL, connect_timeout=5, prepare_threshold=None)

@app.route('/')
def home():
    return jsonify({"status": "API Boutique en ligne opérationnelle"})

# --- PRODUITS ---
@app.route('/api/produits', methods=['GET'])
def get_produits():
    try:
        with get_db() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("SELECT * FROM produits ORDER BY id DESC;")
                produits = cur.fetchall()
        for p in produits:
            p['prix'] = float(p['prix'])
        return jsonify(produits)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/produits', methods=['POST'])
def add_produit():
    try:
        data = request.get_json()
        nom = data.get('nom')
        prix = data.get('prix')
        description = data.get('description', '')
        image_url = data.get('image_url', '')

        if not nom or prix is None:
            return jsonify({"error": "Nom et prix obligatoires"}), 400

        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO produits (nom, prix, description, image_url) VALUES (%s, %s, %s, %s) RETURNING id;",
                    (nom, float(prix), description, image_url)
                )
                row = cur.fetchone()
                new_id = row[0] if row else None
            conn.commit()
        return jsonify({"message": "Produit ajouté", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/produits/<int:produit_id>', methods=['DELETE'])
def delete_produit(produit_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM produits WHERE id = %s;", (produit_id,))
            conn.commit()
        return jsonify({"message": "Produit supprimé"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- COMMANDES ---
@app.route('/api/commandes', methods=['GET'])
def get_commandes():
    try:
        with get_db() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("SELECT * FROM commandes ORDER BY id DESC;")
                commandes = cur.fetchall()
        for c in commandes:
            c['total'] = float(c['total'])
        return jsonify(commandes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/commandes', methods=['POST'])
def create_commande():
    try:
        data = request.get_json()
        nom_client = data.get('nom_client')
        telephone = data.get('telephone')
        ville = data.get('ville')
        adresse = data.get('adresse')
        total = data.get('total', 0)
        articles = json.dumps(data.get('articles', []), ensure_ascii=False)

        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO commandes (nom_client, telephone, ville, adresse, total, articles, statut)
                    VALUES (%s, %s, %s, %s, %s, %s, 'En préparation')
                    RETURNING id;
                    """,
                    (nom_client, telephone, ville, adresse, float(total), articles)
                )
                row = cur.fetchone()
                commande_id = row[0] if row else None
            conn.commit()
        return jsonify({"message": "Succès", "commande_id": commande_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- SUIVI DE COMMANDE ---
@app.route('/api/commandes/<int:commande_id>/statut', methods=['PUT'])
def modifier_statut_commande(commande_id):
    try:
        data = request.get_json()
        nouveau_statut = data.get('statut', 'En préparation')
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE commandes SET statut = %s WHERE id = %s;", (nouveau_statut, commande_id))
            conn.commit()
        return jsonify({"message": "Statut mis à jour"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/suivi/<int:commande_id>', methods=['GET'])
def suivre_commande(commande_id):
    try:
        telephone = request.args.get('telephone', '').strip()
        with get_db() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    "SELECT id, nom_client, ville, total, statut FROM commandes WHERE id = %s AND telephone = %s;",
                    (commande_id, telephone)
                )
                commande = cur.fetchone()

        if not commande:
            return jsonify({"error": "Aucune commande trouvée avec ce numéro et ce téléphone."}), 404

        commande['total'] = float(commande['total'])
        commande['statut'] = commande.get('statut') or "En préparation"
        return jsonify(commande)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

    brevo_url = "//brevo.com"
    req = urllib.request.Request(
        brevo_url,
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
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
