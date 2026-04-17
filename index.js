"use strict";

const {
  Client,
  GatewayIntentBits,
  Events,
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;

// OPTIONAL: lock to one channel (recommended)
const COUNTING_CHANNEL_ID = "YOUR_CHANNEL_ID_HERE";

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
  if (message.author.bot) return;

  // only allow one channel (optional safety)
  if (COUNTING_CHANNEL_ID && message.channel.id !== COUNTING_CHANNEL_ID) return;

  const content = message.content.trim();

  // ❌ If not a number → delete
  if (!/^\d+$/.test(content)) {
    return message.delete().catch(() => {});
  }

  const number = parseInt(content);

  const prev = lastNumber.get(message.channel.id) ?? 0;
  const expected = prev + 1;

  // ❌ wrong number → delete
  if (number !== expected) {
    await message.delete().catch(() => {});
    return;
  }

  // ✅ correct number → accept
  lastNumber.set(message.channel.id, number);
});

client.login(TOKEN);
