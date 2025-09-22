require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Hazle una pregunta a Syior")
    .addStringOption(option =>
      option.setName("pregunta")
        .setDescription("Tu pregunta")
        .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Registrando comando /ask...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Comando /ask registrado correctamente");
  } catch (error) {
    console.error("❌ Error al registrar el comando:", error);
  }
})();
