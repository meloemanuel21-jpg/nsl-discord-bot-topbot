const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  ModalBuilder,
  PermissionFlagsBits,
  REST,
  Routes,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const TOKEN = process.env.DISCORD_TOKEN;
const DATA_DIR = path.join(process.cwd(), "data");
const WARNINGS_FILE = path.join(DATA_DIR, "warnings.json");
const TEMP_BANS_FILE = path.join(DATA_DIR, "temporary-bans.json");
const PARTNERSHIPS_FILE = path.join(DATA_DIR, "partnerships.json");
const DEFAULT_ROBLOX_SERVER = process.env.ROBLOX_SERVER_URL || "https://www.roblox.com/share?code=c223b97ebe1528488c47fd4fbd9db418&type=Server";
const DEFAULT_ROBLOX_NICK = process.env.ROBLOX_NICK || "Emanuelpm56";
const PARTNERSHIP_CHANNEL_ID = "1550666336043274260";
const PARTNERSHIP_PANEL_CHANNEL_ID = "1550823192271134811";
const OFFICIAL_NSL_INVITE = "https://discord.gg/kj5Kvsz3J";

if (!TOKEN) {
  console.error("DISCORD_TOKEN não foi configurado. Adicione-o aos Secrets do Replit.");
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });

function readWarnings() {
  try {
    return JSON.parse(fs.readFileSync(WARNINGS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeWarnings(data) {
  fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));
}

const warnings = readWarnings();
function readTemporaryBans() {
  try {
    return JSON.parse(fs.readFileSync(TEMP_BANS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeTemporaryBans(data) {
  fs.writeFileSync(TEMP_BANS_FILE, JSON.stringify(data, null, 2));
}

const temporaryBans = readTemporaryBans();
function readPartnerships() {
  try {
    return JSON.parse(fs.readFileSync(PARTNERSHIPS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writePartnerships(data) {
  fs.writeFileSync(PARTNERSHIPS_FILE, JSON.stringify(data, null, 2));
}

const partnerships = readPartnerships();
const pendingActions = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const COLORS = {
  blue: 0x1d9bf0,
  green: 0x2ecc71,
  yellow: 0xf1c40f,
  red: 0xe74c3c,
  purple: 0x8e44ad,
  dark: 0x111827,
};

const DURATION_MS = {
  "10m": 10 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "28d": 28 * 24 * 60 * 60 * 1000,
};

const COUNTRY_TEAMS = {
  brasil: { flag: "🇧🇷", teams: ["flamengo", "santos", "palmeiras", "corinthians", "são-paulo", "grêmio", "internacional", "cruzeiro", "vasco", "fluminense", "botafogo", "bahia", "athletico-pr", "fortaleza", "sport", "ceará", "atlético-mg", "bragantino", "coritiba", "vitória"] },
  brazil: { flag: "🇧🇷", teams: ["flamengo", "santos", "palmeiras", "corinthians", "são-paulo", "grêmio", "internacional", "cruzeiro", "vasco", "fluminense", "botafogo", "bahia", "athletico-pr", "fortaleza", "sport", "ceará", "atlético-mg", "bragantino", "coritiba", "vitória"] },
  inglaterra: { flag: "🇬🇧", teams: ["manchester-city", "liverpool", "arsenal", "chelsea", "manchester-united", "tottenham", "newcastle", "aston-villa", "west-ham", "brighton", "everton", "fulham", "crystal-palace", "wolves", "nottingham-forest", "bournemouth", "brentford", "leicester", "leeds", "sunderland"] },
  england: { flag: "🇬🇧", teams: ["manchester-city", "liverpool", "arsenal", "chelsea", "manchester-united", "tottenham", "newcastle", "aston-villa", "west-ham", "brighton", "everton", "fulham", "crystal-palace", "wolves", "nottingham-forest", "bournemouth", "brentford", "leicester", "leeds", "sunderland"] },
  espanha: { flag: "🇪🇸", teams: ["real-madrid", "barcelona", "atlético-de-madrid", "sevilla", "valencia", "villarreal", "real-betis", "athletic-bilbao", "real-sociedad", "girona", "osasuna", "celta", "mallorca", "getafe", "rayo-vallecano", "espanyol", "alavés", "las-palmas", "leganés", "valladolid"] },
  spain: { flag: "🇪🇸", teams: ["real-madrid", "barcelona", "atlético-de-madrid", "sevilla", "valencia", "villarreal", "real-betis", "athletic-bilbao", "real-sociedad", "girona", "osasuna", "celta", "mallorca", "getafe", "rayo-vallecano", "espanyol", "alavés", "las-palmas", "leganés", "valladolid"] },
  italia: { flag: "🇮🇹", teams: ["inter-de-milão", "milan", "juventus", "napoli", "roma", "lazio", "atalanta", "fiorentina", "bologna", "torino", "genoa", "udinese", "monza", "parma", "como", "venezia", "cagliari", "empoli", "verona", "lecce"] },
  itália: { flag: "🇮🇹", teams: ["inter-de-milão", "milan", "juventus", "napoli", "roma", "lazio", "atalanta", "fiorentina", "bologna", "torino", "genoa", "udinese", "monza", "parma", "como", "venezia", "cagliari", "empoli", "verona", "lecce"] },
  alemanha: { flag: "🇩🇪", teams: ["bayern-munique", "borussia-dortmund", "bayer-leverkusen", "rb-leipzig", "eintracht-frankfurt", "wolfsburg", "stuttgart", "borussia-mönchengladbach", "werder-bremen", "freiburg", "mainz", "augsburg", "union-berlin", "hoffenheim", "heidenheim", "bochum", "st-pauli", "holstein-kiel", "hamburgo", "schalke"] },
  frança: { flag: "🇫🇷", teams: ["psg", "marseille", "lyon", "monaco", "lille", "nice", "rennes", "lens", "nantes", "montpellier", "strasbourg", "toulouse", "brest", "reims", "saint-étienne", "auxerre", "angers", "lorient", "metz", "le-havre"] },
  portugal: { flag: "🇵🇹", teams: ["benfica", "porto", "sporting", "braga", "vitória-guimarães", "boavista", "famalicão", "rio-ave", "moreirense", "estoril", "gil-vicente", "nacional", "casa-pia", "arouca", "estrela-amadora", "farense", "santa-clara", "marítimo", "académica", "belenenses"] },
  argentina: { flag: "🇦🇷", teams: ["river-plate", "boca-juniors", "racing", "independiente", "san-lorenzo", "talleres", "estudiantes", "lanús", "rosario-central", "newells", "vélez", "argentinos-juniors", "defensa-y-justicia", "huracán", "belgrano", "godoy-cruz", "unión", "tigre", "platense", "banfield"] },
  méxico: { flag: "🇲🇽", teams: ["américa", "chivas", "cruz-azul", "pumas", "monterrey", "tigres", "toluca", "pachuca", "león", "santos-laguna", "atlas", "necaxa", "puebla", "tijuana", "querétaro", "juárez", "mazatlán", "atlético-san-luis", "queretaro", "veracruz"] },
  mexico: { flag: "🇲🇽", teams: ["américa", "chivas", "cruz-azul", "pumas", "monterrey", "tigres", "toluca", "pachuca", "león", "santos-laguna", "atlas", "necaxa", "puebla", "tijuana", "querétaro", "juárez", "mazatlán", "atlético-san-luis", "queretaro", "veracruz"] },
  holanda: { flag: "🇳🇱", teams: ["ajax", "psv", "feyenoord", "az-alkmaar", "twente", "utrecht", "vitesse", "heerenveen", "groningen", "nec", "sparta-rotterdam", "fortuna-sittard", "go-ahead-eagles", "heracles", "pec-zwolle", "willem-ii", "nac-breda", "rkc-waalwijk", "almere-city", "excelsior"] },
  eua: { flag: "🇺🇸", teams: ["inter-miami", "la-galaxy", "la-fc", "new-york-city", "new-york-red-bulls", "seattle-sounders", "portland-timbers", "atlanta-united", "orlando-city", "columbus-crew", "austin-fc", "fc-dallas", "houston-dynamo", "d-c-united", "chicago-fire", "toronto-fc", "vancouver-whitecaps", "montreal", "cincinnati", "nashville"] },
  estadosunidos: { flag: "🇺🇸", teams: ["inter-miami", "la-galaxy", "la-fc", "new-york-city", "new-york-red-bulls", "seattle-sounders", "portland-timbers", "atlanta-united", "orlando-city", "columbus-crew", "austin-fc", "fc-dallas", "houston-dynamo", "d-c-united", "chicago-fire", "toronto-fc", "vancouver-whitecaps", "montreal", "cincinnati", "nashville"] },
};

const DEFAULT_CATEGORIES = [
  { name: "🏠・INÍCIO", channels: ["📢・anúncios", "📜・regras", "👋・boas-vindas", "📋・informações", "🔗・links", "📅・calendário"] },
  { name: "💬・COMUNIDADE", channels: ["💬・chat", "🎮・chat-tcs", "📸・mídia", "🎥・clipes", "💡・sugestões", "📊・enquetes"] },
  { name: "🏆・CLUBES S1", channels: ["🏆・clubes-s1", "📋・inscrições-s1", "⚽・partidas-s1", "📊・tabela-s1", "🥇・artilharia-s1", "🏅・premiações-s1"] },
  { name: "⚽・PARTIDAS", channels: ["🏟️・partidas", "📋・agendamento", "📝・súmulas", "📊・resultados", "🎥・gravações", "📺・transmissões"] },
  { name: "🏆・COMPETIÇÕES", channels: ["🏆・competições", "📋・inscrições", "📅・calendários", "⚽・jogos", "📊・classificação", "🏅・premiações"] },
  { name: "🤝・AMISTOSOS", channels: ["📋・agendar", "✅・confirmados", "1️⃣・1v1", "2️⃣・2v2", "3️⃣・3v3", "4️⃣・4v4"] },
  { name: "👥・TIMES", channels: ["📝・cadastro", "🏟️・clubes", "📋・elencos", "🌎・países", "🔎・procurar-time", "🔄・transferências"] },
  { name: "👤・JOGADORES", channels: ["📝・cadastro", "🔎・procurar-jogador", "📋・elencos", "⭐・mvp", "🥇・artilheiros", "🧤・goleiros"] },
  { name: "🧑‍⚖️・ARBITRAGEM", channels: ["⚽・reffs", "📋・escalação", "📝・relatórios", "🟨・cartões", "🟥・expulsões", "🎥・var"] },
  { name: "📊・ESTATÍSTICAS", channels: ["📊・estatísticas", "⚽・gols", "🧤・defesas", "🟨・cartões", "🏆・recordes", "📈・rankings"] },
  { name: "🔄・TRANSFERÊNCIAS", channels: ["🔄・transferências", "💰・propostas", "🤝・negociações", "📜・contratos", "📢・mercado", "✅・confirmadas"] },
  { name: "🎫・SUPORTE", channels: ["🎫・tickets", "❓・dúvidas", "🚨・denúncias", "📩・contato", "📨・solicitações", "🆘・ajuda"] },
  { name: "📣・DIVULGAÇÃO", channels: ["📢・divulgação", "📱・tiktok", "▶️・youtube", "📸・instagram", "🎥・vídeos", "🤝・parcerias"] },
  { name: "🎨・MÍDIA", channels: ["📸・fotos", "🎥・vídeos", "🎨・gfx", "🖼️・artes", "📰・notícias", "📺・transmissões"] },
  { name: "🏟️・ESTÁDIOS", channels: ["🏟️・estádios", "🎮・servidores", "🔗・links-servidores", "🗺️・mapas", "🛠️・manutenção", "📋・cadastro"] },
  { name: "📝・PENEIRAS", channels: ["📋・inscrições", "⚽・testes", "✅・aprovados", "❌・reprovados", "📅・agenda", "🔎・resultados"] },
  { name: "🏅・PREMIAÇÕES", channels: ["🥇・campeão", "🥈・vice-campeão", "⚽・artilheiro", "🧤・melhor-gk", "⭐・mvp", "🏆・títulos"] },
  { name: "🚨・DENÚNCIAS", channels: ["🚨・denúncias", "📋・casos", "🔎・análises", "⚖️・decisões", "📢・resultados", "🔒・arquivados"] },
  { name: "🛡️・STAFF", staffOnly: true, channels: ["👑・staff-chat", "📋・staff-comandos", "📝・relatórios", "📚・manual", "📢・avisos", "🔨・logs"] },
  { name: "🔒・DIREÇÃO", staffOnly: true, channels: ["👑・direção", "🛡️・administração", "🔨・moderação", "⚽・arbitragem", "🎫・atendimento", "📋・reuniões"] },
  { name: "📚・ARQUIVO NSL", channels: ["📜・história", "🏆・campeões", "⭐・lendas", "📸・momentos", "📋・documentos", "🗃️・arquivo"] },
];

const ROLE_NAMES = [
  "👑・FUNDADOR", "🏆・CO-FUNDADOR", "💎・DIRETOR SUPREMO", "⚜️・DIRETOR", "🛡️・VICE-DIRETOR", "🏢・PRESIDENTE", "🏅・VICE-PRESIDENTE", "📋・DIRETOR EXECUTIVO", "🛡️・ADMINISTRADOR GERAL", "🛡️・ADMINISTRADOR", "🔨・GERENTE GERAL", "🔨・GERENTE", "⚔️・SUPERVISOR", "🛡️・MODERADOR GERAL", "🔨・MODERADOR", "🛡️・MODERAÇÃO JR", "⚽・DIRETOR DE FUTEBOL", "🏆・DIRETOR DE CAMPEONATOS", "📋・COORDENADOR DE CAMPEONATOS", "⚽・COORDENADOR DE PARTIDAS", "🧑‍⚖️・CHEFE DE ARBITRAGEM", "🧑‍⚖️・SUPERVISOR DE ARBITRAGEM", "🟨・ÁRBITRO OFICIAL", "⚽・REFF", "🎫・CHEFE DE ATENDIMENTO", "🎫・SUPERVISOR DE ATENDIMENTO", "🎫・ATENDENTE", "🧪・AVALIADOR OFICIAL", "🔎・AVALIADOR", "📝・ANALISTA", "📊・ANALISTA DE PARTIDAS", "📊・ANALISTA DE ESTATÍSTICAS", "🎥・DIRETOR DE MÍDIA", "🎨・DESIGNER", "📸・FOTÓGRAFO", "🎥・EDITOR", "📢・DIVULGADOR", "🤝・PARCEIRO OFICIAL", "🏆・CAMPEÃO S1", "🥇・CAMPEÃO", "🥈・VICE-CAMPEÃO", "⭐・MVP", "⚽・ARTILHEIRO", "🧤・MELHOR GOLEIRO", "💎・VIP", "🔥・MEMBRO ATIVO", "⚽・JOGADOR", "🏟️・DONO DE TIME", "👔・CAPITÃO", "🧤・GOLEIRO", "📝・RECRUTA", "🆕・NOVATO", "👤・MEMBRO", "🤖・BOT", "🤝・CONVIDADO", "🚪・RECÉM-CHEGADO", "🏅・MEMBRO VERIFICADO",
];

const ROLE_PRESETS = ROLE_NAMES.map((name) => ({
  name,
  permissions: name === "👑・FUNDADOR" ? [PermissionFlagsBits.Administrator] : [],
  color: name === "👑・FUNDADOR" ? 0xf1c40f : 0x5865f2,
}));

if (ROLE_PRESETS.length !== 57) throw new Error(`A lista NSL precisa ter 57 cargos, mas tem ${ROLE_PRESETS.length}.`);

const ADMIN_COMMANDS = new Set(["criar", "clear", "cargos", "times", "parceria", "parcerias"]);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isLogsBotChannel(channel) {
  return normalize(channel.name).endsWith("logs-bot");
}

function displayDuration(duration) {
  return duration === "permanente" ? "Permanente" : duration;
}

function cleanChannelName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "canal";
}

function getMember(interaction) {
  return interaction.member && interaction.member.guild
    ? interaction.member
    : interaction.guild.members.cache.get(interaction.user.id);
}

function isOwnerOrAdmin(interaction) {
  const member = getMember(interaction);
  return interaction.guild.ownerId === interaction.user.id || member?.permissions.has(PermissionFlagsBits.Administrator) || member?.permissions.has(PermissionFlagsBits.ManageGuild);
}

function hasModerationPermission(interaction, permission) {
  const member = getMember(interaction);
  return interaction.guild.ownerId === interaction.user.id || member?.permissions.has(PermissionFlagsBits.Administrator) || member?.permissions.has(permission);
}

function getSetupPermissionIssues(guild) {
  const member = guild.members.me;
  if (!member) return ["o bot não foi carregado no servidor"];
  const issues = [];
  if (!member.permissions.has(PermissionFlagsBits.ViewChannel)) issues.push("Ver canais");
  if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) issues.push("Gerenciar canais");
  if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) issues.push("Gerenciar cargos");
  return issues;
}

function canActOnMember(interaction, target) {
  const actor = getMember(interaction);
  const me = interaction.guild.members.me;
  if (!target || !actor || !me) return { ok: false, reason: "Não consegui carregar a hierarquia de membros." };
  if (target.id === interaction.user.id) return { ok: false, reason: "Você não pode executar essa ação em si mesmo." };
  if (target.id === interaction.guild.ownerId) return { ok: false, reason: "O dono do servidor não pode ser moderado pelo bot." };
  if (actor.id !== interaction.guild.ownerId && target.roles.highest.position >= actor.roles.highest.position) return { ok: false, reason: "Sua hierarquia precisa estar acima da pessoa alvo." };
  if (!target.manageable || target.roles.highest.position >= me.roles.highest.position) return { ok: false, reason: "O cargo do bot precisa estar acima do cargo da pessoa alvo." };
  return { ok: true };
}

function embed(title, description, color = COLORS.blue) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
}

async function replyError(interaction, message) {
  const payload = { embeds: [embed("⚠️ Não foi possível executar", message, COLORS.red)], ephemeral: true };
  if (interaction.replied || interaction.deferred) return interaction.followUp(payload);
  return interaction.reply(payload);
}

async function sendLog(guild, title, description, color = COLORS.dark) {
  const channel = guild.channels.cache.find((item) => item.type === ChannelType.GuildText && normalize(item.name).includes("logs"));
  if (!channel || !channel.isTextBased()) return;
  await channel.send({ embeds: [embed(title, description, color)] }).catch(() => {});
}

async function setChannelLock(channel, locked) {
  if (!channel.manageable || !channel.permissionOverwrites) return false;
  const everyone = channel.guild.roles.everyone;
  const permissions = {
    SendMessages: locked ? false : null,
    AddReactions: locked ? false : null,
    CreatePublicThreads: locked ? false : null,
    CreatePrivateThreads: locked ? false : null,
    SendMessagesInThreads: locked ? false : null,
  };
  await channel.permissionOverwrites.edit(everyone, permissions, {
    reason: locked ? "NSL - servidor trancado" : "NSL - categoria destrancada",
  });
  return true;
}

function scheduleBanExpiry(guildId, userId, expiresAt) {
  const delay = Math.max(0, expiresAt - Date.now());
  setTimeout(async () => {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;
    await guild.bans.remove(userId, "Banimento temporário expirado").catch(() => {});
    delete temporaryBans[`${guildId}:${userId}`];
    writeTemporaryBans(temporaryBans);
  }, Math.min(delay, 2_147_000_000));
}

async function restoreBanTimers() {
  for (const [key, expiresAt] of Object.entries(temporaryBans)) {
    const [guildId, userId] = key.split(":");
    if (Number(expiresAt) <= Date.now()) {
      const guild = client.guilds.cache.get(guildId);
      await guild?.bans.remove(userId, "Banimento temporário expirado").catch(() => {});
      delete temporaryBans[key];
    } else {
      scheduleBanExpiry(guildId, userId, Number(expiresAt));
    }
  }
  writeTemporaryBans(temporaryBans);
}

function confirmationComponents(actionKey, includeSelect = false) {
  const rows = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm:${actionKey}`).setLabel("Confirmar").setEmoji("🔴").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`cancel:${actionKey}`).setLabel("Cancelar").setEmoji("⚪").setStyle(ButtonStyle.Secondary),
    ),
  ];
  if (includeSelect) {
    rows.unshift(new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`review:${actionKey}`)
        .setPlaceholder("Escolha uma ação rápida")
        .addOptions(
          { label: "Confirmar criação", value: "confirm", emoji: "🔴" },
          { label: "Cancelar criação", value: "cancel", emoji: "⚪" },
        ),
    ));
  }
  return rows;
}

function savePending(key, data) {
  pendingActions.set(key, { ...data, userId: key.split(":").at(-1), expiresAt: Date.now() + 2 * 60 * 1000 });
  setTimeout(() => {
    const action = pendingActions.get(key);
    if (action && action.expiresAt <= Date.now()) pendingActions.delete(key);
  }, 2 * 60 * 1000);
}

function parsePrompt(prompt) {
  const normalized = normalize(prompt);
  const categories = [];
  const channels = [];
  const roles = [];
  let renameTo = null;

  const addCategory = (name, staffOnly = false) => {
    if (!categories.some((item) => normalize(item.name) === normalize(name))) categories.push({ name, staffOnly });
  };
  const addChannel = (name, category) => {
    const channelName = name.startsWith("📢") || name.startsWith("📜") || name.startsWith("⚽") || name.startsWith("🏆") || name.startsWith("🎫") || name.startsWith("🛡️") || name.startsWith("🔨") ? name : `💬・${name}`;
    if (!channels.some((item) => normalize(item.name) === normalize(channelName))) channels.push({ name: channelName, category });
  };

  const categoryMap = [
    ["informacoes", "📢・INFORMAÇÕES"],
    ["partidas", "⚽・PARTIDAS"],
    ["campeonatos", "🏆・CAMPEONATOS"],
    ["amistosos", "🤝・AMISTOSOS"],
    ["times", "👥・TIMES"],
    ["jogadores", "👤・JOGADORES"],
    ["staff", "🛡️・STAFF"],
    ["suporte", "🎫・SUPORTE"],
    ["tickets", "🎫・TICKETS"],
    ["logs", "🔨・LOGS"],
    ["denuncias", "🚨・DENÚNCIAS"],
  ];
  for (const [keyword, name] of categoryMap) {
    if (normalized.includes(keyword)) addCategory(name, keyword === "staff" || keyword === "logs");
  }

  const explicitCategories = prompt.match(/categor(?:ia|ias)\s+(?:de\s+)?["“]?([^"”\n,.]+)["”]?/gi) || [];
  for (const raw of explicitCategories) {
    const name = raw.replace(/categor(?:ia|ias)\s+(?:de\s+)?/i, "").trim();
    if (name && name.length < 80) addCategory(`📁・${name.toUpperCase()}`, normalize(name).includes("staff"));
  }

  const channelCount = Number((normalized.match(/(\d+)\s+canais?/) || [])[1] || 0);
  const teamCount = Number((normalized.match(/(\d+)\s+canais?\s+de\s+times?/) || [])[1] || 0);
  if (normalized.includes("informacoes") || normalized.includes("regras") || normalized.includes("anuncios") || normalized.includes("avisos")) {
    addCategory("📢・INFORMAÇÕES");
    if (normalized.includes("regras")) addChannel("📜・regras", "📢・INFORMAÇÕES");
    if (normalized.includes("anuncios")) addChannel("📢・anúncios", "📢・INFORMAÇÕES");
    if (normalized.includes("avisos")) addChannel("📌・avisos", "📢・INFORMAÇÕES");
  }
  if (normalized.includes("partidas")) addChannel("⚽・partidas", "⚽・PARTIDAS");
  if (normalized.includes("campeonatos")) addChannel("🏆・campeonatos", "🏆・COMPETIÇÕES");
  if (normalized.includes("amistosos")) addChannel("🤝・amistosos", "⚽・PARTIDAS");
  if (normalized.includes("denuncias")) addChannel("🚨・denúncias", "🎫・SUPORTE");
  if (normalized.includes("logs")) addChannel("🔨・logs", "🛡️・STAFF");
  if (normalized.includes("tickets")) addChannel("🎫・tickets", "🎫・SUPORTE");
  if (normalized.includes("jogadores")) addChannel("👤・jogadores", "👥・TIMES");
  if (normalized.includes("staff")) {
    addCategory("🛡️・STAFF", true);
    addChannel("🛡️・staff", "🛡️・STAFF");
  }

  const customChannelMatches = prompt.match(/(?:canais?|canais? chamados?|canais? de)\s+(?:de\s+)?["“]?([^"”\n]+)["”]?/gi) || [];
  for (const raw of customChannelMatches) {
    const value = raw.replace(/^(?:canais?|canais? chamados?|canais? de)\s+(?:de\s+)?/i, "").trim();
    if (value && !/times?|staff|jogadores|informacoes|partidas|campeonatos|amistosos|suporte|tickets|logs|denuncias/i.test(value)) {
      value.split(/\s*,\s*|\s+e\s+/i).slice(0, 20).forEach((item) => addChannel(item.trim(), categories[0]?.name || "📢・INFORMAÇÕES"));
    }
  }
  if (teamCount > 0) {
    addCategory("👥・TIMES");
    for (let index = 1; index <= Math.min(teamCount, 20); index += 1) addChannel(`⚽・time-${index}`, "👥・TIMES");
  } else if (normalized.includes("times")) {
    addChannel("👥・times", "👥・TIMES");
  }
  if (channelCount > 0 && channels.length === 0) {
    addCategory("📁・GERAL");
    for (let index = 1; index <= Math.min(channelCount, 30); index += 1) addChannel(`canal-${index}`, "📁・GERAL");
  }
  if (normalized.includes("dono") || normalized.includes("admin") || normalized.includes("moderador") || normalized.includes("staff") || normalized.includes("cargos")) {
    ROLE_PRESETS.slice(0, normalized.includes("membro") ? ROLE_PRESETS.length : 6).forEach((role) => roles.push(role.name));
  }
  const customRoleMatches = prompt.match(/cargos?\s+(?:chamados?\s+)?["“]?([^"”\n,.]+)["”]?/gi) || [];
  for (const raw of customRoleMatches) {
    const value = raw.replace(/cargos?\s+(?:chamados?\s+)?/i, "").trim();
    if (value && !/de dono ate membro|administracao da liga/i.test(value)) roles.push(`👤 ${value}`);
  }
  if (normalized.includes("nome do servidor") || normalized.includes("mude o nome") || normalized.includes("chamado")) {
    const match = prompt.match(/(?:nome do servidor|mude o nome(?: do servidor)?|chamado)\s+(?:para\s+|de\s+)?["“]?([^"”.,\n]+)["”]?/i);
    if (match?.[1] && match[1].trim().length <= 100) renameTo = match[1].trim();
  }
  if (categories.length === 0 && channels.length === 0 && roles.length === 0 && !renameTo) {
    addCategory("📁・NSL");
    addChannel("💬・geral", "📁・NSL");
  }
  return { prompt, categories, channels, roles: [...new Set(roles)], renameTo };
}

function previewPlan(plan) {
  const categoryText = plan.categories.length ? plan.categories.map((item) => `• ${item.name}${item.staffOnly ? " 🔒" : ""}`).join("\n") : "• Nenhuma categoria nova";
  const channelText = plan.channels.length ? plan.channels.slice(0, 25).map((item) => `• ${item.name} → ${item.category}`).join("\n") : "• Nenhum canal novo";
  const roleText = plan.roles.length ? plan.roles.map((item) => `• ${item}`).join("\n") : "• Nenhum cargo novo";
  return [
    `**📝 Pedido recebido**\n> ${plan.prompt.slice(0, 900)}`,
    `**📁 Categorias (${plan.categories.length})**\n${categoryText}`,
    `**💬 Canais (${plan.channels.length})**\n${channelText}${plan.channels.length > 25 ? "\n• … e mais" : ""}`,
    `**👑 Cargos (${plan.roles.length})**\n${roleText}`,
    `**🔐 Permissões**\n• Área de staff marcada como privada quando solicitada`,
    plan.renameTo ? `**✏️ Nome do servidor**\n• ${plan.renameTo}` : "",
  ].filter(Boolean).join("\n\n");
}

async function ensureRole(guild, preset) {
  const existing = guild.roles.cache.find((role) => normalize(role.name) === normalize(preset.name));
  const role = existing || await guild.roles.create({
    name: preset.name,
    color: preset.color,
    hoist: true,
    mentionable: true,
    permissions: preset.permissions,
    reason: "NSL - criação dos 57 cargos oficiais",
  });
  if (role.editable) {
    await role.setHoist(true, "NSL - exibir membros separadamente").catch(() => {});
    await role.setMentionable(true, "NSL - cargo oficial NSL").catch(() => {});
    await role.setPermissions(preset.permissions, "NSL - segurança dos cargos").catch(() => {});
  }
  return role;
}

async function ensureCategory(guild, name, staffOnly = false) {
  const existing = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && normalize(channel.name) === normalize(name));
  if (existing) return existing;
  const staffRoleNames = new Set(ROLE_NAMES.slice(0, 37).map((roleName) => normalize(roleName)));
  const staffRoles = guild.roles.cache.filter((role) => staffRoleNames.has(normalize(role.name)));
  const overwrites = staffOnly ? [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    ...staffRoles.map((role) => ({ id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
  ] : [];
  return guild.channels.create({ name, type: ChannelType.GuildCategory, permissionOverwrites: overwrites, reason: "Configuração NSL" });
}

async function applyStaffCategoryPermissions(guild, category) {
  if (!category?.manageable || !category.permissionOverwrites) return;
  const staffRoleNames = new Set(ROLE_NAMES.slice(0, 37).map((roleName) => normalize(roleName)));
  const staffRoles = guild.roles.cache.filter((role) => staffRoleNames.has(normalize(role.name)));
  await category.permissionOverwrites.edit(guild.roles.everyone, {
    ViewChannel: false,
  }, { reason: "NSL - proteger categoria de staff" }).catch(() => {});
  for (const role of staffRoles.values()) {
    await category.permissionOverwrites.edit(role, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    }, { reason: "NSL - liberar categoria para staff" }).catch(() => {});
  }
}

async function ensureTextChannel(guild, name, parent) {
  const existing = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && normalize(channel.name) === normalize(name) && (!parent || channel.parentId === parent.id));
  if (existing) return existing;
  return guild.channels.create({ name, type: ChannelType.GuildText, parent: parent?.id, reason: "Configuração NSL" });
}

async function deleteDeletableRoles(guild) {
  const botMember = guild.members.me || await guild.members.fetchMe();
  let deleted = 0;
  let skipped = 0;
  const roles = guild.roles.cache.filter((role) => role.id !== guild.id && !role.managed);
  for (const role of roles.values()) {
    if (!role.editable || role.position >= botMember.roles.highest.position) {
      skipped += 1;
      continue;
    }
    await role.delete("NSL - limpeza de cargos confirmada").then(() => { deleted += 1; }).catch(() => { skipped += 1; });
  }
  return { deleted, skipped };
}

async function createRoles(guild, deleteExisting = false) {
  const result = deleteExisting ? await deleteDeletableRoles(guild) : { deleted: 0, skipped: 0 };
  const roles = [];
  for (const preset of ROLE_PRESETS) {
    roles.push(await ensureRole(guild, preset));
  }
  const botMember = guild.members.me || await guild.members.fetchMe();
  const botPosition = botMember.roles.highest.position;
  for (let index = roles.length - 1; index >= 0; index -= 1) {
    const role = roles[index];
    if (role.id === guild.id || role.managed || role.position >= botPosition) continue;
    await role.setPosition(Math.max(1, botPosition - 1 - index), "NSL - organização da hierarquia").catch(() => {});
  }
  return { ...result, roles };
}

async function executePlan(guild, plan, executor) {
  if (plan.renameTo && guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await guild.setName(plan.renameTo, "Solicitado por /criarserver").catch(() => {});
  }
  if (plan.roles.length) {
    await createRoles(guild);
    for (const requestedRole of plan.roles) {
      if (!ROLE_PRESETS.some((preset) => normalize(preset.name) === normalize(requestedRole))) {
        await ensureRole(guild, { name: requestedRole, permissions: [], color: 0x5865f2 });
      }
    }
  }
  const categoryMap = new Map();
  for (const category of plan.categories) categoryMap.set(category.name, await ensureCategory(guild, category.name, category.staffOnly));
  for (const channel of plan.channels) {
    const parent = categoryMap.get(channel.category) || await ensureCategory(guild, channel.category || "📁・NSL");
    await ensureTextChannel(guild, channel.name, parent);
  }
  await sendLog(guild, "🏗️ Estrutura criada", `**Responsável:** ${executor}\n**Categorias:** ${plan.categories.length}\n**Canais:** ${plan.channels.length}\n**Cargos:** ${plan.roles.length}\n**Pedido:** ${plan.prompt.slice(0, 600)}`, COLORS.green);
}

async function setupServer(guild, executor, deleteExisting = false, onProgress = async () => {}) {
  const categoryMap = new Map();
  for (const [index, definition] of DEFAULT_CATEGORIES.entries()) {
    categoryMap.set(definition.name, await ensureCategory(guild, definition.name, definition.staffOnly));
    for (const channelName of definition.channels) await ensureTextChannel(guild, channelName, categoryMap.get(definition.name));
    if ((index + 1) % 5 === 0 || index === DEFAULT_CATEGORIES.length - 1) {
      await onProgress(`✅ Categorias e canais: ${index + 1}/${DEFAULT_CATEGORIES.length} categorias concluídas...\n\nAgora verificando os 57 cargos oficiais.`);
    }
  }
  const roleResult = await createRoles(guild, deleteExisting);
  await onProgress(`✅ Categorias e canais criados/verificados.\n✅ Cargos verificados (${roleResult.roles.length}/57).\n\nAplicando a privacidade de Staff e Direção...`);
  for (const definition of DEFAULT_CATEGORIES.filter((item) => item.staffOnly)) {
    await applyStaffCategoryPermissions(guild, categoryMap.get(definition.name));
  }
  await sendLog(guild, "🏗️ NSL configurada", `A estrutura fixa foi verificada/criada por ${executor}.\n**Categorias:** ${DEFAULT_CATEGORIES.length}\n**Canais:** ${DEFAULT_CATEGORIES.reduce((total, item) => total + item.channels.length, 0)}\n**Cargos:** ${roleResult.roles.length}`, COLORS.green);
  return roleResult;
}

function partnershipStaffRoles(guild) {
  const allowedNames = new Set(ROLE_NAMES.slice(0, 37).map((roleName) => normalize(roleName)));
  return guild.roles.cache.filter((role) => allowedNames.has(normalize(role.name)) || normalize(role.name).includes("parceir"));
}

function isPartnershipStaff(interaction) {
  const member = getMember(interaction);
  return interaction.guild.ownerId === interaction.user.id
    || member?.permissions.has(PermissionFlagsBits.Administrator)
    || partnershipStaffRoles(interaction.guild).some((role) => member?.roles.cache.has(role.id));
}

function partnershipApplicationForTicket(channelId) {
  return Object.values(partnerships).find((application) => application.ticketId === channelId && application.status !== "closed");
}

function openPartnershipForUser(guildId, userId) {
  return Object.values(partnerships).find((application) => application.guildId === guildId
    && application.userId === userId
    && application.status !== "closed");
}

function extractInvite(value) {
  const match = String(value || "").match(/(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/([A-Za-z0-9-]+)/i);
  if (!match) return null;
  return {
    code: match[1],
    url: `https://discord.gg/${match[1]}`,
  };
}

function confidenceLabel(level) {
  return {
    alta: "🟢 ALTA CONFIANÇA",
    media: "🟡 CONFIANÇA MÉDIA",
    baixa: "🔴 BAIXA CONFIANÇA",
    nao_verificado: "⚪ NÃO VERIFICADO",
  }[level] || "⚪ NÃO VERIFICADO";
}

function displayVerified(value) {
  return value === null || value === undefined || value === ""
    ? "⚠️ Não foi possível verificar automaticamente."
    : String(value);
}

async function analyzePartnershipInvite(invite) {
  if (invite.code.toLowerCase() === "kj5kvsz3j") {
    return { official: true, reason: "Este convite pertence ao servidor oficial da NSL." };
  }
  try {
    const response = await client.rest.get(Routes.invite(invite.code), {
      query: new URLSearchParams({ with_counts: "true", with_expiration: "true" }),
    });
    const server = response.guild || {};
    const serverName = typeof server.name === "string" ? server.name : null;
    const serverId = typeof server.id === "string" ? server.id : null;
    const memberCount = Number.isFinite(response.approximate_member_count) ? response.approximate_member_count : null;
    const onlineCount = Number.isFinite(response.approximate_presence_count) ? response.approximate_presence_count : null;
    const level = serverName && serverId && memberCount !== null && onlineCount !== null
      ? "alta"
      : serverName && serverId
        ? "media"
        : serverName || serverId || memberCount !== null || onlineCount !== null
          ? "baixa"
          : "nao_verificado";
    return {
      official: false,
      serverName,
      serverId,
      memberCount,
      onlineCount,
      confidence: level,
      expiresAt: response.expires_at || null,
    };
  } catch (error) {
    return {
      official: false,
      confidence: "nao_verificado",
      errorCode: error?.code || error?.status || null,
    };
  }
}

function partnershipAnalysisEmbed(application) {
  return embed("🔎・ANÁLISE DO SERVIDOR", [
    `🏠 **Servidor:** ${displayVerified(application.serverName)}`,
    `👥 **Membros:** ${displayVerified(application.memberCount)}`,
    `🟢 **Online:** ${displayVerified(application.onlineCount)}`,
    `🔗 **Convite:** ${displayVerified(application.inviteUrl)}`,
    `🆔 **ID:** ${displayVerified(application.serverId)}`,
    `📊 **Verificação:** ${confidenceLabel(application.confidence)}`,
  ].join("\n"), COLORS.blue);
}

function partnershipSummaryEmbed(application) {
  return embed("🤝・SOLICITAÇÃO COMPLETA", [
    `👤 **Solicitante:** <@${application.userId}>`,
    `🏠 **Servidor:** ${displayVerified(application.serverName)}`,
    `👥 **Membros:** ${displayVerified(application.memberCount)}`,
    `🟢 **Online:** ${displayVerified(application.onlineCount)}`,
    `🔗 **Convite:** ${displayVerified(application.inviteUrl)}`,
    `📊 **Confiança:** ${confidenceLabel(application.confidence)}`,
    `📸 **Prints:** ${application.screenshots?.length ? "Recebidos" : "Não recebidos"}`,
    `📝 **Texto:** ${application.promotionText ? "Recebido" : "Não recebido"}`,
    "",
    "🟡 **Status:** AGUARDANDO ANÁLISE",
  ].join("\n"), COLORS.yellow);
}

function partnershipPanelComponents() {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("partnership:open").setLabel("ABRIR TICKET").setEmoji("🤝").setStyle(ButtonStyle.Primary),
  )];
}

function partnershipPanelEmbed() {
  return embed("🤝 PARCERIA OFICIAL — NSL", [
    "🇧🇷 **PORTUGUÊS**",
    "",
    "🤝 **PARCERIA OFICIAL — NSL**",
    "꧁🏆 NEXUS SOCCER LEAGUE ꧂",
    "",
    "🚀 A NSL está aberta para novas parcerias com ligas, comunidades e projetos de TCS!",
    "",
    "🤝 Nosso objetivo é unir comunidades, fortalecer projetos e criar uma rede de parceria dentro do cenário do TCS.",
    "",
    "📌 **O que oferecemos:**",
    "📢 Divulgação mútua",
    "⚽ Divulgação de campeonatos",
    "🎥 Divulgação de conteúdos",
    "🤝 Apoio entre comunidades",
    "🚀 Crescimento conjunto",
    "",
    "🏆 **TORNE-SE UM PARCEIRO OFICIAL DA NSL!**",
    "",
    "📩 Interessado? Entre em contato com nossa equipe através do ticket de parceria.",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "🇺🇸 **ENGLISH**",
    "",
    "🤝 **OFFICIAL PARTNERSHIP — NSL**",
    "꧁🏆 NEXUS SOCCER LEAGUE ꧂",
    "",
    "🚀 NSL is open to new partnerships with TCS leagues, communities, and projects!",
    "",
    "🤝 Our goal is to connect communities, strengthen projects, and build a partnership network within the TCS scene.",
    "",
    "📌 **What we offer:**",
    "📢 Mutual promotion",
    "⚽ Tournament promotion",
    "🎥 Content promotion",
    "🤝 Community support",
    "🚀 Joint growth",
    "",
    "🏆 **BECOME AN OFFICIAL NSL PARTNER!**",
    "",
    "📩 Interested? Contact our team through the partnership ticket.",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "🇪🇸 **ESPAÑOL**",
    "",
    "🤝 **ALIANZA OFICIAL — NSL**",
    "꧁🏆 NEXUS SOCCER LEAGUE ꧂",
    "",
    "🚀 ¡La NSL está abierta a nuevas alianzas con ligas, comunidades y proyectos de TCS!",
    "",
    "🤝 Nuestro objetivo es unir comunidades, fortalecer proyectos y crear una red de alianzas dentro de la comunidad de TCS.",
    "",
    "📌 **Lo que ofrecemos:**",
    "📢 Promoción mutua",
    "⚽ Promoción de campeonatos",
    "🎥 Promoción de contenido",
    "🤝 Apoyo entre comunidades",
    "🚀 Crecimiento conjunto",
    "",
    "🏆 **¡CONVIÉRTETE EN SOCIO OFICIAL DE NSL!**",
    "",
    "📩 ¿Estás interesado? Contacta con nuestro equipo mediante el ticket de alianzas.",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "⚡ **NSL • NEXUS SOCCER LEAGUE**",
    "🤝 Unindo comunidades. Fortalecendo o TCS.",
    `🔗 **Servidor oficial da NSL:** ${OFFICIAL_NSL_INVITE}`,
    "<#1550818145088962700>",
  ].join("\n"), COLORS.blue);
}

async function sendPartnershipPanel(guild) {
  const channel = guild.channels.cache.get(PARTNERSHIP_PANEL_CHANNEL_ID)
    || await guild.channels.fetch(PARTNERSHIP_PANEL_CHANNEL_ID).catch(() => null);
  if (!channel?.isTextBased()) return { channel: null, message: null, pinned: false };
  const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  let message = messages?.find((item) => item.author.id === client.user.id && item.embeds.some((itemEmbed) => ["🤝・PARCERIA OFICIAL NSL", "🤝 PARCERIA OFICIAL — NSL"].includes(itemEmbed.title)));
  let created = false;
  if (!message) {
    message = await channel.send({
      embeds: [partnershipPanelEmbed()],
      components: partnershipPanelComponents(),
    });
    created = true;
  } else {
    await message.edit({
      embeds: [partnershipPanelEmbed()],
      components: partnershipPanelComponents(),
    });
  }
  let pinned = message.pinned;
  if (!pinned) pinned = await message.pin("NSL - painel permanente de parcerias").then(() => true).catch(() => false);
  return { channel, message, pinned, created };
}

function partnershipCloseComponents(applicationId) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`partnership:close:${applicationId}`).setLabel("FECHAR TICKET").setEmoji("🔒").setStyle(ButtonStyle.Secondary),
  )];
}

