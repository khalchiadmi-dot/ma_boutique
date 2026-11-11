import os
import json
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

# Autorise le frontend React à communiquer avec le serveur (GET, POST, DELETE, OPTIONS)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "DELETE", "OPTIONS"]}})

# Adresse Supabase IPv4 assemblée proprement pour éviter toute coupure
hote_supabase = "aws-1-eu-west-1.pooler." + "supabase.com"
DATABASE_URL = f"postgresql://postgres.amkhrovkelodfcevsqba:joujou@{hote_supabase}:5432/postgres"

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Produit(db.Model):
    __tablename__ = 'produits'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prix = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))

    def to_json(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "prix": self.prix,
            "description": self.description,
            "image_url": self.image_url
        }

class Commande(db.Model):
    __tablename__ = 'commandes'
    id = db.Column(db.Integer, primary_key=True)
    nom_client = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20), nullable=False)
    ville = db.Column(db.String(50), nullable=False)
    adresse = db.Column(db.Text, nullable=False)
    total = db.Column(db.Float, nullable=False)
    articles = db.Column(db.Text, nullable=False)
    statut = db.Column(db.String(50), default="En attente")

    def to_json(self):
        return {
            "id": self.id,
            "nom_client": self.nom_client,
            "telephone": self.telephone,
            "ville": self.ville,
            "adresse": self.adresse,
            "total": self.total,
            "articles": json.loads(self.articles),
            "statut": self.statut
        }

# 1. Lire le catalogue
@app.route('/api/produits', methods=['GET'])
def get_produits():
    return jsonify([p.to_json() for p in Produit.query.all()])

# 2. Ajouter un produit (avec blocage des doublons)
@app.route('/api/produits', methods=['POST'])
def ajouter_produit():
    donnees = request.json
    nom_article = donnees['nom'].strip()
    if Produit.query.filter(Produit.nom.ilike(nom_article)).first():
        return jsonify({"error": "Ce produit existe déjà dans le catalogue"}), 400
    try:
        nouveau = Produit(
            nom=nom_article,
            prix=float(donnees['prix']),
            description=donnees.get('description', ''),
            image_url=donnees.get('image_url') or '/images/montre_liebe.jpg'
        )
        db.session.add(nouveau)
        db.session.commit()
        return jsonify({"message": "Produit ajouté", "id": nouveau.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# 3. Supprimer un produit
@app.route('/api/produits/<int:id>', methods=['DELETE'])
def supprimer_produit(id):
    produit = Produit.query.get(id)
    if not produit:
        return jsonify({"error": "Produit introuvable"}), 404
    try:
        db.session.delete(produit)
        db.session.commit()
        return jsonify({"message": "Produit supprimé"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# 4. Enregistrer ou fusionner une commande client
@app.route('/api/commandes', methods=['POST'])
def creer_commande():
    donnees = request.json
    tel = donnees['telephone'].strip()
    commande_existante = Commande.query.filter_by(telephone=tel, statut="En attente").first()
    
    try:
        if commande_existante:
            anciens_articles = json.loads(commande_existante.articles)
            nouveaux_articles = anciens_articles + donnees['articles']
            commande_existante.articles = json.dumps(nouveaux_articles)
            commande_existante.total += float(donnees['total'])
            commande_existante.nom_client = donnees['nom_client']
            commande_existante.adresse = donnees['adresse']
            db.session.commit()
            return jsonify({"message": "Succès", "commande_id": commande_existante.id}), 200
        else:
            nouvelle = Commande(
                nom_client=donnees['nom_client'],
                telephone=tel,
                ville=donnees['ville'],
                adresse=donnees['adresse'],
                total=float(donnees['total']),
                articles=json.dumps(donnees['articles'])
            )
            db.session.add(nouvelle)
            db.session.commit()
            return jsonify({"message": "Succès", "commande_id": nouvelle.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# 5. Lire les commandes (Espace Admin)
@app.route('/api/commandes', methods=['GET'])
def get_commandes():
    commandes = Commande.query.order_by(Commande.id.desc()).all()
    return jsonify([c.to_json() for c in commandes])

# Création automatique des tables au démarrage
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8080)
