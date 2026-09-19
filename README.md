# NSL Discord Bot

Bot Discord da **꧁🏆 NEXUS SOCCER LEAGUE ꧂** usando Discord.js v14.

## Requisitos

- Node.js 20 ou superior;
- um bot criado no [Discord Developer Portal](https://discord.com/developers/applications);
- o token do bot.

## Instalação

Dentro da pasta do projeto, execute:

```bash
npm install
```

## Configuração do token

1. Faça uma cópia do arquivo `.env.example` com o nome `.env`, ou configure a variável de ambiente diretamente na hospedagem.
2. No arquivo `.env`, substitua o valor de exemplo pelo token real:

```env
DISCORD_TOKEN=SEU_TOKEN_DO_DISCORD
```

O token não fica salvo no código. O bot lê o valor usando `process.env.DISCORD_TOKEN`.

> Não compartilhe o token e não o coloque no ZIP público. Se a hospedagem tiver um painel de variáveis de ambiente, configure `DISCORD_TOKEN` por esse painel.

## Como iniciar

Para iniciar diretamente:

```bash
node index.js
```

Start Command: `node index.js`

Também é possível iniciar pelo script do `package.json`:

```bash
npm start
```

Quando a conexão for concluída, o terminal exibirá que a NSL foi conectada.

## Permissões e intents do Discord

No Developer Portal, habilite o **Message Content Intent**. O bot também precisa das permissões necessárias para executar os comandos de administração, criar canais e categorias, gerenciar mensagens, gerenciar cargos, expulsar membros, banir membros e aplicar timeout.

## Funcionalidades mantidas

- `/parceria` — envia ou atualiza o painel permanente no canal configurado;
- `/parcerias` — envia o painel oficial de parcerias;
- `/criar` — cria a estrutura salva da NSL ou um emoji a partir de uma foto;
- `/times` — cria canais de times;
- `/lock all` e `/unlock` — controle de bloqueio por categoria;
- `/clear sem_categoria:true` — apaga canais sem categoria preservando `logs-bot`;
- comandos de partidas, moderação, advertências, cargos e demais comandos já presentes no bot original.

Os dados persistentes ficam na pasta `data/`. Ela deve permanecer junto do bot para preservar parcerias e banimentos temporários.

## Hospedagem por ZIP

1. Envie o conteúdo deste ZIP para a hospedagem.
2. Execute `npm install`.
3. Configure a variável de ambiente `DISCORD_TOKEN`.
4. Use `node index.js` como **Start Command**.

O projeto não exige pnpm e não contém um `preinstall` que bloqueie `npm install`.