function partnershipStaffComponents(applicationId) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`partnership:approve:${applicationId}`).setLabel("APROVAR").setEmoji("🟢").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`partnership:reject:${applicationId}`).setLabel("RECUSAR").setEmoji("🔴").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`partnership:info:${applicationId}`).setLabel("PEDIR INFORMAÇÕES").setEmoji("📝").setStyle(ButtonStyle.Secondary),
    ),
    ...partnershipCloseComponents(applicationId),
  ];
}

function partnershipScreenshotComponents(applicationId) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`partnership:finish_screenshots:${applicationId}`).setLabel("CONTINUAR PARA O TEXTO").setEmoji("✅").setStyle(ButtonStyle.Success),
    ),
    ...partnershipCloseComponents(applicationId),
  ];
}

function partnershipCloseConfirmationComponents(applicationId) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`partnership:close_confirm:${applicationId}`).setLabel("CONFIRMAR").setEmoji("🟢").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`partnership:close_cancel:${applicationId}`).setLabel("CANCELAR").setEmoji("⚪").setStyle(ButtonStyle.Secondary),
  )];
}

async function partnershipLog(guild, application, action, staff = null) {
  await sendLog(guild, "🤝 Log de parceria", [
    `📋 **Ação:** ${action}`,
    `👤 **Usuário:** <@${application.userId}>`,
    `🏠 **Servidor:** ${displayVerified(application.serverName)}`,
    `📅 **Data:** ${new Date().toLocaleDateString("pt-BR")}`,
    `🕐 **Horário:** ${new Date().toLocaleTimeString("pt-BR")}`,
    `👮 **Staff:** ${staff || "Automático"}`,
  ].join("\n"), COLORS.dark);
}

