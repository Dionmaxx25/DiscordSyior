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
  if (!isDM) return; // En grupos no responde a mensajes normales

  const userText = message.content;
  const userId = message.author.id;

  await message.channel.sendTyping();

  try {
    const response = await axios.post(process.env.SYIOR_BACKEND_URL + "/ask", {
      text: `Responde de forma breve y clara: ${userText}`,
      user_id: userId
    });

    let reply = response.data.reply || "No pude generar respuesta 😅.";
    if (reply.length > MAX_TOKENS) {
      reply = reply.slice(0, MAX_TOKENS) + " [...]";
    }

    await message.reply(reply.trim());
  } catch (error) {
    console.error("❌ Error al contactar con Syior:", error.message);
    await message.reply("Syior tuvo un problema técnico 🛠️. Intenta de nuevo.");
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "ask") return;

  const userText = interaction.options.getString("pregunta");
  const userId = interaction.user.id;

  await interaction.deferReply();

  try {
    const response = await axios.post(process.env.SYIOR_BACKEND_URL + "/ask", {
      text: `Responde de forma breve y clara: ${userText}`,
      user_id: userId
    });

    let reply = response.data.reply || "No pude generar respuesta 😅.";
    if (reply.length > MAX_TOKENS) {
      reply = reply.slice(0, MAX_TOKENS) + " [...]";
    }

    await interaction.editReply(reply.trim());
  } catch (error) {
    console.error("❌ Error en /ask:", error.message);
    await interaction.editReply("Syior tuvo un problema técnico 🛠️. Intenta de nuevo.");
  }
});

// 🌐 Servidor HTTP para Render y UptimeRobot
http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Syior está activo 🚀");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
