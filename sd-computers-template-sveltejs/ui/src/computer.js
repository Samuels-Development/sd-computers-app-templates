// The sd-computers SDK, once it is ready. On a computer that is `window.computer`, put into the
// page by the desktop (and loaded by index.html too, so a page on a dev server has it). In a plain
// browser tab there is no computer: a stand-in answers instead, with made-up data and the
// browser's own dialogs, so the page can be worked on without the game.

/** Resolves with the SDK once the desktop has said the page is ready. */
export function whenComputer() {
    if (window.parent === window) return Promise.resolve(standIn());
    return new Promise((resolve) => {
        if (window.computer && window.computer.isReady) return resolve(window.computer);
        window.addEventListener('computer:ready', (e) => resolve(e.detail), { once: true });
    });
}

const DARK = {
    surface: '#272727', card: 'rgba(255, 255, 255, 0.05)', text: '#ffffff',
    'text-secondary': 'rgba(255, 255, 255, 0.72)', 'text-tertiary': 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.08)', 'border-strong': 'rgba(255, 255, 255, 0.14)',
    'accent-fill': '#60cdff', 'on-accent': '#000000', 'accent-text': '#99ebff', critical: '#ff99a4',
};

const LIGHT = {
    surface: '#fbfbfb', card: 'rgba(255, 255, 255, 0.7)', text: 'rgba(0, 0, 0, 0.9)',
    'text-secondary': 'rgba(0, 0, 0, 0.61)', 'text-tertiary': 'rgba(0, 0, 0, 0.45)',
    border: 'rgba(0, 0, 0, 0.06)', 'border-strong': 'rgba(0, 0, 0, 0.12)',
    'accent-fill': '#005fb8', 'on-accent': '#ffffff', 'accent-text': '#003e92', critical: '#c42b1c',
};

/** The SDK's calls this example makes, answered in a plain browser tab. */
function standIn() {
    const dark = !window.matchMedia || window.matchMedia('(prefers-color-scheme: dark)').matches;
    const colors = dark ? DARK : LIGHT;
    const root = document.documentElement;
    for (const [name, value] of Object.entries(colors)) root.style.setProperty(`--sdc-${name}`, value);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-style', 'modern');

    const stored = {};
    const heard = {};
    const log = (...args) => console.info('[sd-computers stand-in]', ...args);

    const computer = {
        inComputer: false,
        isReady: true,
        version: 1,
        supports: () => true,
        app: { id: 'dev', label: document.title, resource: 'dev', version: '1.0.0', developer: 'you' },
        machine: { id: 'dev', label: 'Your browser', hostname: 'DEV-PC', ip: '127.0.0.1', style: 'modern', os: 'SD OS Pro', build: 'dev' },
        user: { name: 'Dev Player', initials: 'DP', job: 'Developer' },
        settings: { theme: dark ? 'dark' : 'light', style: 'modern', accent: '#4cc2ff', clock24: false, colors, font: '' },
        launch: null,

        fetchNui: async (event) =>
            event === 'getExampleData' ? { playerName: 'Dev Player', serverId: 1, time: '12:00', street: 'Alta St' } : undefined,
        callServer: async (endpoint) => {
            if (endpoint !== 'example:status') throw new Error(`The stand-in has no endpoint ${endpoint}.`);
            return { online: 1, time: new Date().toLocaleTimeString(), computer: 'Your browser', hostname: 'DEV-PC', you: 'Dev Player' };
        },
        onMessage: (action, cb) => {
            (heard[action] = heard[action] || []).push(cb);
            return () => {};
        },

        notify: async (n) => (log('notification:', n.title, n.body ?? ''), true),
        setBadge: async (count) => (log('badge:', count), count),
        dialog: {
            alert: async (o) => (window.alert(o.message ?? o.title ?? ''), true),
            confirm: async (o) => window.confirm([o.title, o.message].filter(Boolean).join('\n\n')),
            prompt: async (o) => window.prompt(o.title ?? '', o.value ?? ''),
        },
        menu: async (at, items) => {
            const first = items.find((it) => !it.separator && !it.disabled);
            log('menu:', items.filter((it) => !it.separator).map((it) => it.label).join(' | '), '-> picked', first?.label);
            first?.onClick?.();
            return first?.id ?? null;
        },
        print: async (job) => (log('print:', job.title, job.text ?? ''), true),
        openApp: async (id, props) => (log('open app:', id, props), true),
        storage: {
            get: async (key, fallback) => (key in stored ? stored[key] : fallback),
            set: async (key, value) => ((stored[key] = value), true),
        },
        onSettings: () => () => {},
        window: {
            setTitle: async (title) => ((document.title = title), true),
            preventClose: async () => true,
            on: () => () => {},
            state: () => null,
        },
    };

    // Try a push from the browser console: devPing('hello')
    window.devPing = (text) => (heard.ping ?? []).forEach((cb) => cb({ text, from: 'the console' }));
    return computer;
}