async function getPartnershipCategory(guild) {
  const existing = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && normalize(channel.name) === normalize("🤝・PARCERIAS"));
  if (existing) return existing;
  const staffRoles = partnershipStaffRoles(guild);
  return guild.channels.create({
    name: "🤝・PARCERIAS",
    type: ChannelType.GuildCategory,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      ...staffRoles.map((role) => ({ id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
    ],
    reason: "NSL - categoria de tickets de parceria",
  });
}

async function createPartnershipTicket(interaction) {
  const existing = openPartnershipForUser(interaction.guild.id, interaction.user.id);
  if (existing) {
    const ticket = interaction.guild.channels.cache.get(existing.ticketId);
    if (ticket) return { existing: ticket };
    existing.status = "closed";
    existing.closedAt = new Date().toISOString();
    writePartnerships(partnerships);
  }
  const category = await getPartnershipCategory(interaction.guild);
  const safeName = cleanChannelName(interaction.user.username).slice(0, 70) || "usuario";
  const applicationId = `${interaction.guild.id}-${interaction.user.id}-${Date.now()}`;
  const staffRoles = partnershipStaffRoles(interaction.guild);
  const overwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
    { id: interaction.guild.ownerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ...staffRoles.map((role) => ({ id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
  ];
  if (interaction.guild.members.me) {
    overwrites.push({ id: interaction.guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages] });
  }
  const channel = await interaction.guild.channels.create({
    name: `🤝・parceria-${safeName}`,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: overwrites,
    reason: "NSL - ticket de parceria criado",
  });
  const application = {
    id: applicationId,
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    ticketId: channel.id,
    status: "open",
    stage: "invite",
    screenshots: [],
    createdAt: new Date().toISOString(),
  };
  partnerships[applicationId] = application;
  writePartnerships(partnerships);
  await channel.send({
    content: `<@${interaction.user.id}>`,
    embeds: [embed("🤝・SOLICITAÇÃO DE PARCERIA", "Olá! 👋\n\nVamos começar sua solicitação de parceria com a NSL.\n\nPrimeiro, envie o:\n\n🔗 **LINK DE CONVITE DO SEU SERVIDOR**", COLORS.blue)],
    components: partnershipCloseComponents(applicationId),
  });
  await partnershipLog(interaction.guild, application, "🎫 Ticket criado", interaction.user);
  return { channel, application };
}

async function approvePartnership(guild, application, staff = "Automático") {
  if (application.status === "approved") return true;
  const channel = guild.channels.cache.get(PARTNERSHIP_CHANNEL_ID)
    || await guild.channels.fetch(PARTNERSHIP_CHANNEL_ID).catch(() => null);
  if (!channel?.isTextBased()) return false;
  await channel.send({
    embeds: [embed("🤝・NOVA PARCERIA APROVADA PELA NSL", [
      "꧁🏆 NEXUS SOCCER LEAGUE ꧂",
      "",
      "🎉 É com prazer que anunciamos uma nova parceria oficial!",
      "",
      `🏠 **SERVIDOR:**\n${displayVerified(application.serverName)}`,
      "",
      `📝 **SOBRE O SERVIDOR:**\n${application.promotionText}`,
      "",
      `🔗 **ENTRE NO SERVIDOR:**\n${application.inviteUrl}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "🤝 **PARCEIRO OFICIAL NSL**",
      "",
      "⚡ Nexus Soccer League",
    ].join("\n"), COLORS.green)],
  });
  application.status = "approved";
  application.approvedAt = new Date().toISOString();
  application.approvedBy = staff;
  writePartnerships(partnerships);
  await partnershipLog(guild, application, "🟢 Parceria aprovada", staff);
  const ticket = guild.channels.cache.get(application.ticketId);
  await ticket?.send({ embeds: [embed("🟢・PARCERIA APROVADA", "🎉 Sua parceria foi aprovada!\n\nA Nexus Soccer League agradece pelo interesse em nossa comunidade. 🤝\n\nSeu servidor será divulgado no canal oficial de parcerias.", COLORS.green)], components: partnershipCloseComponents(application.id) }).catch(() => {});
  return true;
}

async function handlePartnershipMessage(message) {
  if (!message.guild || message.author.bot) return;
  const application = partnershipApplicationForTicket(message.channel.id);
  if (!application || message.author.id !== application.userId) return;
  if (application.stage === "invite") {
    const invite = extractInvite(message.content);
    if (!invite) {
      await message.reply({ embeds: [embed("⚠️ CONVITE INVÁLIDO", "Envie um convite válido do Discord, como `https://discord.gg/exemplo`.", COLORS.red)] }).catch(() => {});
      return;
    }
    const analysis = await analyzePartnershipInvite(invite);
    if (analysis.official) {
      await message.reply({ embeds: [embed("⚠️・SERVIDOR OFICIAL", "Este convite pertence à própria NSL e não pode ser cadastrado como parceria externa.", COLORS.red)] }).catch(() => {});
      return;
    }
    Object.assign(application, analysis, { inviteUrl: invite.url, stage: "screenshots", status: "open" });
    writePartnerships(partnerships);
    await partnershipLog(message.guild, application, "🔗 Convite recebido e análise realizada", message.author);
    await message.reply({
      embeds: [
        partnershipAnalysisEmbed(application),
        embed("📸・ENVIE OS PRINTS", "Envie prints mostrando seu servidor.\n\nOs prints podem mostrar organização dos canais, quantidade de membros, categorias, área principal, sistemas e comunidade.\n\nVocê pode enviar várias imagens. Quando terminar, clique no botão abaixo.", COLORS.blue),
      ],
      components: partnershipScreenshotComponents(application.id),
    }).catch(() => {});
    return;
  }
  if (application.stage === "screenshots") {
    const images = [...message.attachments.values()].filter((attachment) => attachment.contentType?.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(attachment.name || ""));
    if (!images.length) {
      await message.reply({ embeds: [embed("📸 ENVIE IMAGENS", "Envie pelo menos um print como imagem. Depois clique em **CONTINUAR PARA O TEXTO**.", COLORS.yellow)] }).catch(() => {});
      return;
    }
    application.screenshots.push(...images.map((attachment) => ({ name: attachment.name || "print", url: attachment.url, size: attachment.size || null })));
    writePartnerships(partnerships);
    await partnershipLog(message.guild, application, "📸 Prints recebidos", message.author);
    await message.reply({ embeds: [embed("✅ PRINTS RECEBIDOS", `${images.length} imagem(ns) foram guardadas. Envie mais se quiser ou clique em **CONTINUAR PARA O TEXTO**.`, COLORS.green)], components: partnershipScreenshotComponents(application.id) }).catch(() => {});
    return;
  }
  if (application.stage === "text") {
    const text = message.content.trim();
    if (!text) {
      await message.reply({ embeds: [embed("📝 ENVIE O TEXTO", "Envie o texto que você deseja que a NSL publique.", COLORS.yellow)] }).catch(() => {});
      return;
    }
    application.promotionText = text;
    application.stage = "complete";
    application.status = "awaiting_staff";
    writePartnerships(partnerships);
    await partnershipLog(message.guild, application, "📝 Texto recebido", message.author);
    await message.channel.send({ embeds: [partnershipSummaryEmbed(application)] });
    if (application.confidence === "alta" && application.screenshots.length > 0) {
      const approved = await approvePartnership(message.guild, application);
      if (!approved) {
        await message.channel.send({ embeds: [embed("🟡・ANÁLISE DA STAFF", "Esta parceria precisa ser analisada manualmente pela equipe NSL.", COLORS.yellow)], components: partnershipStaffComponents(application.id) }).catch(() => {});
      }
    } else {
      await message.channel.send({ embeds: [embed("🟡・ANÁLISE DA STAFF", "Esta parceria precisa ser analisada manualmente pela equipe NSL.", COLORS.yellow)], components: partnershipStaffComponents(application.id) }).catch(() => {});
    }
    return;
  }
  if (application.stage === "complete" && application.status === "info_requested") {
    application.additionalInfo = `${application.additionalInfo || ""}\n${message.content.trim()}`.trim();
    application.status = "awaiting_staff";
    writePartnerships(partnerships);
    await partnershipLog(message.guild, application, "📋 Informações adicionais recebidas", message.author);
    await message.channel.send({ embeds: [partnershipSummaryEmbed(application)], components: partnershipStaffComponents(application.id) }).catch(() => {});
  }
}

async function handlePartnershipButton(interaction) {
  const [scope, action, applicationId] = interaction.customId.split(":");
  if (scope !== "partnership") return false;
  if (action === "open") {
    await interaction.deferReply({ ephemeral: true });
    const result = await createPartnershipTicket(interaction);
    if (result.existing) return interaction.editReply({ embeds: [embed("⚠️ SOLICITAÇÃO JÁ ABERTA", `Você já possui uma solicitação de parceria aberta.\n\n🎫 Ticket: ${result.existing}`, COLORS.yellow)] });
    return interaction.editReply({ embeds: [embed("✅ TICKET CRIADO", `Seu ticket foi criado: ${result.channel}\n\nEnvie o convite do seu servidor lá.`, COLORS.green)] });
  }
  const application = partnerships[applicationId];
  if (!application || application.guildId !== interaction.guild.id) {
    return interaction.reply({ embeds: [embed("⚠️ Solicitação não encontrada", "Esta solicitação não está mais disponível.", COLORS.red)], ephemeral: true });
  }
  if (action === "finish_screenshots") {
    if (interaction.user.id !== application.userId) return replyError(interaction, "Somente a pessoa que abriu o ticket pode continuar esta etapa.");
    if (!application.screenshots?.length) return replyError(interaction, "Envie pelo menos um print antes de continuar.");
    application.stage = "text";
    writePartnerships(partnerships);
    await partnershipLog(interaction.guild, application, "📸 Prints finalizados", interaction.user);
    await interaction.update({ embeds: [embed("📝・TEXTO DO SERVIDOR", "Envie o texto que você deseja que a NSL publique.", COLORS.blue)], components: partnershipCloseComponents(application.id) });
    return true;
  }
  if (action === "close") {
    if (interaction.user.id !== application.userId && !isPartnershipStaff(interaction)) return replyError(interaction, "Somente o solicitante ou a equipe autorizada pode fechar este ticket.");
    await interaction.reply({ embeds: [embed("⚠️ FECHAR TICKET", "Deseja realmente fechar este ticket?", COLORS.yellow)], components: partnershipCloseConfirmationComponents(application.id), ephemeral: true });
    return true;
  }
  if (action === "close_cancel") {
    await interaction.update({ embeds: [embed("⚪ FECHAMENTO CANCELADO", "O ticket continua aberto.", COLORS.yellow)], components: [] });
    return true;
  }
  if (action === "close_confirm") {
    if (interaction.user.id !== application.userId && !isPartnershipStaff(interaction)) return replyError(interaction, "Somente o solicitante ou a equipe autorizada pode fechar este ticket.");
    await interaction.deferUpdate();
    application.status = "closed";
    application.closedAt = new Date().toISOString();
    writePartnerships(partnerships);
    await partnershipLog(interaction.guild, application, "🔒 Ticket fechado", interaction.user);
    const ticket = interaction.guild.channels.cache.get(application.ticketId);
    await ticket?.send({ embeds: [embed("🔒 TICKET FECHADO", "Este ticket será excluído após o salvamento das informações.", COLORS.dark)] }).catch(() => {});
    setTimeout(() => ticket?.delete("NSL - ticket de parceria fechado").catch(() => {}), 3000);
    return true;
  }
  if (!isPartnershipStaff(interaction)) return replyError(interaction, "Somente cargos autorizados da NSL podem usar estes botões.");
  if (action === "approve") {
    await interaction.deferReply({ ephemeral: true });
    const approved = await approvePartnership(interaction.guild, application, interaction.user);
    return interaction.editReply({ embeds: [embed(approved ? "✅ PARCERIA APROVADA" : "⚠️ PUBLICAÇÃO NÃO REALIZADA", approved ? "A parceria foi aprovada e publicada no canal oficial." : "Não foi possível publicar no canal oficial. Verifique as permissões do bot e o ID do canal.", approved ? COLORS.green : COLORS.red)] });
  }
  if (action === "reject") {
    await interaction.showModal(new ModalBuilder().setCustomId(`partnership:reject:${application.id}`).setTitle("Recusar parceria").addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("reason").setLabel("Motivo da recusa").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000))));
    return true;
  }
  if (action === "info") {
    await interaction.showModal(new ModalBuilder().setCustomId(`partnership:info:${application.id}`).setTitle("Pedir informações").addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("request").setLabel("O que precisa ser enviado?").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000))));
    return true;
  }
  return false;
}

