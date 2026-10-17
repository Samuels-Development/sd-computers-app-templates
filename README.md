<div align="center">

# sd-computers app templates

**Ready-made starting points for putting your own programs on [sd-computers](https://github.com/Samuels-Development/sd-computers). Pick a stack, copy a folder, ship an app.**

[![Guide](https://img.shields.io/badge/Guide-Custom%20Apps-94DD0C)](https://docs.samueldev.shop/resources/computers/custom-apps)
[![Documentation](https://img.shields.io/badge/Docs-docs.samueldev.shop-94DD0C)](https://docs.samueldev.shop/resources/computers/)
[![Discord](https://img.shields.io/discord/842045164951437383?label=Discord&logo=discord&logoColor=white)](https://discord.gg/FzPehMQaBQ)

![Stacks](https://img.shields.io/badge/Stacks-Vanilla%20JS%20%7C%20React%20JS%2FTS%20%7C%20Vue%203%20%7C%20Svelte%205-3b82f6)
![Needs](https://img.shields.io/badge/sd--computers-v1.1.0%2B-3b82f6)

[**Custom App Guide**](https://docs.samueldev.shop/resources/computers/custom-apps) · [**sd-computers**](https://github.com/Samuels-Development/sd-computers) · [**Discord**](https://discord.gg/FzPehMQaBQ)

</div>

---

Each folder in this repository is a complete, standalone FiveM resource that puts an app on the computers. Five of them register the same small **Example** app: a card fed by your client script (`fetchNui`), a card fed by your server (`callServer`), notes kept for the character (`computer.storage`), a panel that a server command pushes text into, and buttons for the desktop's own dialogs, context menu, notifications, icon badge, printing and Mail. They take the look of the desktop they are opened on, light or dark, in all three of its styles.

The five are the same app written five ways, so comparing folders shows exactly what changes between stacks and nothing else.

The sixth, **[Wrenchworks](wrenchworks)**, is the full showcase: a garage's work-order book with its own brand, which uses every part of the API where a real program would.

![Wrenchworks on the modern look](wrenchworks/preview.webp)

> **Full documentation:** the [Custom App Guide](https://docs.samueldev.shop/resources/computers/custom-apps) covers registration, every field and gate, the page's whole API, endpoints, printing, storage and the exports. This README covers the templates themselves.

## Choosing a template

| Folder | Stack | Build step | Push command |
|---|---|---|---|
| [`sd-computers-template-vanillajs`](sd-computers-template-vanillajs) | Plain HTML/CSS/JS | none | `/computerping_vanilla` |
| [`sd-computers-template-reactjs`](sd-computers-template-reactjs) | React 18 + Vite (JavaScript) | `npm run build` | `/computerping_react` |
| [`sd-computers-template-reactts`](sd-computers-template-reactts) | React 18 + Vite (TypeScript) | `npm run build` | `/computerping_reactts` |
| [`sd-computers-template-vuejs`](sd-computers-template-vuejs) | Vue 3 + Vite | `npm run build` | `/computerping_vue` |
| [`sd-computers-template-sveltejs`](sd-computers-template-sveltejs) | Svelte 5 + Vite | `npm run build` | `/computerping_svelte` |
| [`wrenchworks`](wrenchworks) | Plain HTML/CSS/JS | none | `/workorder 12` opens it on an order |

Every template ships with its page already built (`ui/dist` is committed), so all of them run straight from a server restart with no npm needed. The TypeScript template also carries [`sdcomputers.d.ts`](sd-computers-template-reactts/ui/src/sdcomputers.d.ts), which types the whole API; it ships with sd-computers too, at `web/build/sdk/sdcomputers.d.ts`.

## Quick start

1. Copy the template you want into your resources folder and rename it.
2. Set your own `Id`, `Label`, `Description` and `Developer` in `config.lua`. `Groups` and `Computers` decide who gets the app on which computer.
3. `ensure` it in your `server.cfg`, below sd-computers.
4. Sit down at a computer: the app is on the desktop and in Start.
5. Try the push command from the table, for example `/computerping_vanilla hello world`, and watch the text arrive in the app.

The app registers itself whenever sd-computers is ready, restarts of either resource included, so there is no start order to get wrong. Do not add `dependency 'sd-computers'` to its manifest: FiveM would stop the app every time sd-computers restarts, and never start it again.

## How a template is put together

| File | Role |
|---|---|
| `config.lua` | The values copied into registration: id, label, description, developer, who gets it, where the page is |
| `server.lua` | Registers the app with `AddCustomApp` on `sd-computers:ready`, answers the page's `callServer('example:status')`, and adds the push command (`SendAppMessage`) |
| `client.lua` | Answers the page's `fetchNui('getExampleData')` with what only the game knows |
| `fxmanifest.lua` | Lists the page's files, so FiveM serves them for the computer to frame |
| `ui/` | The page. Vite templates keep source in `ui/src` and the committed build in `ui/dist` |

The page starts once the computer says it is ready (`src/computer.js`, or `computer.ts`). In a plain browser tab there is no computer, so the same file stands in for it with made-up data and the browser's own dialogs: open the page on its own, or run `npm run dev`, and it works without the game. Type `devPing('hello')` in the browser console to try the push panel.

## Two things every app should know

### There is no `ui_page`

The computer frames your page from `https://cfx-nui-<your resource>/...`, which only needs the page listed in `files`. A `ui_page` would also lay the page over the game at all times, so the templates have none. Keep `html` and `body` without a background anyway: a page that someone does make a `ui_page` would paint the whole screen with it.

### Endpoints answer `false, 'message'` to say no

`callServer` reaches the functions you register under `endpoints`, and only ever for a player signed in at a computer that has your app. To refuse, return `false` and a message: the page's call rejects with it. Not `nil` and a message, which loses the message on its way back to sd-computers.

## Developing with live reload

1. In the template's `ui/` folder run `npm install`, then `npm run dev` (Vite serves on `http://localhost:5173`).
2. In `config.lua` set `Config.DevServer = 'http://localhost:5173'` and restart the resource.
3. The computer now frames your dev server, and edits reload in place. `index.html` loads the SDK from sd-computers itself, which a page on another address needs. Set it back to `nil` and `npm run build` for production.

## Rebuilding

The Vite templates keep `package-lock.json` but not `node_modules`: run `npm install` once before `npm run build`. The build goes to `ui/dist`, which is what the resource serves.

---

<div align="center">

**[Custom App Guide](https://docs.samueldev.shop/resources/computers/custom-apps)** · **[Documentation](https://docs.samueldev.shop/resources/computers/)** · **[Discord](https://discord.gg/FzPehMQaBQ)**

</div>
