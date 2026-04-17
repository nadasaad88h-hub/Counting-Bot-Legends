"use strict";

const {
  Client,
  GatewayIntentBits,
  Events,
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;

// ✅ Your counting channel
const COUNTING_CHANNEL_ID = "1494238876829483078";

// Stores last correct number per channel
const lastNumber = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Counting bot online as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  // Only allow counting channel
  if (message.channel.id !== COUNTING_CHANNEL_ID) return;

  const content = message.content.trim();

  // Delete non-numbers
  if (!/^\d+$/.test(content)) {
    return message.delete().catch(() => {});
  }

  const number = parseInt(content);

  const prev = lastNumber.get(message.channel.id) ?? 0;

  // Wrong number → delete
  if (number !== prev + 1) {
    return message.delete().catch(() => {});
  }

  // Correct number → update
  lastNumber.set(message.channel.id, number);
});

client.login(TOKEN);