async function handlePartnershipModal(interaction) {
  const [, action, applicationId] = interaction.customId.split(":");
  const application = partnerships[applicationId];
  if (!application || application.guildId !== interaction.guild.id || !isPartnershipStaff(interaction)) {
    return replyError(interaction, "Somente cargos autorizados podem processar esta solicitação.");
  }
  if (action === "reject") {
    const reason = interaction.fields.getTextInputValue("reason").trim();
    application.status = "rejected";
    application.rejectedAt = new Date().toISOString();
    application.rejectedBy = interaction.user.tag;
    application.rejectionReason = reason;
    writePartnerships(partnerships);
    const ticket = interaction.guild.channels.cache.get(application.ticketId);
    await ticket?.send({ embeds: [embed("❌・PARCERIA RECUSADA", `Sua solicitação de parceria não foi aprovada.\n\n📋 **Motivo:**\n${reason}`, COLORS.red)], components: partnershipCloseComponents(application.id) }).catch(() => {});
    await partnershipLog(interaction.guild, application, "🔴 Parceria recusada", interaction.user);
    return interaction.reply({ embeds: [embed("✅ RECUSA REGISTRADA", "O motivo foi enviado ao ticket do solicitante.", COLORS.green)], ephemeral: true });
  }
  if (action === "info") {
    const request = interaction.fields.getTextInputValue("request").trim();
    application.status = "info_requested";
    application.infoRequest = request;
    writePartnerships(partnerships);
    const ticket = interaction.guild.channels.cache.get(application.ticketId);
    await ticket?.send({ embeds: [embed("📝・INFORMAÇÕES SOLICITADAS", `A equipe NSL precisa das seguintes informações:\n\n${request}`, COLORS.yellow)], components: partnershipCloseComponents(application.id) }).catch(() => {});
    await partnershipLog(interaction.guild, application, "📝 Informações solicitadas", interaction.user);
    return interaction.reply({ embeds: [embed("✅ SOLICITAÇÃO ENVIADA", "O pedido de informações foi enviado ao ticket.", COLORS.green)], ephemeral: true });
  }
  return replyError(interaction, "Ação de parceria desconhecida.");
}

