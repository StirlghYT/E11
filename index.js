const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  PermissionsBitField
} = require("discord.js");

/* ───────── CLIENTE ───────── */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* ───────── EQUIPOS ───────── */
const equipos = {
  bastard: {
    nombre: "Bastard",
    rol: "1465201094920769629",
    canal: "1465906385039397168"
  },
  barcha: {
    nombre: "Barcha",
    rol: "1465201319835865088",
    canal: "1465906750640095243"
  },
  pxg: {
    nombre: "PXG",
    rol: "1465201252752298163",
    canal: "1465907043880665303"
  },
  manshine: {
    nombre: "Manshine City",
    rol: "1465201143348068394",
    canal: "1465907546585039009"
  },
  ubers: {
    nombre: "Ubers",
    rol: "1465201198599508123",
    canal: "1465906051663794216"
  },
  losers: {
    nombre: "The Losers",
    rol: "1468038621742239835",
    canal: "1468111432645087282"
  },
  paradise: {
    nombre: "Paradise",
    rol: "1469474793484058646",
    canal: "1469472023842656368"
  },
  femboys: {
    nombre: "Femboys",
    rol: "1469475348990132234",
    canal: "1469473431748739082"
  }
};

/* ───────── READY ───────── */
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

/* ───────── COMANDO !panel ───────── */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!panel") return;

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply("❌ Solo administradores pueden usar este comando.");
  }

  const mensajes = await message.channel.messages.fetch({ limit: 20 });
  const existe = mensajes.find(
    m =>
      m.author.id === client.user.id &&
      m.content?.includes("Selecciona el equipo")
  );

  if (existe) {
    return message.reply("⚠️ Ya existe un panel en este canal.");
  }

  const fila1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("solicitar_bastard").setLabel("Bastard").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("solicitar_barcha").setLabel("Barcha").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("solicitar_pxg").setLabel("PXG").setStyle(ButtonStyle.Secondary)
  );

  const fila2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("solicitar_manshine").setLabel("Manshine City").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("solicitar_ubers").setLabel("Ubers").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("solicitar_losers").setLabel("The Losers").setStyle(ButtonStyle.Secondary)
  );

  const fila3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("solicitar_paradise").setLabel("Paradise").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("solicitar_femboys").setLabel("Femboys").setStyle(ButtonStyle.Secondary)
  );

  await message.channel.send({
    content: "⚽ **Selecciona el equipo al que quieres unirte**",
    components: [fila1, fila2, fila3]
  });
});

/* ───────── INTERACCIONES ───────── */
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("solicitar_")) {
    const equipoKey = interaction.customId.replace("solicitar_", "");
    const equipo = equipos[equipoKey];
    if (!equipo) return;

    await interaction.reply({
      content: "✅ Tu solicitud fue enviada correctamente.",
      ephemeral: true
    });

    const canal = await interaction.guild.channels.fetch(equipo.canal);
    if (!canal) return;

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aceptar_${equipoKey}_${interaction.user.id}`)
        .setLabel("✅ Aceptar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`rechazar_${equipoKey}_${interaction.user.id}`)
        .setLabel("❌ Rechazar")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content:
        `📩 **Nueva solicitud**\n` +
        `👤 Usuario: ${interaction.user}\n` +
        `🛡 Equipo: **${equipo.nombre}**`,
      components: [botones]
    });
  }

  if (
    interaction.customId.startsWith("aceptar_") ||
    interaction.customId.startsWith("rechazar_")
  ) {
    const [, equipoKey, userId] = interaction.customId.split("_");
    const equipo = equipos[equipoKey];
    if (!equipo) return;

    const miembro = await interaction.guild.members.fetch(userId);

    if (interaction.customId.startsWith("aceptar_")) {
      if (!miembro.roles.cache.has(equipo.rol)) {
        await miembro.roles.add(equipo.rol);
      }

      await interaction.message.edit({
        content: `✅ ${miembro.user} fue aceptado en **${equipo.nombre}**`,
        components: []
      });
    } else {
      await interaction.message.edit({
        content: "❌ Solicitud rechazada.",
        components: []
      });
    }
  }
});

/* ───────── LOGIN ───────── */
client.login(process.env.TOKEN);
