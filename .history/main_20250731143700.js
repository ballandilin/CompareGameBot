require('dotenv').config()
const Discord = require('discord.js')
const { Client, MessageEmbed } = require('discord.js')
const { JSDOM } = require('jsdom')
const { window } = new JSDOM('')
const $ = require('jquery')(window)
const axios = require('axios')
const cheerio = require('cheerio')

const client = new Client()

// Configuration depuis les variables d'environnement
const prefix = process.env.PREFIX || '!'
const token = process.env.DISCORD_TOKEN

// Vérification que le token est défini
if (!token) {
  console.error(
    'ERREUR: Token Discord manquant! Veuillez définir DISCORD_TOKEN dans votre fichier .env',
  )
  process.exit(1)
}

//////////////////////////////////// Creation de function //////////////////////////

/**
 * Fonction pour du webscraping sur DLCompare
 * @param {string} game - Le nom du jeu à rechercher
 * @param {object} msg - Le message Discord
 */
function requestCompare(game, msg) {
  const gameQuery = Array.isArray(game) ? game.join(' ') : game
  const searchUrl = `https://www.dlcompare.fr/search?q=${encodeURIComponent(
    gameQuery,
  )}`

  console.log(`🔍 Recherche de "${gameQuery}" sur DLCompare...`)

  axios
    .get(searchUrl, {
      timeout: 10000, // Timeout de 10 secondes
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    .then((response) => {
      //handling the success
      const html = response.data

      //loading response data into a Cheerio instance
      const $ = cheerio.load(html)

      //selecting the elements with the data
      const data = $('ul.catalog')

      const gameList = htmlToArrayOfJson(data.html())

      if (gameList.length === 0) {
        msg.channel.send(`❌ Aucun résultat trouvé pour "${gameQuery}"`)
        return
      }

      DataToembed(gameList.slice(0, 9), msg)
    })
    //handling error
    .catch((error) => {
      console.error('❌ Erreur lors de la recherche:', error.message)
      msg.channel.send(
        `❌ Erreur lors de la recherche de "${gameQuery}". Veuillez réessayer plus tard.`,
      )
    })
}

/**
 * Fonction Easter Egg pour Guidouille
 * @param {object} msg - Le message Discord
 */
function requestGuidet(msg) {
  console.log('🎮 Easter egg Guidouille activé!')
  const gameList = htmlToArrayOfJsonGuidet()
  DataToembed(gameList, msg)
}

/**
 * Format les données provenant du webscraping en tableau de Json
 * @param {*} html
 */
function htmlToArrayOfJsonGuidet() {
  var newData = new Array()

  var Game = {
    title: 'Apprendre la programmation C++',
    url: 'https://www.elephorm.com/formation/code/c/apprendre-la-programmation-c',
    price: '79,00€',
    platform: '[Guidouille](https://www.youtube.com/watch?v=yGVrr_w9MGo)',
    imgsrc:
      'https://image-uviadeo.journaldunet.com/image/450/1580203210/1000004.jpg',
  }

  newData.push(Game)
  return newData
}

/**
 * Formate les données provenant du webscraping en tableau de Json
 * @param {string} html - HTML à parser
 * @returns {Array} Tableau d'objets représentant les jeux
 */
function htmlToArrayOfJson(html) {
  const newData = []

  if (!html || html.trim() === '') {
    console.log('⚠️  HTML vide reçu')
    return newData
  }

  const result = html.trim().split('\n')

  result.forEach((element) => {
    const $ = cheerio.load(element.trim())

    const title = $('span.name').text().trim()
    const price = $('div.catalog-price').first().text().trim()
    const platform = $('span.catalog-shop-name').text().trim()
    const imgsrc = $('img.catalog-img').attr('src')

    // Ne pas ajouter d'éléments vides
    if (title && price && platform) {
      const Game = {
        title: title,
        url: title, // À améliorer si possible de récupérer la vraie URL
        price: price,
        platform: platform,
        imgsrc: imgsrc || 'https://via.placeholder.com/300x200?text=No+Image',
      }
      newData.push(Game)
    }
  })

  console.log(`✅ ${newData.length} jeux trouvés`)
  return newData
}

/**
 * Permet de remplir un MessageEmbed avec des données
 * @param {Array} data - Tableau des données des jeux
 * @param {object} msg - Le message Discord
 */
async function DataToembed(data, msg) {
  if (!data || data.length === 0) {
    msg.channel.send('❌ Aucune donnée à afficher.')
    return
  }

  const embedArray = []

  try {
    await deleteWebhook(msg)

    data.forEach((element) => {
      const embed = new MessageEmbed()
        .setTitle(element.title || 'Titre inconnu')
        .setColor(0xf0b10e)
        .setImage(element.imgsrc)
        .addFields(
          {
            name: '🏪 Plateforme',
            value: element.platform || 'Inconnue',
            inline: true,
          },
          {
            name: '💰 Prix',
            value: element.price || 'Non disponible',
            inline: true,
          },
        )
        .setTimestamp()
      embedArray.push(embed)
    })

    const webhook = await msg.channel.createWebhook('Résultat', {
      avatar: msg.author.displayAvatarURL(),
    })

    await webhook.send({ embeds: embedArray })
    console.log(`✅ ${embedArray.length} résultats envoyés`)
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'embed:", error)
    msg.channel.send("❌ Erreur lors de l'affichage des résultats.")
  }
}

/**
 * Supprime les webhooks existants pour éviter les doublons
 * @param {object} msg - Le message Discord
 */
async function deleteWebhook(msg) {
  try {
    const webhooks = await msg.channel.fetchWebhooks()
    const myWebhooks = webhooks.filter(
      (webhook) =>
        webhook.owner.id === client.user.id && webhook.name === 'Résultat',
    )

    if (myWebhooks.size === 0) {
      return
    }

    for (let [id, webhook] of myWebhooks) {
      await webhook.delete(`Nettoyage automatique par ${msg.author.tag}`)
    }

    console.log(`🧹 ${myWebhooks.size} webhook(s) supprimé(s)`)
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des webhooks:', error)
    // Ne pas bloquer le processus pour cette erreur
  }
}

///////////////////////////////////////////////////////////////////////////////////

// Événements du bot
client.on('ready', () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}!`)
  console.log(`📊 Connecté à ${client.guilds.cache.size} serveur(s)`)
  console.log(`👥 ${client.users.cache.size} utilisateur(s) accessibles`)

  client.user.setActivity(`${prefix}pc <jeu> | Comparer les prix`, {
    type: 'PLAYING',
  })
})

client.on('error', (error) => {
  console.error('❌ Erreur du client Discord:', error)
})

client.on('message', (msg) => {
  // Ignorer les messages du bot lui-même et ceux qui ne commencent pas par le préfixe
  if (!msg.content.startsWith(prefix) || msg.author.bot) return

  const args = msg.content.slice(prefix.length).trim().split(' ')
  const command = args.shift().toLowerCase()

  console.log(
    `📝 Commande reçue: ${command} par ${msg.author.tag} dans ${
      msg.guild?.name || 'DM'
    }`,
  )

  // Commande principale de comparaison de prix
  if (command === 'pc' || command === 'price') {
    handlePriceCommand(args, msg)
  }
  // Commande d'aide
  else if (command === 'help' || command === 'aide') {
    handleHelpCommand(msg)
  }
})

/**
 * Gère la commande de comparaison de prix
 * @param {Array} args - Arguments de la commande
 * @param {object} msg - Le message Discord
 */
function handlePriceCommand(args, msg) {
  if (!args.length) {
    const helpEmbed = new MessageEmbed()
      .setColor('#FF6B6B')
      .setTitle('❌ Argument manquant')
      .setDescription(`Utilisation: \`${prefix}pc <nom du jeu>\``)
      .addField('Exemple', `\`${prefix}pc Cyberpunk 2077\``)
      .setFooter("Tapez !help pour plus d'informations")

    return msg.channel.send(helpEmbed)
  }

  const gameQuery = args.join(' ').toLowerCase()

  if (gameQuery === 'guidouille') {
    console.log('🎮 Easter egg Guidouille activé!')
    requestGuidet(msg)
  } else {
    requestCompare(args, msg)
  }
}

/**
 * Gère la commande d'aide
 * @param {object} msg - Le message Discord
 */
function handleHelpCommand(msg) {
  const helpEmbed = new MessageEmbed()
    .setColor('#4A90E2')
    .setTitle('🤖 CompareGameBot - Aide')
    .setDescription('Bot Discord pour comparer les prix de jeux vidéo')
    .addFields(
      {
        name: `${prefix}pc <jeu>`,
        value: "Compare les prix d'un jeu sur différentes plateformes",
        inline: false,
      },
      {
        name: `${prefix}help`,
        value: 'Affiche cette aide',
        inline: false,
      },
      {
        name: 'Exemple',
        value: `\`${prefix}pc Elden Ring\``,
        inline: false,
      },
    )
    .setFooter('Développé par Nicolas Benoit')
    .setTimestamp()

  msg.channel.send(helpEmbed)
}

// Connexion du bot
client
  .login(token)
  .then(() => {
    console.log('✅ Connexion réussie!')
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion:', error)
    process.exit(1)
  })

// Gestion gracieuse de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du bot...')
  client.destroy()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du bot (SIGTERM)...')
  client.destroy()
  process.exit(0)
})