function reportFromText(raw) {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const goals = [];
  const substitutions = [];
  const cards = [];
  const occurrences = [];
  let home = null;
  let away = null;
  let score = null;
  for (const line of lines) {
    const normalized = normalize(line);
    if (/substitu/.test(normalized)) {
      const match = line.match(/entra\s+(.+?)\s+sai\s+(.+)/i);
      if (match) substitutions.push(`🟢 **Entra:** ${match[1].trim()}\n🔴 **Sai:** ${match[2].trim()}`);
      else occurrences.push(line);
      continue;
    }
    if (/gol|marcou|tent[oó]o/.test(normalized)) {
      goals.push(`🥅 ${line}`);
      continue;
    }
    if (/cart[aã]o|amarelo|vermelho/.test(normalized)) {
      cards.push(`🟨 ${line}`);
      continue;
    }
    const scoreMatch = line.match(/(.+?)\s+(\d+)\s*[x×-]\s*(\d+)\s+(.+)/i);
    if (scoreMatch) {
      home = scoreMatch[1].trim();
      away = scoreMatch[4].trim();
      score = `${scoreMatch[2]} × ${scoreMatch[3]}`;
      continue;
    }
    if (!home) home = line;
    else if (!away && !/relat[oó]rio|partida/.test(normalized)) away = line;
    else occurrences.push(line);
  }
  if (home && away && !score) score = "A definir";
  return [
    "⚽ **RELATÓRIO DA PARTIDA**",
    home ? `\n🏟️ **${home.toUpperCase()}**${away ? `\n🆚 **${away.toUpperCase()}**` : ""}` : "",
    substitutions.length ? `\n🔄 **SUBSTITUIÇÕES**\n${substitutions.join("\n\n")}` : "",
    goals.length ? `\n⚽ **GOLS**\n${goals.join("\n")}` : "",
    cards.length ? `\n🟨 **CARTÕES**\n${cards.join("\n")}` : "",
    `\n📋 **OCORRÊNCIAS**\n${occurrences.length ? occurrences.map((item) => `• ${item}`).join("\n") : "• Informações registradas durante a partida."}`,
    score ? `\n🏆 **RESULTADO**\n${home || "Time"} ${score} ${away || "Adversário"}` : "",
  ].filter(Boolean).join("\n");
}

