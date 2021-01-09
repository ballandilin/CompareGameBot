const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );


const client = new Client();
const {prefix, token} = require('./config.json');




//////////////////////////////////// Creation de function //////////////////////////


function requestCompare(game) {
	$.ajax({
		type: "GET",
		url: "https://www.dlcompare.fr/search?q=" + game,
		headers: 
		{ 
			'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			'Accept-Language': "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
			'Connection': "Keep-alive",
			'Cookie' : 'DLCSSID=rb23saa8q7c74d67390dvgu01r; currency=1',
			'Host' : 'www.dlcompare.fr',
			'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'

		},
		success: function(r) {
		  console.log(r);
		}
	});
}



///////////////////////////////////////////////////////////////////////////////////











client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Compare game price");
});

//TODO: ajouter un cota de ban random sur une journee
//TODO : ajouter commande !ban all

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


	const embed = new MessageEmbed()
	.setTitle('GOOMER!!!')
	.setColor(0xF0B10E)

	var realMembers = [];

	if (command === 'price') {

		console.log(args);

		if (!args.length) {
			msg.channel.send('Rentrer un jeu apres la commande ex: !Price Rust');
		} else {
			msg.channel.send('Le jeu recherché est ' + args);
			requestCompare(args);
		}

	}

	
});

client.login(token);
