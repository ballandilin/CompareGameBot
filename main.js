const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const axios = require('axios');
const cheerio = require('cheerio');



const client = new Client();
const {prefix, token} = require('./config.json');




//////////////////////////////////// Creation de function //////////////////////////


/**
 * fonction pour du webscraping
 * @param {*} game 
 */
function requestCompare(game, msg) {
	var gameList;
	axios
	.get("https://www.dlcompare.fr/search?q=" + game)
	.then((response) => {
		//handling the success
		const html = response.data;

		//loading response data into a Cheerio instance
		const $ = cheerio.load(html);

		//selecting the elements with the data
		const data = $("ul.catalog");

		gameList = htmlToArrayOfJson(data.html())

		DataToembed(gameList.slice(0, 9), msg);

	})
	//handling error
	.catch((error) => {
	  console.log(error);
	});



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
		.then(w => w.send({ embeds: embedArray }));

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



	if (command === 'p') {

		console.log(args);

		if (!args.length) {
			msg.channel.send('Rentrer un jeu apres la commande ex: !Price Rust');
		} else {
			msg.channel.send('Le jeu recherché est ' + args);
			requestCompare(args, msg);
		}

	}

	
});

client.login(token);