const commands = [
  { name: "partida", description: "Publica uma partida da NSL.", options: [
    { type: 3, name: "casa", description: "Time da casa", required: true },
    { type: 3, name: "fora", description: "Time visitante", required: true },
    { type: 3, name: "servidor", description: "Link do servidor Roblox", required: false },
    { type: 3, name: "nick", description: "Nick para entrar", required: false },
  ] },
  { name: "falar", description: "Abre o formulário para registrar uma partida." },
  { name: "parceria", description: "Envia ou recupera o painel permanente de parcerias da NSL." },
  { name: "parcerias", description: "Envia o painel oficial de parcerias da NSL." },
  { name: "criar", description: "Cria a estrutura salva da NSL ou um emoji a partir de uma foto.", options: [
    { type: 11, name: "foto", description: "Imagem para criar o emoji (somente o dono)", required: false },
    { type: 3, name: "nome", description: "Nome do emoji; se vazio, usa o nome do arquivo", required: false },
    { type: 5, name: "estrutura", description: "Criar a estrutura salva com categorias, canais e cargos", required: false },
    { type: 5, name: "apagar_cargos", description: "Apagar cargos existentes que o bot puder apagar antes de criar os 57", required: false },
  ] },
  { name: "clear", description: "Apaga canais que o bot puder gerenciar.", options: [{ type: 5, name: "sem_categoria", description: "Apaga somente canais sem categoria, preservando logs-bot", required: false }] },
  { name: "cargos", description: "Cria os 57 cargos oficiais da NSL.", options: [{ type: 5, name: "apagar", description: "Apagar cargos existentes que o bot puder apagar antes de criar", required: false }] },
  { name: "lock", description: "Tranca os canais de texto do servidor.", options: [{ type: 1, name: "all", description: "Tranca todos os canais de texto", options: [] }] },
  { name: "unlock", description: "Destranca somente os canais de uma categoria.", options: [{ type: 3, name: "categoria", description: "Nome da categoria", required: true }] },
  { name: "times", description: "Cria até 20 canais de times de um país.", options: [
    { type: 3, name: "pais", description: "País dos clubes", required: true },
    { type: 3, name: "categoria", description: "Categoria existente onde os canais serão criados", required: false },
  ] },
  { name: "ban", description: "Bane um membro com confirmação.", options: [
    { type: 6, name: "usuario", description: "Membro que será banido", required: true },
    { type: 3, name: "motivo", description: "Motivo do banimento", required: true },
    { type: 3, name: "duracao", description: "Duração do banimento", required: true, choices: ["10m", "30m", "1h", "6h", "12h", "1d", "7d", "Permanente"].map((name) => ({ name, value: name === "Permanente" ? "permanente" : name })) },
  ] },
  { name: "hackban", description: "Bane um ID diretamente pela API oficial do Discord.", options: [
    { type: 3, name: "id", description: "ID do usuário", required: true },
    { type: 3, name: "motivo", description: "Motivo do banimento", required: true },
  ] },
  { name: "mute", description: "Aplica timeout com confirmação.", options: [
    { type: 6, name: "usuario", description: "Membro que será silenciado", required: true },
    { type: 3, name: "motivo", description: "Motivo do mute", required: true },
    { type: 3, name: "duracao", description: "Duração do mute", required: true, choices: ["10m", "30m", "1h", "6h", "12h", "1d", "7d", "28d"].map((name) => ({ name, value: name })) },
  ] },
  { name: "unmute", description: "Remove o timeout de um membro.", options: [{ type: 6, name: "usuario", description: "Membro", required: true }] },
  { name: "kick", description: "Expulsa um membro com confirmação.", options: [{ type: 6, name: "usuario", description: "Membro", required: true }, { type: 3, name: "motivo", description: "Motivo", required: true }] },
  { name: "warn", description: "Aplica uma advertência.", options: [{ type: 6, name: "usuario", description: "Membro", required: true }, { type: 3, name: "motivo", description: "Motivo", required: true }] },
  { name: "warnings", description: "Mostra advertências de um membro.", options: [{ type: 6, name: "usuario", description: "Membro", required: true }] },
  { name: "role", description: "Adiciona ou remove um cargo.", options: [{ type: 6, name: "usuario", description: "Membro", required: true }, { type: 8, name: "cargo", description: "Cargo", required: true }, { type: 3, name: "acao", description: "Ação", required: true, choices: [{ name: "Adicionar", value: "add" }, { name: "Remover", value: "remove" }] }] },
];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const appId = client.application?.id || process.env.CLIENT_ID;
  if (!appId) throw new Error("CLIENT_ID não encontrado após login.");
  const route = process.env.GUILD_ID ? Routes.applicationGuildCommands(appId, process.env.GUILD_ID) : Routes.applicationCommands(appId);
  await rest.put(route, { body: commands });
  console.log(`Comandos NSL registrados ${process.env.GUILD_ID ? "no servidor de teste" : "globalmente"}.`);
}

