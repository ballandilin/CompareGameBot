require('dotenv').config();
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client();

// Configuration depuis les variables d'environnement
const prefix = process.env.PREFIX || '!';
const token = process.env.DISCORD_TOKEN;

// Vérification que le token est défini
if (!token) {
    console.error('ERREUR: Token Discord manquant! Veuillez définir DISCORD_TOKEN dans votre fichier .env');
    process.exit(1);
}




//////////////////////////////////// Creation de function //////////////////////////


/**
 * Fonction pour du webscraping sur DLCompare
 * @param {string} game - Le nom du jeu à rechercher
 * @param {object} msg - Le message Discord
 */
function requestCompare(game, msg) {
	const gameQuery = Array.isArray(game) ? game.join(' ') : game;
	const searchUrl = `https://www.dlcompare.fr/search?q=${encodeURIComponent(gameQuery)}`;
	
	console.log(`🔍 Recherche de "${gameQuery}" sur DLCompare...`);
	
	axios
	.get(searchUrl, {
		timeout: 10000, // Timeout de 10 secondes
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

		const gameList = htmlToArrayOfJson(data.html());
		
		if (gameList.length === 0) {
			msg.channel.send(`❌ Aucun résultat trouvé pour "${gameQuery}"`);
			return;
		}

		DataToembed(gameList.slice(0, 9), msg);

	})
	//handling error
	.catch((error) => {
		console.error('❌ Erreur lors de la recherche:', error.message);
		msg.channel.send(`❌ Erreur lors de la recherche de "${gameQuery}". Veuillez réessayer plus tard.`);
	});
}

/**
 * Fonction Easter Egg pour Guidouille
 * @param {object} msg - Le message Discord
 */
function requestGuidet(msg) {
	console.log('🎮 Easter egg Guidouille activé!');
	const gameList = htmlToArrayOfJsonGuidet();
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

	var result = html.trim().split("\n");
	var $;

	result.forEach(element => {
		$ = cheerio.load(element.trim());

		var Game = {
			title : $("span.name").text(),
			url : $("span.name").text(),
			price : $("div.catalog-price").first().text(),
			platform : $("span.catalog-shop-name").text(),
			imgsrc : $("img.catalog-img").attr("src"),
		}

		newData.push(Game);
	});

	return newData;

}




/**
 * Permet de remplir un MessageEmbed avec des données
 * @param {*} data 
 */
function DataToembed(data, msg) {
	var embedArray = new Array();
	var embed;
	deleteWebhook(msg);

	data.forEach(element => {
		embed = new MessageEmbed()
		.setTitle(element.title)
		.setColor(0xF0B10E)
		.setImage(element.imgsrc)
		.addFields(
			{ name: 'Platforme', value: element.platform, inline: true},
			{ name: 'Prix', value: element.price, inline: true },
		)
		embedArray.push(embed);
		});

	msg.channel.createWebhook('Resultat', msg.author.displayAvatarURL)
		.then(w => w.send({ embeds: embedArray }))
		.catch();

}

async function deleteWebhook(msg) {
	const webhooks = await msg.channel.fetchWebhooks();
	const myWebhooks = webhooks.filter(webhook => webhook.owner.id === client.user.id && webhook.name === 'Resultat');

	try {
	if (myWebhooks.size === 0) return 0;

	for (let [id, webhook] of myWebhooks) await webhook.delete(`Requested by ${msg.author.tag}`);

	// await msg.channel.send('Successfully deleted all of my Webhooks from that channel.');
	} catch(err) {
	console.error(err);

	await msg.channel.send('Un probleme est survenue pendant la suppresion des webhhooks')
		.catch(console.error);
	}
}


///////////////////////////////////////////////////////////////////////////////////







client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Compare game price");
});


client.on('message', msg => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	if (!msg.author.bot) {
		var guild = msg.channel.guild;
		var author = guild.member(msg.author);
		var chan = author.voice.channel;
		var photo;
	}

	const args = msg.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();



	if (command === 'pc') {

		console.log(args);

		if (!args.length) {
			return msg.channel.send('Rentrer un jeu apres la commande ex: !Price Rust');
		}
		
		if(args == "guidouille") {
			// msg.channel.send('Le jeu recherché est ' + args);
			console.log(args);
			requestGuidet(msg);
		} else {
			requestCompare(args, msg);
		}

	}

	
});

client.login(token);
