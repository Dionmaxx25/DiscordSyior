require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const http = require("http");

const MAX_LENGTH = 250000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

client.once("ready", () => {
  console.log(`Syior está conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isDM = message.channel.type === 1;
  const isGroup = !isDM;
  const isCommand = message.content.startsWith("/ask ");

  if (isGroup && !isCommand) return;

  const userText = isDM ? message.content : message.content.replace("/ask ", "").trim();
  const lowerText = userText.toLowerCase();

  const nameTriggers = ["¿cómo te llamas", "como te llamas", "tu nombre", "quién eres", "quien eres"];

  try {
    await message.channel.sendTyping();

    if (nameTriggers.some(trigger => lowerText.includes(trigger))) {
      return message.reply("Me llamo Syior 🤖. Estoy aquí para ayudarte con lo que necesites.");
    }

    const response = await axios.post(process.env.SYIOR_BACKEND_URL + "/ask", {
      text: userText,
      user_id: message.author.id
    });

    let reply = response.data.reply || "Hmm... no tengo respuesta para eso 😅.";

    if (reply.length > MAX_LENGTH) {
      reply = reply.slice(0, MAX_LENGTH) + " [...]";
    }

    const charismaticReply = addCharisma(reply);
    await message.reply(charismaticReply);
  } catch (error) {
    console.error("Error al contactar con Syior:", error.message);
    await message.reply("Syior está desconectado temporalmente 💤.");
  }
});

function addCharisma(text) {
  const emojis = ["✨", "💡", "😄", "🤖", "🧠", "🚀", "😉"];
  const endings = [
    "¿Te gustaría saber más?",
    "¡Estoy aquí si necesitas otra cosa!",
    "¿Quieres que lo simplifique?",
    "¡Pregúntame lo que quieras!",
    "¡Vamos por más!"
  ];

  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const ending = endings[Math.floor(Math.random() * endings.length)];

  return `${text} ${emoji} ${ending}`;
}

// Servidor mínimo para Render Web Service gratuito
http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Syior está activo 🚀");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