async function handleCommand(interaction) {
  const { commandName } = interaction;
  if (!interaction.guild) return replyError(interaction, "Este comando só pode ser usado dentro de um servidor.");
  if (ADMIN_COMMANDS.has(commandName) && !isOwnerOrAdmin(interaction)) return replyError(interaction, "Você precisa ser dono, administrador ou ter Gerenciar Servidor.");
  if (commandName === "ban" && !hasModerationPermission(interaction, PermissionFlagsBits.BanMembers)) return replyError(interaction, "Você não possui a permissão Banir membros.");
  if (commandName === "hackban" && !hasModerationPermission(interaction, PermissionFlagsBits.BanMembers)) return replyError(interaction, "Você não possui a permissão Banir membros.");
  if (commandName === "mute" && !hasModerationPermission(interaction, PermissionFlagsBits.ModerateMembers)) return replyError(interaction, "Você não possui a permissão Moderar membros.");
  if (commandName === "unmute" && !hasModerationPermission(interaction, PermissionFlagsBits.ModerateMembers)) return replyError(interaction, "Você não possui a permissão Moderar membros.");
  if (commandName === "kick" && !hasModerationPermission(interaction, PermissionFlagsBits.KickMembers)) return replyError(interaction, "Você não possui a permissão Expulsar membros.");
  if (["warn", "warnings"].includes(commandName) && !hasModerationPermission(interaction, PermissionFlagsBits.ModerateMembers)) return replyError(interaction, "Você não possui a permissão Moderar membros.");
  if (commandName === "role" && !hasModerationPermission(interaction, PermissionFlagsBits.ManageRoles)) return replyError(interaction, "Você não possui a permissão Gerenciar cargos.");
  if (["lock", "unlock"].includes(commandName) && !hasModerationPermission(interaction, PermissionFlagsBits.ManageChannels)) return replyError(interaction, "Você não possui a permissão Gerenciar canais.");

  if (commandName === "partida") {
    const home = interaction.options.getString("casa");
    const away = interaction.options.getString("fora");
    const server = interaction.options.getString("servidor") || DEFAULT_ROBLOX_SERVER;
    const nick = interaction.options.getString("nick") || DEFAULT_ROBLOX_NICK;
    return interaction.reply({ embeds: [embed("⚽ PARTIDA NSL", `🏠 **${home}**\n🆚\n✈️ **${away}**\n\n🎮 **SERVIDOR ROBLOX**\n${server}\n\n👤 **NICK PARA ENTRAR**\n\`${nick}\``, COLORS.blue)] });
  }
  if (commandName === "falar") {
    const modal = new ModalBuilder().setCustomId("match_report_modal").setTitle("Relatório da partida");
    const input = new TextInputBuilder().setCustomId("match_report").setLabel("O que aconteceu na partida?").setStyle(TextInputStyle.Paragraph).setPlaceholder("Santos\nSubstituição\nEntra Levi sai Fernando\nGol do Santos").setRequired(true).setMaxLength(4000);
    return interaction.showModal(new ModalBuilder().setCustomId("match_report_modal").setTitle("Relatório da partida").addComponents(new ActionRowBuilder().addComponents(input)));
  }
  if (["parceria", "parcerias"].includes(commandName)) {
    const result = await sendPartnershipPanel(interaction.guild);
    if (!result.channel) return replyError(interaction, `Não encontrei um canal de texto com o ID \`${PARTNERSHIP_PANEL_CHANNEL_ID}\`.`);
    const action = result.created ? "enviado" : "recuperado";
    const pinStatus = result.pinned ? "A mensagem está fixada." : "Não consegui fixar; verifique se o bot tem Gerenciar mensagens.";
    return interaction.reply({ embeds: [embed("✅ PAINEL DE PARCERIAS", `O painel foi ${action} em ${result.channel}.\n\n${pinStatus}\n\nUse o mesmo comando novamente se a mensagem for apagada.`, COLORS.green)], ephemeral: true });
  }
  if (commandName === "criar") {
    const attachment = interaction.options.getAttachment("foto");
    if (attachment) {
      if (interaction.guild.ownerId !== interaction.user.id) {
        return replyError(interaction, "Somente o dono do servidor pode usar `/criar` com uma foto para criar emojis.");
      }
      if (!attachment.contentType?.startsWith("image/")) {
        return replyError(interaction, "O arquivo enviado precisa ser uma imagem PNG, JPG, GIF ou WEBP.");
      }
      if (attachment.size > 256 * 1024) {
        return replyError(interaction, "A imagem precisa ter no máximo 256 KB para virar um emoji do Discord.");
      }
      const requestedName = interaction.options.getString("nome");
      const sourceName = requestedName || attachment.name?.replace(/\.[^.]+$/, "") || "nsl_emoji";
      const emojiName = sourceName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 32) || "nsl_emoji";
      await interaction.deferReply({ ephemeral: true });
      try {
        const emoji = await interaction.guild.emojis.create({
          attachment: attachment.url,
          name: emojiName,
          reason: `Emoji NSL criado pelo dono ${interaction.user.tag}`,
        });
        await sendLog(interaction.guild, "😀 Emoji criado", `**Emoji:** ${emoji}\n**Nome:** ${emoji.name}\n**Criado por:** ${interaction.user}`, COLORS.green);
        return interaction.editReply({ embeds: [embed("✅ EMOJI CRIADO", `O emoji **${emoji.name}** foi criado com sucesso.\n\n${emoji}\n\n📁 **Arquivo:** ${attachment.name || "imagem enviada"}`, COLORS.green)] });
      } catch (error) {
        console.error("Erro ao criar emoji:", error?.code || error?.status || error?.message || error);
        return interaction.editReply({ embeds: [embed("⚠️ EMOJI NÃO CRIADO", "O Discord recusou a imagem. Verifique se o bot tem **Gerenciar expressões**, se o servidor ainda tem espaço para emojis e se o arquivo é válido.", COLORS.red)] });
      }
    }
    const permissionIssues = getSetupPermissionIssues(interaction.guild);
    if (permissionIssues.length) {
      return replyError(interaction, `O bot não tem estas permissões necessárias: **${permissionIssues.join(", ")}**.\n\nDê ao cargo do bot a permissão **Administrador** ou habilite essas permissões e tente novamente.`);
    }
    const deleteExisting = interaction.options.getBoolean("apagar_cargos") === true;
    const key = `setup:${interaction.guild.id}:${interaction.user.id}`;
    savePending(key, { type: "setup", deleteExisting });
    const totalChannels = DEFAULT_CATEGORIES.reduce((total, item) => total + item.channels.length, 0);
    const warning = deleteExisting ? "\n\n⚠️ **Atenção:** cargos existentes que o bot puder apagar serão removidos. `@everyone`, cargos de integração e cargos acima do bot serão preservados." : "\n\nA estrutura e os cargos existentes não serão apagados.";
    return interaction.reply({ embeds: [embed("⚙️ PRÉVIA DA CONFIGURAÇÃO NSL", `A criação fixa vai verificar/criar **${DEFAULT_CATEGORIES.length} categorias**, **${totalChannels} canais** e os **57 cargos oficiais** da NSL.${warning}`, COLORS.purple)], components: confirmationComponents(key, true), ephemeral: true });
  }
  if (commandName === "clear") {
    const key = `clear:${interaction.guild.id}:${interaction.user.id}`;
    const onlyUncategorized = interaction.options.getBoolean("sem_categoria") === true;
    if (onlyUncategorized) {
      const deletable = interaction.guild.channels.cache.filter((channel) => !channel.parentId && !isLogsBotChannel(channel) && channel.deletable);
      savePending(key, { type: "clearUncategorized" });
      return interaction.reply({ embeds: [embed("⚠️ LIMPAR CANAIS SEM CATEGORIA", `Serão apagados **${deletable.size} canais** que estão fora de categorias.\n\n✅ O canal **logs-bot** será preservado.\n⚠️ Categorias e canais dentro de categorias não serão alterados.\n\nEssa ação não pode ser desfeita.`, COLORS.red)], components: confirmationComponents(key), ephemeral: true });
    }
    savePending(key, { type: "clear" });
    return interaction.reply({ embeds: [embed("⚠️ LIMPAR SERVIDOR", "Tem certeza que deseja apagar os canais que o bot tiver permissão para apagar?\n\nEsta ação é perigosa e não pode ser desfeita.", COLORS.red)], components: confirmationComponents(key), ephemeral: true });
  }
  if (commandName === "cargos") {
    const key = `roles:${interaction.guild.id}:${interaction.user.id}`;
    const deleteExisting = interaction.options.getBoolean("apagar") === true;
    savePending(key, { type: "roles", deleteExisting });
    const warning = deleteExisting ? "\n\n⚠️ **Atenção:** cargos existentes que o bot puder apagar serão removidos. `@everyone`, cargos de integração e cargos acima do bot serão preservados." : "";
    return interaction.reply({ embeds: [embed("👑 PRÉVIA DOS 57 CARGOS", `Serão criados/verificados os 57 cargos oficiais da NSL, com **👑・FUNDADOR** como único cargo com Administrador.${warning}`, COLORS.purple)], components: confirmationComponents(key), ephemeral: true });
  }
  if (commandName === "lock") {
    const key = `lock:${interaction.guild.id}:${interaction.user.id}`;
    savePending(key, { type: "lockAll" });
    return interaction.reply({ embeds: [embed("🔒 CONFIRMAR LOCK GLOBAL", "Todos os canais de texto, anúncios e fóruns que o bot puder gerenciar ficarão bloqueados para membros comuns.\n\nAdministradores do Discord ainda podem falar se tiverem permissão superior.", COLORS.red)], components: confirmationComponents(key), ephemeral: true });
  }
  if (commandName === "unlock") {
    const categoryName = interaction.options.getString("categoria");
    const category = interaction.guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && (normalize(channel.name) === normalize(categoryName) || normalize(channel.name).includes(normalize(categoryName))));
    if (!category) return replyError(interaction, `Não encontrei a categoria **${categoryName}**. Use o nome exibido no servidor, por exemplo \`🛡️・STAFF\`.`);
    const key = `unlock:${interaction.guild.id}:${interaction.user.id}`;
    savePending(key, { type: "unlockCategory", categoryId: category.id, categoryName: category.name });
    return interaction.reply({ embeds: [embed("🔓 CONFIRMAR UNLOCK", `Somente os canais da categoria **${category.name}** serão destrancados.\n\nNenhuma outra categoria será alterada.`, COLORS.green)], components: confirmationComponents(key), ephemeral: true });
  }
  if (commandName === "times") {
    const country = normalize(interaction.options.getString("pais"));
    const dataset = COUNTRY_TEAMS[country];
    if (!dataset) return replyError(interaction, `Ainda não tenho uma lista pronta para **${interaction.options.getString("pais")}**. Use Brasil, Inglaterra, Espanha, Itália, Alemanha, França, Portugal, Argentina, México, Holanda ou EUA.`);
    const categoryName = interaction.options.getString("categoria");
    const key = `teams:${interaction.guild.id}:${interaction.user.id}`;
    savePending(key, { type: "teams", country, dataset, categoryName });
    return interaction.reply({ embeds: [embed("⚽ PRÉVIA DOS TIMES", `**País:** ${interaction.options.getString("pais")}\n**Canais:** ${dataset.teams.length}\n**Categoria:** ${categoryName || "👥・TIMES"}\n\n${dataset.teams.map((team) => `${dataset.flag}・${team}`).join("\n")}`, COLORS.green)], components: confirmationComponents(key), ephemeral: true });
  }
  if (commandName === "hackban") {
    const id = interaction.options.getString("id");
    const reason = interaction.options.getString("motivo");
    if (!/^\d{16,20}$/.test(id)) return replyError(interaction, "Informe um ID de usuário válido do Discord.");
    await interaction.deferReply({ ephemeral: true });
    try {
      await interaction.guild.bans.create(id, { reason: `${reason} — por ${interaction.user.tag}` });
      await sendLog(interaction.guild, "🔨 Hackban aplicado", `**ID:** ${id}\n**Motivo:** ${reason}\n**Staff:** ${interaction.user}`, COLORS.red);
      return interaction.editReply({ embeds: [embed("🔨 HACKBAN APLICADO", `**ID:** ${id}\n**Motivo:** ${reason}`, COLORS.red)] });
    } catch (error) {
      return interaction.editReply({ embeds: [embed("⚠️ Hackban recusado", "O Discord não permitiu banir esse ID. Verifique se o bot tem Banir membros e se o ID é válido.", COLORS.red)] });
    }
  }
  if (commandName === "warnings") {
    const target = interaction.options.getMember("usuario");
    const list = warnings[interaction.guild.id]?.[target.id] || [];
    return interaction.reply({ embeds: [embed("⚠️ ADVERTÊNCIAS", list.length ? list.map((item, index) => `**${index + 1}.** ${item.reason}\n> ${item.staff} • <t:${Math.floor(new Date(item.createdAt).getTime() / 1000)}:R>`).join("\n\n") : `${target} não possui advertências registradas.`, COLORS.yellow)], ephemeral: true });
  }
  if (commandName === "warn") {
    const target = interaction.options.getMember("usuario");
    const reason = interaction.options.getString("motivo");
    const check = canActOnMember(interaction, target);
    if (!check.ok) return replyError(interaction, check.reason);
    warnings[interaction.guild.id] ||= {};
    warnings[interaction.guild.id][target.id] ||= [];
    warnings[interaction.guild.id][target.id].push({ reason, staff: interaction.user.tag, createdAt: new Date().toISOString() });
    writeWarnings(warnings);
    await sendLog(interaction.guild, "⚠️ Warn aplicado", `**Usuário:** ${target}\n**Motivo:** ${reason}\n**Staff:** ${interaction.user}`, COLORS.yellow);
    return interaction.reply({ embeds: [embed("⚠️ ADVERTÊNCIA APLICADA", `**Usuário:** ${target}\n**Motivo:** ${reason}\n**Total:** ${warnings[interaction.guild.id][target.id].length}`, COLORS.yellow)] });
  }
  if (commandName === "role") {
    const target = interaction.options.getMember("usuario");
    const role = interaction.options.getRole("cargo");
    const action = interaction.options.getString("acao");
    const actor = getMember(interaction);
    const me = interaction.guild.members.me;
    if (role.managed || role.position >= me.roles.highest.position || (interaction.user.id !== interaction.guild.ownerId && role.position >= actor.roles.highest.position)) return replyError(interaction, "Esse cargo está acima da hierarquia permitida ou é gerenciado pelo Discord.");
    const check = canActOnMember(interaction, target);
    if (!check.ok) return replyError(interaction, check.reason);
    if (action === "add") await target.roles.add(role, `Role por ${interaction.user.tag}`);
    else await target.roles.remove(role, `Role por ${interaction.user.tag}`);
    await sendLog(interaction.guild, "👤 Alteração de cargo", `**Usuário:** ${target}\n**Cargo:** ${role}\n**Ação:** ${action === "add" ? "adicionado" : "removido"}\n**Staff:** ${interaction.user}`, COLORS.blue);
    return interaction.reply({ embeds: [embed("👤 CARGO ATUALIZADO", `${action === "add" ? "Adicionado" : "Removido"} **${role.name}** ${action === "add" ? "para" : "de"} ${target}.`, COLORS.green)] });
  }
  if (["ban", "mute", "kick"].includes(commandName)) {
    const target = interaction.options.getMember("usuario");
    const reason = interaction.options.getString("motivo");
    const duration = interaction.options.getString("duracao");
    const check = canActOnMember(interaction, target);
    if (!check.ok) return replyError(interaction, check.reason);
    const key = `${commandName}:${interaction.guild.id}:${interaction.user.id}`;
    savePending(key, { type: commandName, targetId: target.id, reason, duration });
    const title = commandName === "ban" ? "⚠️ CONFIRMAR BANIMENTO" : commandName === "mute" ? "🔇 CONFIRMAR MUTE" : "👢 CONFIRMAR EXPULSÃO";
    const durationLine = commandName === "kick" ? "" : `\n⏱️ **Duração:** ${displayDuration(duration)}`;
    return interaction.reply({ embeds: [embed(title, `👤 **Usuário:** ${target}\n📋 **Motivo:** ${reason}${durationLine}\n\n🔴 Confirmar ou ⚪ cancelar abaixo.`, COLORS.red)], components: confirmationComponents(key), ephemeral: true });
  }
  if (commandName === "unmute") {
    const target = interaction.options.getMember("usuario");
    const check = canActOnMember(interaction, target);
    if (!check.ok) return replyError(interaction, check.reason);
    await target.timeout(null, `Unmute por ${interaction.user.tag}`);
    await sendLog(interaction.guild, "🔊 Unmute aplicado", `**Usuário:** ${target}\n**Staff:** ${interaction.user}`, COLORS.green);
    return interaction.reply({ embeds: [embed("🔊 MUTE REMOVIDO", `${target} pode falar novamente.\n\n🛡️ **Staff:** ${interaction.user}`, COLORS.green)] });
  }
}

