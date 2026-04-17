"use strict";

const {
  Client,
  GatewayIntentBits,
  Events,
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;

// Counting channel
const COUNTING_CHANNEL_ID = "1494238876829483078";

// State
const lastNumber = new Map();
const lastUser = new Map();

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

  if (message.channel.id !== COUNTING_CHANNEL_ID) return;

  const content = message.content.trim();

  // ❌ Not a number
  if (!/^\d+$/.test(content)) {
    await handleWrong(message);
    return;
  }

  const number = parseInt(content);

  const prevNumber = lastNumber.get(message.channel.id) ?? 0;
  const prevUser = lastUser.get(message.channel.id);

  const expected = prevNumber + 1;

  // ❌ wrong number
  if (number !== expected) {
    await handleWrong(message);
    return;
  }

  // ❌ same user twice in a row
  if (message.author.id === prevUser) {
    await handleWrong(message);
    return;
  }

  // ✅ correct
  lastNumber.set(message.channel.id, number);
  lastUser.set(message.channel.id, message.author.id);

  try {
    await message.react("✅");

    // remove reaction after a few seconds
    setTimeout(() => {
      message.reactions.cache
        .get("✅")
        ?.users.remove(client.user.id)
        .catch(() => {});
    }, 3000);
  } catch (err) {
    console.log("React error:", err);
  }
});

// ❌ WRONG HANDLER
async function handleWrong(message) {
  try {
    await message.react("❌");

    // wait a few seconds before deleting
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 2500);
  } catch (err) {
    console.log("Wrong reaction error:", err);
    message.delete().catch(() => {});
  }
}

client.login(TOKEN);
