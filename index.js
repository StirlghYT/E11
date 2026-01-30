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
    capitan: "1465201525197504776",
    canal: "1465906385039397168"
  },
  barcha: {
    nombre: "Barcha",
    rol: "1465201319835865088",
    capitan: "1465202034637537486",
    canal: "1465906750640095243"
  },
  pxg: {
    nombre: "PXG",
    rol: "1465201252752298163",
    capitan: "1465201854920003716",
    canal: "1465907043880665303"
  },
  manshine: {
    nombre: "Manshine City",
    rol: "1465201143348068394",
    capitan: "1465201654444982315",
    canal: "1465907546585039009"
  },
  ubers: {
    nombre: "Ubers",
    rol: "1465201198599508123",
    capitan: "1465201777816244235",
    canal: "1465906051663794216"
  }
};

/* ───────── READY ───────── */
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

/* ───────── COMANDO !panel (SOLO 1) ───────── */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!panel") return;

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply("❌ Solo administradores pueden usar este comando.");
  }

  // 🔒 Limitar a 1 panel por canal
  const mensajes = await message.channel.messages.fetch({ limit: 25 });
  const panelExiste = mensajes.find(
    m =>
      m.author.id === client.user.id &&
      m.content &&
      m.content.includes("Selecciona el equipo")
  );

  if (panelExiste) {
    return message.reply("⚠️ Ya existe un panel en este canal.");
  }

  const fila1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("solicitar_bastard")
      .setLabel("Bastard")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("solicitar_barcha")
      .setLabel("Barcha")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("solicitar_pxg")
      .setLabel("PXG")
      .setStyle(ButtonStyle.Secondary)
  );

  const fila2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("solicitar_manshine")
      .setLabel("Manshine City")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("solicitar_ubers")
      .setLabel("Ubers")
      .setStyle(ButtonStyle.Primary)
  );

  await message.channel.send({
    content: "⚽ **Selecciona el equipo al que quieres unirte**",
    components: [fila1, fila2]
  });
});

/* ───────── BOTONES ───────── */
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  /* ───── SOLICITAR ───── */
  if (interaction.customId.startsWith("solicitar_")) {
    await interaction.deferReply({ ephemeral: true });

    const equipoKey = interaction.customId.replace("solicitar_", "");
    const equipo = equipos[equipoKey];
    if (!equipo) return interaction.editReply("❌ Equipo inválido.");

    const canal = interaction.guild.channels.cache.get(equipo.canal);
    if (!canal) return interaction.editReply("❌ Canal no encontrado.");

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
      content: `📩 **Nueva solicitud**\n👤 Usuario: ${interaction.user}\n🛡 Equipo: **${equipo.nombre}**`,
      components: [botones]
    });

    return interaction.editReply("✅ Solicitud enviada correctamente.");
  }

  /* ───── ACEPTAR / RECHAZAR ───── */
  if (
    interaction.customId.startsWith("aceptar_") ||
    interaction.customId.startsWith("rechazar_")
  ) {
    await interaction.deferUpdate();

    const [, equipoKey, userId] = interaction.customId.split("_");
    const equipo = equipos[equipoKey];
    if (!equipo) return;

    const staff = await interaction.guild.members.fetch(interaction.user.id);
    if (!staff.roles.cache.has(equipo.capitan)) {
      return interaction.followUp({
        content: "❌ Solo el capitán de este equipo puede decidir.",
        ephemeral: true
      });
    }

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
