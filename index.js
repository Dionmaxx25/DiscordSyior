require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const axios = require("axios");
const http = require("http");

const MAX_TOKENS = 250000;
const MEMORY_LIMIT = 5;
const memory = new Map(); // 🧠 Memoria por usuario

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel] // ✅ Necesario para recibir DMs
});

client.once("ready", () => {
  console.log(`✅ Syior está conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isDM = message.channel.type === 1 || message.channel.type === "DM"; // ✅ Detecta DMs correctamente
  const isGroup = !isDM;
  const isCommand = message.content.startsWith("/ask ");

  // En grupo, solo responde si es /ask
  if (isGroup && !isCommand) return;

  const userText = isDM ? message.content : message.content.replace("/ask ", "").trim();
  const userId = message.author.id;
  const lowerText = userText.toLowerCase();

  const nameTriggers = ["¿cómo te llamas", "como te llamas", "tu nombre", "quién eres", "quien eres"];
  const creatorTriggers = ["quién te creó", "quien te creó", "quien te creo", "quién te creo", "quien es tu creador", "quién es tu creador"];

  try {
    await message.channel.sendTyping();

    // 🧠 Reconocimiento de identidad
    if (nameTriggers.some(trigger => lowerText.includes(trigger))) {
      return message.reply("Me llamo Syior 🤖. Estoy aquí para ayudarte con lo que necesites.");
    }

    if (creatorTriggers.some(trigger => lowerText.includes(trigger))) {
      return message.reply("Fui creado por Dionner, un programador cubano 🇨🇺 con visión y talento.");
    }

    // 🧠 Actualizar memoria
    const history = memory.get(userId) || [];
    history.push(userText);
    if (history.length > MEMORY_LIMIT) history.shift();
    memory.set(userId, history);

    // 🧠 Construir contexto
    const context = history.join("\n");

    const response = await axios.post(process.env.SYIOR_BACKEND_URL + "/ask", {
      text: context,
      user_id: userId
    });

    let reply = response.data.reply || "Hmm... no tengo respuesta para eso 😅.";

    // 📏 Control de longitud
    if (reply.length > MAX_TOKENS) {
      reply = reply.slice(0, MAX_TOKENS) + " [...]";
    }

    const charismaticReply = addCharisma(reply);
    await message.reply(charismaticReply);
  } catch (error) {
    console.error("❌ Error al contactar con Syior:", error.message);
    await message.reply("Syior tuvo un problema técnico 🛠️. Intenta de nuevo en unos segundos.");
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

// 🌐 Servidor HTTP para Render y UptimeRobot
http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Syior está activo 🚀");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
