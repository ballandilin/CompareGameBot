require('dotenv').config();
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client();

// Configuration depuis les variables d'environnement uniquement
const prefix = process.env.PREFIX || '!';
const token = process.env.DISCORD_TOKEN;

if (!token) {
	console.error('ERREUR: Token Discord manquant! Veuillez définir DISCORD_TOKEN dans votre fichier .env');
	process.exit(1);
}




//////////////////////////////////// Modules de scraping //////////////////////////

/**
 * Module de scraping pour DLCompare
 */
const DLCompareScraper = {
	/**
	 * Recherche un jeu sur DLCompare
	 * @param {string} gameQuery - Le nom du jeu à rechercher
	 * @returns {Promise<Array>} Liste des jeux trouvés
	 */
	async search(gameQuery) {
		const searchUrl = `https://www.dlcompare.fr/search?q=${encodeURIComponent(gameQuery)}`;
		
		const response = await axios.get(searchUrl, {
			timeout: 10000,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		const $ = cheerio.load(response.data);
		const data = $("ul.catalog");
		
		return this.parseResults(data.html());
	},

	/**
	 * Parse les résultats HTML en objets structurés
	 * @param {string} html - HTML à parser
	 * @returns {Array} Tableau d'objets représentant les jeux
	 */
	parseResults(html) {
		const results = [];
		
		if (!html || html.trim() === '') {
			return results;
		}

		const elements = html.trim().split("\n");

		elements.forEach(element => {
			const $ = cheerio.load(element.trim());
			
			const title = $("span.name").text().trim();
			const price = $("div.catalog-price").first().text().trim();
			const platform = $("span.catalog-shop-name").text().trim();
			const imgsrc = $("img.catalog-img").attr("src");
			
			if (title && price && platform) {
				results.push({
					title,
					url: title,
					price,
					platform,
					imgsrc: imgsrc || 'https://via.placeholder.com/300x200?text=No+Image',
				});
			}
		});

		return results;
	}
};

/**
 * Module pour les easter eggs
 */
const EasterEggs = {
	/**
	 * Retourne les données pour l'easter egg Guidouille
	 * @returns {Array} Données de l'easter egg
	 */
	getGuidouille() {
		return [{
			title: "Apprendre la programmation C++",
			url: "https://www.elephorm.com/formation/code/c/apprendre-la-programmation-c",
			price: "79,00€",
			platform: "[Guidouille](https://www.youtube.com/watch?v=yGVrr_w9MGo)",
			imgsrc: "https://image-uviadeo.journaldunet.com/image/450/1580203210/1000004.jpg",
		}];
	}
};

/**
 * Module pour la gestion Discord
 */
const DiscordManager = {
	/**
	 * Supprime les webhooks existants pour éviter les doublons
	 * @param {object} msg - Le message Discord
	 */
	async cleanupWebhooks(msg) {
		try {
			const webhooks = await msg.channel.fetchWebhooks();
			const myWebhooks = webhooks.filter(webhook => 
				webhook.owner.id === client.user.id && webhook.name === 'Resultat'
			);

			if (myWebhooks.size === 0) return;

			for (let [id, webhook] of myWebhooks) {
				await webhook.delete(`Requested by ${msg.author.tag}`);
			}
		} catch(error) {
			console.error('Erreur lors de la suppression des webhooks:', error);
		}
	},

	/**
	 * Créé et envoie les embeds avec les résultats
	 * @param {Array} data - Données des jeux
	 * @param {object} msg - Le message Discord
	 */
	async sendResults(data, msg) {
		if (!data || data.length === 0) {
			msg.channel.send('Aucune donnée à afficher.');
			return;
		}

		try {
			await this.cleanupWebhooks(msg);

			const embedArray = data.map(element => new MessageEmbed()
				.setTitle(element.title || 'Titre inconnu')
				.setColor(0xF0B10E)
				.setImage(element.imgsrc)
				.addFields(
					{ name: 'Platforme', value: element.platform || 'Inconnue', inline: true},
					{ name: 'Prix', value: element.price || 'Non disponible', inline: true },
				)
				.setTimestamp()
			);

			const webhook = await msg.channel.createWebhook('Resultat', {
				avatar: msg.author.displayAvatarURL()
			});
			
			await webhook.send({ embeds: embedArray });
			
		} catch (error) {
			console.error('Erreur lors de la création de l\'embed:', error);
			msg.channel.send('Erreur lors de l\'affichage des résultats.');
		}
	}
};

//////////////////////////////////// Fonctions principales //////////////////////////

/**
 * Recherche un jeu sur DLCompare
 * @param {Array} game - Arguments de recherche
 * @param {object} msg - Le message Discord
 */
async function requestCompare(game, msg) {
	const gameQuery = Array.isArray(game) ? game.join(' ') : game;
	
	try {
		const results = await DLCompareScraper.search(gameQuery);
		
		if (results.length === 0) {
			msg.channel.send(`Aucun résultat trouvé pour "${gameQuery}"`);
			return;
		}

		await DiscordManager.sendResults(results.slice(0, 9), msg);
	} catch (error) {
		console.error('Erreur lors de la recherche:', error.message);
		msg.channel.send(`Erreur lors de la recherche de "${gameQuery}". Veuillez réessayer plus tard.`);
	}
}

/**
 * Fonction pour l'easter egg Guidouille
 * @param {object} msg - Le message Discord
 */
async function requestGuidet(msg) {
	const data = EasterEggs.getGuidouille();
	await DiscordManager.sendResults(data, msg);
}

//////////////////////////////////// Gestionnaire de commandes //////////////////////////







client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Compare game price");
});


client.on('message', msg => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const args = msg.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

	if (command === 'pc') {
		if (!args.length) {
			return msg.channel.send(`Rentrer un jeu après la commande ex: ${prefix}pc Rust`);
		}
		
		const gameQuery = args.join(' ').toLowerCase();
		if(gameQuery === "guidouille") {
			requestGuidet(msg);
		} else {
			requestCompare(args, msg);
		}
	}
});

client.login(token)
	.catch(error => {
		console.error('Erreur de connexion:', error);
		process.exit(1);
	});
