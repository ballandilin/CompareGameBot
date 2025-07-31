# 🤖 CompareGameBot

Un bot Discord pour comparer les prix de jeux vidéo sur différentes plateformes.

## 📋 Fonctionnalités

- 🔍 **Recherche de jeux** : Recherche et compare les prix sur DLCompare.fr
- 💰 **Affichage des prix** : Présentation claire des prix et plateformes
- 🎮 **Interface Discord** : Commandes simples et embeds élégants
- 🔒 **Sécurisé** : Gestion sécurisée des tokens via variables d'environnement
- 🛡️ **Gestion d'erreurs** : Gestion robuste des erreurs et timeouts

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) v14 ou supérieur
- Un bot Discord (créé sur le [Discord Developer Portal](https://discord.com/developers/applications))

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/ballandilin/CompareGameBot.git
   cd CompareGameBot
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration**
   - Copier le fichier `.env.example` vers `.env`
   ```bash
   copy .env.example .env
   ```
   - Éditer le fichier `.env` avec vos paramètres :
   ```env
   DISCORD_TOKEN=votre_token_discord_ici
   PREFIX=!
   ```

4. **Lancer le bot**
   ```bash
   npm start
   ```

## 🎯 Utilisation

### Commandes disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!pc <jeu>` | Compare les prix d'un jeu | `!pc Cyberpunk 2077` |
| `!help` | Affiche l'aide | `!help` |

### Exemples d'utilisation

```
!pc Elden Ring
!pc The Witcher 3
!pc guidouille  // Easter egg 🎮
```

## 🛠️ Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Discord.js** - Bibliothèque pour l'API Discord
- **Axios** - Client HTTP pour les requêtes web
- **Cheerio** - Parser HTML côté serveur
- **Puppeteer** - Automatisation de navigateur
- **dotenv** - Gestion des variables d'environnement

## 📁 Structure du projet

```
CompareGameBot/
├── main.js           # Point d'entrée principal
├── package.json      # Dépendances et scripts
├── .env.example      # Exemple de configuration
├── .gitignore        # Fichiers à ignorer par Git
├── Procfile          # Configuration pour le déploiement
└── README.md         # Documentation
```

## 🔧 Configuration du bot Discord

1. Aller sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer une nouvelle application
3. Aller dans l'onglet "Bot"
4. Créer un bot et copier le token
5. Activer les "Privileged Gateway Intents" si nécessaire
6. Inviter le bot sur votre serveur avec les permissions :
   - Lire les messages
   - Envoyer des messages
   - Gérer les webhooks
   - Utiliser les commandes slash (optionnel)

## 🚀 Déploiement

### Heroku

Le projet inclut un `Procfile` pour le déploiement sur Heroku :

1. Créer une application Heroku
2. Configurer les variables d'environnement dans Heroku
3. Déployer via Git

### Autres plateformes

Le bot peut être déployé sur n'importe quelle plateforme supportant Node.js :
- Railway
- Render
- DigitalOcean App Platform
- VPS personnel

## 🐛 Résolution de problèmes

### Erreurs courantes

- **"Token Discord manquant"** : Vérifiez que `DISCORD_TOKEN` est défini dans `.env`
- **"Aucun résultat trouvé"** : Le jeu recherché n'existe peut-être pas sur DLCompare
- **Erreurs de webscraping** : Le site cible peut avoir changé sa structure

### Logs

Le bot affiche des logs détaillés dans la console :
- ✅ Succès
- ❌ Erreurs
- 🔍 Recherches
- 📝 Commandes

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Changelog

### Version 2.0.0 (2025-07-31)
- 🔒 **Sécurité** : Migration vers variables d'environnement
- 🛡️ **Robustesse** : Amélioration de la gestion d'erreurs
- 🎨 **Interface** : Embeds améliorés avec emojis
- 📚 **Documentation** : README complet
- 🧹 **Code** : Refactoring et optimisations
- ⚡ **Performance** : Timeout et headers HTTP optimisés

### Version 1.0.0
- ✨ Version initiale
- 🔍 Recherche de prix sur DLCompare
- 🤖 Commandes Discord de base

## 📜 Licence

Ce projet est sous licence ISC. Voir le fichier `package.json` pour plus de détails.

## 👨‍💻 Auteur

**Nicolas Benoit**
- GitHub: [@ballandilin](https://github.com/ballandilin)

## 🙏 Remerciements

- [Discord.js](https://discord.js.org/) pour l'excellente documentation
- [DLCompare](https://www.dlcompare.fr/) pour les données de prix
- La communauté Discord.js pour le support

---

⭐ N'hésitez pas à mettre une étoile si ce projet vous aide !
