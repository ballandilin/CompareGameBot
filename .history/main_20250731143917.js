require('dotenv').config();
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client();

// Configuration depuis les variables d'environnement avec fallback vers config.json
let prefix, token;
try {
	if (process.env.DISCORD_TOKEN) {
		// Utilisation des variables d'environnement
		prefix = process.env.PREFIX || '!';
		token = process.env.DISCORD_TOKEN;
	} else {
		// Fallback vers config.json
		const config = require('./config.json');
		prefix = config.prefix;
		token = config.token;
	}
} catch (error) {
	console.error('Erreur de configuration:', error.message);
	process.exit(1);
}




//////////////////////////////////// Creation de function //////////////////////////


/**
 * fonction pour du webscraping
 * @param {*} game 
 */
function requestCompare(game, msg) {
	const gameQuery = Array.isArray(game) ? game.join(' ') : game;
	var gameList;
	axios
	.get("https://www.dlcompare.fr/search?q=" + encodeURIComponent(gameQuery), {
		timeout: 10000,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
		}
	})
	.then((response) => {
		//handling the success
		const html = response.data;

		//loading response data into a Cheerio instance
		const $ = cheerio.load(html);

		//selecting the elements with the data
		const data = $("ul.catalog");

		gameList = htmlToArrayOfJson(data.html())

		if (gameList.length === 0) {
			msg.channel.send(`Aucun résultat trouvé pour "${gameQuery}"`);
			return;
		}

		DataToembed(gameList.slice(0, 9), msg);

	})
	//handling error
	.catch((error) => {
		console.error('Erreur lors de la recherche:', error.message);
		msg.channel.send(`Erreur lors de la recherche de "${gameQuery}". Veuillez réessayer plus tard.`);
	});
}

/**
 * fonction pour du webscraping
 * @param {*} game 
 */
function requestGuidet(msg) {
	var gameList;

	gameList = htmlToArrayOfJsonGuidet()
	DataToembed(gameList, msg);




}

/**
 * Format les données provenant du webscraping en tableau de Json
 * @param {*} html 
 */
function htmlToArrayOfJsonGuidet() {
	var newData = new Array();

	var Game = {
		title : "Apprendre la programmation C++",
		url : "https://www.elephorm.com/formation/code/c/apprendre-la-programmation-c",
		price : "79,00€",
		platform : "[Guidouille](https://www.youtube.com/watch?v=yGVrr_w9MGo)",
		imgsrc : "https://image-uviadeo.journaldunet.com/image/450/1580203210/1000004.jpg",
	}

	newData.push(Game);
	return newData;

}

/**
 * Format les données provenant du webscraping en tableau de Json
 * @param {*} html 
 */
function htmlToArrayOfJson(html) {
	var newData = new Array();

	if (!html || html.trim() === '') {
		return newData;
	}

	var result = html.trim().split("\n");
	var $;

	result.forEach(element => {
		$ = cheerio.load(element.trim());

		const title = $("span.name").text().trim();
		const price = $("div.catalog-price").first().text().trim();
		const platform = $("span.catalog-shop-name").text().trim();
		const imgsrc = $("img.catalog-img").attr("src");

		// Ne pas ajouter d'éléments vides
		if (title && price && platform) {
			var Game = {
				title : title,
				url : title,
				price : price,
				platform : platform,
				imgsrc : imgsrc || 'https://via.placeholder.com/300x200?text=No+Image',
			}
			newData.push(Game);
		}
	});

	return newData;
}




/**
 * Permet de remplir un MessageEmbed avec des données
 * @param {*} data 
 */
async function DataToembed(data, msg) {
	if (!data || data.length === 0) {
		msg.channel.send('Aucune donnée à afficher.');
		return;
	}

	var embedArray = new Array();
	var embed;
	
	try {
		await deleteWebhook(msg);

		data.forEach(element => {
			embed = new MessageEmbed()
			.setTitle(element.title || 'Titre inconnu')
			.setColor(0xF0B10E)
			.setImage(element.imgsrc)
			.addFields(
				{ name: 'Platforme', value: element.platform || 'Inconnue', inline: true},
				{ name: 'Prix', value: element.price || 'Non disponible', inline: true },
			)
			.setTimestamp();
			embedArray.push(embed);
		});

		const webhook = await msg.channel.createWebhook('Resultat', {
			avatar: msg.author.displayAvatarURL()
		});
		
		await webhook.send({ embeds: embedArray });
		
	} catch (error) {
		console.error('Erreur lors de la création de l\'embed:', error);
		msg.channel.send('Erreur lors de l\'affichage des résultats.');
	}
}

async function deleteWebhook(msg) {
	try {
		const webhooks = await msg.channel.fetchWebhooks();
		const myWebhooks = webhooks.filter(webhook => webhook.owner.id === client.user.id && webhook.name === 'Resultat');

		if (myWebhooks.size === 0) return;

		for (let [id, webhook] of myWebhooks) {
			await webhook.delete(`Requested by ${msg.author.tag}`);
		}
	} catch(error) {
		console.error('Erreur lors de la suppression des webhooks:', error);
		// Ne pas bloquer le processus pour cette erreur
	}
}


///////////////////////////////////////////////////////////////////////////////////







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

client.login(token);