async function executePending(interaction, action) {
  const guild = interaction.guild;
  if (action.type === "setup") {
    await interaction.editReply({ embeds: [embed("⏳ CONFIGURAÇÃO EM ANDAMENTO", "O bot está verificando os 57 cargos e preparando a estrutura da NSL.\n\nIsso pode levar alguns minutos por causa dos limites da API do Discord. Não clique novamente.", COLORS.yellow)], components: [] });
    const roleResult = await setupServer(
      guild,
      interaction.user.tag,
      action.deleteExisting,
      (message) => interaction.editReply({ embeds: [embed("⏳ CONFIGURAÇÃO EM ANDAMENTO", `${message}\n\nNão clique novamente enquanto a criação estiver em andamento.`, COLORS.yellow)], components: [] }),
    );
    const totalChannels = DEFAULT_CATEGORIES.reduce((total, item) => total + item.channels.length, 0);
    return interaction.editReply({ embeds: [embed("✅ NSL CONFIGURADA", `${DEFAULT_CATEGORIES.length} categorias, ${totalChannels} canais e os 57 cargos oficiais foram verificados/criados.\n\n🧹 **Cargos apagados:** ${roleResult.deleted}\n🔒 **Cargos preservados:** ${roleResult.skipped}`, COLORS.green)], components: [] });
  }
  if (action.type === "roles") {
    const roleResult = await createRoles(guild, action.deleteExisting);
    await sendLog(guild, "🏗️ Cargos NSL criados", `**Cargos oficiais:** ${roleResult.roles.length}\n**Apagados:** ${roleResult.deleted}\n**Preservados:** ${roleResult.skipped}\n**Responsável:** ${interaction.user}`, COLORS.purple);
    return interaction.editReply({ embeds: [embed("✅ CARGOS CONFIGURADOS", `Os 57 cargos oficiais da NSL foram verificados/criados.\n\n🆕 **Criados/verificados:** ${roleResult.roles.length}\n🧹 **Apagados:** ${roleResult.deleted}\n🔒 **Preservados:** ${roleResult.skipped}\n\n👑 **Administrador:** somente 👑・FUNDADOR`, COLORS.green)], components: [] });
  }
  if (action.type === "lockAll") {
    const channels = guild.channels.cache.filter((channel) => [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type));
    let locked = 0;
    let skipped = 0;
    for (const channel of channels.values()) {
      await setChannelLock(channel, true).then((changed) => { if (changed) locked += 1; else skipped += 1; }).catch(() => { skipped += 1; });
    }
    await sendLog(guild, "🔒 Lock global aplicado", `**Canais trancados:** ${locked}\n**Ignorados:** ${skipped}\n**Staff:** ${interaction.user}`, COLORS.red);
    return interaction.editReply({ embeds: [embed("🔒 SERVIDOR TRANCADO", `${locked} canais foram trancados para membros comuns.\n\n🔓 Para liberar uma parte, use \`/unlock categoria:<nome>\`.`, COLORS.red)], components: [] });
  }
  if (action.type === "unlockCategory") {
    const category = guild.channels.cache.get(action.categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return interaction.editReply({ embeds: [embed("⚠️ Categoria não encontrada", "A categoria pode ter sido apagada. Execute `/unlock` novamente.", COLORS.red)], components: [] });
    const channels = guild.channels.cache.filter((channel) => channel.parentId === category.id && [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type));
    let unlocked = 0;
    let skipped = 0;
    for (const channel of channels.values()) {
      await setChannelLock(channel, false).then((changed) => { if (changed) unlocked += 1; else skipped += 1; }).catch(() => { skipped += 1; });
    }
    await sendLog(guild, "🔓 Categoria destrancada", `**Categoria:** ${category.name}\n**Canais liberados:** ${unlocked}\n**Ignorados:** ${skipped}\n**Staff:** ${interaction.user}`, COLORS.green);
    return interaction.editReply({ embeds: [embed("🔓 CATEGORIA DESTRANCADA", `A categoria **${category.name}** foi liberada.\n\n✅ **Canais liberados:** ${unlocked}\n🔒 **Ignorados:** ${skipped}\n\nAs outras categorias continuam trancadas.`, COLORS.green)], components: [] });
  }
  if (action.type === "teams") {
    const category = action.categoryName
      ? guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && normalize(channel.name) === normalize(action.categoryName))
      : guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && normalize(channel.name) === normalize("👥・TIMES"));
    const parent = category || await ensureCategory(guild, action.categoryName || "👥・TIMES");
    for (const team of action.dataset.teams) await ensureTextChannel(guild, `${action.dataset.flag}・${team}`, parent);
    await sendLog(guild, "⚽ Canais de times criados", `**País:** ${action.country}\n**Quantidade:** ${action.dataset.teams.length}\n**Staff:** ${interaction.user}`, COLORS.green);
    return interaction.editReply({ embeds: [embed("✅ TIMES CRIADOS", `${action.dataset.flag} ${action.dataset.teams.length} canais foram criados/verificados em ${parent}.`, COLORS.green)], components: [] });
  }
  if (action.type === "clear") {
    const deletable = guild.channels.cache.filter((channel) => channel.deletable);
    let deleted = 0;
    for (const channel of deletable.values()) {
      await channel.delete("Limpeza confirmada por /clear").then(() => { deleted += 1; }).catch(() => {});
    }
    await sendLog(guild, "🧹 Clear executado", `**Canais apagados:** ${deleted}\n**Staff:** ${interaction.user}`, COLORS.red);
    return interaction.editReply({ embeds: [embed("🧹 LIMPEZA CONCLUÍDA", `${deleted} canais foram apagados.`, COLORS.red)], components: [] });
  }
  if (action.type === "clearUncategorized") {
    const deletable = guild.channels.cache.filter((channel) => !channel.parentId && !isLogsBotChannel(channel) && channel.deletable);
    let deleted = 0;
    let skipped = 0;
    for (const channel of deletable.values()) {
      await channel.delete("Limpeza confirmada: canais sem categoria").then(() => { deleted += 1; }).catch(() => { skipped += 1; });
    }
    await sendLog(guild, "🧹 Canais sem categoria apagados", `**Apagados:** ${deleted}\n**Ignorados por erro/permissão:** ${skipped}\n**Preservado:** logs-bot\n**Staff:** ${interaction.user}`, COLORS.red);
    return interaction.editReply({ embeds: [embed("🧹 LIMPEZA CONCLUÍDA", `**${deleted} canais** sem categoria foram apagados.\n\n✅ O canal **logs-bot** foi preservado.\n🔒 **Ignorados:** ${skipped}`, COLORS.red)], components: [] });
  }
  if (["ban", "mute", "kick"].includes(action.type)) {
    const target = await guild.members.fetch(action.targetId).catch(() => null);
     if (!target) return interaction.editReply({ embeds: [embed("⚠️ Ação cancelada", "O membro não está mais disponível no servidor.", COLORS.red)], components: [] });
    const check = canActOnMember(interaction, target);
     if (!check.ok) return interaction.editReply({ embeds: [embed("⚠️ Ação recusada", check.reason, COLORS.red)], components: [] });
    if (action.type === "ban") {
      await target.ban({ reason: `${action.reason} — por ${interaction.user.tag}` });
      if (action.duration !== "permanente") {
        const expiresAt = Date.now() + DURATION_MS[action.duration];
        temporaryBans[`${guild.id}:${target.id}`] = expiresAt;
        writeTemporaryBans(temporaryBans);
        scheduleBanExpiry(guild.id, target.id, expiresAt);
      }
      await sendLog(guild, "🔨 Banimento aplicado", `**Usuário:** ${target.user.tag}\n**Motivo:** ${action.reason}\n**Duração:** ${displayDuration(action.duration)}\n**Staff:** ${interaction.user}`, COLORS.red);
      return interaction.update({ embeds: [embed("🔨 BANIMENTO APLICADO", `👤 ${target.user.tag}\n📋 ${action.reason}\n⏱️ ${displayDuration(action.duration)}\n\n🛡️ **Staff:** ${interaction.user}`, COLORS.red)], components: [] });
    }
    if (action.type === "mute") {
      await target.timeout(DURATION_MS[action.duration], `${action.reason} — por ${interaction.user.tag}`);
      await sendLog(guild, "🔇 Mute aplicado", `**Usuário:** ${target}\n**Motivo:** ${action.reason}\n**Duração:** ${action.duration}\n**Staff:** ${interaction.user}`, COLORS.yellow);
      return interaction.update({ embeds: [embed("🔇 MUTE APLICADO", `👤 ${target}\n📋 ${action.reason}\n⏱️ ${action.duration}\n\n🛡️ **Staff:** ${interaction.user}`, COLORS.yellow)], components: [] });
    }
    await target.kick(`${action.reason} — por ${interaction.user.tag}`);
    await sendLog(guild, "👢 Kick aplicado", `**Usuário:** ${target.user.tag}\n**Motivo:** ${action.reason}\n**Staff:** ${interaction.user}`, COLORS.red);
    return interaction.update({ embeds: [embed("👢 EXPULSÃO APLICADA", `👤 ${target.user.tag}\n📋 ${action.reason}\n\n🛡️ **Staff:** ${interaction.user}`, COLORS.red)], components: [] });
  }
}

client.once("clientReady", async () => {
  console.log(`NSL conectada como ${client.user.tag}.`);
  try {
    await registerCommands();
    await restoreBanTimers();
  } catch (error) {
    console.error("Falha ao registrar slash commands:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) return await handleCommand(interaction);
    if (interaction.isModalSubmit() && interaction.customId.startsWith("partnership:")) {
      return await handlePartnershipModal(interaction);
    }
    if (interaction.isModalSubmit() && interaction.customId === "match_report_modal") {
      const raw = interaction.fields.getTextInputValue("match_report");
      return interaction.reply({ embeds: [embed("⚽ RELATÓRIO DA PARTIDA", reportFromText(raw), COLORS.blue)] });
    }
    if (interaction.isButton() && interaction.customId.startsWith("partnership:")) {
      return await handlePartnershipButton(interaction);
    }
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const parts = interaction.customId.split(":");
      const action = pendingActions.get(parts.slice(1).join(":"));
      if (!action) return interaction.reply({ embeds: [embed("⌛ Prévia expirada", "Execute o comando novamente para gerar uma nova confirmação.", COLORS.yellow)], ephemeral: true });
      if (interaction.user.id !== action.userId && action.userId) return replyError(interaction, "Somente a pessoa que iniciou esta ação pode confirmá-la.");
      const selected = interaction.isStringSelectMenu() ? interaction.values[0] : parts[0] === "confirm" ? "confirm" : "cancel";
      if (selected === "cancel") {
        pendingActions.delete(parts.slice(1).join(":"));
        return interaction.update({ embeds: [embed("⚪ AÇÃO CANCELADA", "Nenhuma alteração foi feita.", COLORS.yellow)], components: [] });
      }
      pendingActions.delete(parts.slice(1).join(":"));
      await interaction.deferUpdate();
      return await executePending(interaction, action);
    }
  } catch (error) {
    console.error("Erro em interação:", error?.code || error?.status || error?.message || error);
    if (interaction.isRepliable()) {
      const payload = { embeds: [embed("⚠️ AÇÃO NÃO CONCLUÍDA", "O Discord recusou uma das operações. Verifique se o bot tem **Administrador**, se o cargo dele está acima dos cargos NSL e tente novamente.", COLORS.red)], components: [] };
      if (interaction.deferred || interaction.replied) await interaction.editReply(payload).catch(() => interaction.followUp({ ...payload, ephemeral: true }).catch(() => {}));
      else await replyError(interaction, payload.embeds[0].data.description).catch(() => {});
    }
  }
});

client.on("messageCreate", async (message) => {
  try {
    await handlePartnershipMessage(message);
  } catch (error) {
    console.error("Erro no fluxo de parceria:", error?.code || error?.status || error?.message || error);
  }
});

client.on("error", (error) => console.error("Erro do cliente Discord:", error));
process.on("unhandledRejection", (error) => console.error("Promessa rejeitada:", error));
process.on("uncaughtException", (error) => console.error("Exceção não tratada:", error));

client.login(TOKEN).catch((error) => {
  console.error("Falha ao conectar o bot ao Discord:", error);
  process.exitCode = 1;
});