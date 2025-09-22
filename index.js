require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const axios = require("axios");
const http = require("http");

const MAX_TOKENS = 250000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Syior está conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isDM = message.channel.type === 1 || message.channel.type === "DM";
  const isGroup = !isDM;
  const isCommand = message.content.startsWith("/ask ");

  if (isGroup && !isCommand) return;

  const userText = isDM ? message.content : message.content.replace("/ask ", "").trim();
  const userId = message.author.id;
  const lowerText = userText.toLowerCase();

  const nameTriggers = ["¿cómo te llamas", "como te llamas", "tu nombre", "quién eres", "quien eres"];
  const creatorTriggers = ["quién te creó", "quien te creó", "quien te creo", "quién te creo", "quien es tu creador", "quién es tu creador"];

  try {
    await message.channel.sendTyping();

    if (nameTriggers.some(trigger => lowerText.includes(trigger))) {
      return message.reply("Me llamo Syior 🤖. Estoy aquí para ayudarte.");
    }

    if (creatorTriggers.some(trigger => lowerText.includes(trigger))) {
      return message.reply("Fui creado por Dionner, un programador cubano 🇨🇺.");
    }

    // 🧠 Enviar pregunta al backend con instrucción de brevedad
    const prompt = `Responde de forma breve y clara: ${userText}`;

    const response = await axios.post(process.env.SYIOR_BACKEND_URL + "/ask", {
      text: prompt,
      user_id: userId
    });

    let reply = response.data.reply;

    if (!reply || typeof reply !== "string" || reply.toLowerCase().includes("error")) {
      return message.reply("Syior no pudo responder esta vez 😅. Intenta con otra pregunta.");
    }

    if (reply.length > MAX_TOKENS) {
      reply = reply.slice(0, MAX_TOKENS) + " [...]";
    }

    await message.reply(reply.trim());
  } catch (error) {
    console.error("❌ Error al contactar con Syior:", error.message);
    await message.reply("Syior tuvo un problema técnico 🛠️. Intenta de nuevo en unos segundos.");
  }
});

// 🌐 Servidor HTTP para Render y UptimeRobot
http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Syior está activo 🚀");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
