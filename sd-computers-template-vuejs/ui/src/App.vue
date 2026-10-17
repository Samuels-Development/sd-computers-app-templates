<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const STACK = 'Vue';
const PING = '/computerping_vue';
// (bound, so Vue leaves it as it is: beside the built page, from public/)
const ICON = 'icon.svg';

// Each card and button uses one part of the sd-computers SDK; the reference for all of it is
// https://docs.samueldev.shop/resources/computers/custom-apps
const props = defineProps({ computer: { type: Object, required: true } });
const computer = props.computer;
const { app, machine, user } = computer;

const game = ref(null);
const server = ref(null);
const serverError = ref('');
const notes = ref('');
const notesState = ref('');
const ping = ref(null);
const badge = ref(0);
const result = ref('');
let saving = 0;
let stopListening = () => {};

// Page -> client: this resource's own NUI callback (client.lua).
function loadGame() {
    computer.fetchNui('getExampleData').then((d) => {
        if (d) game.value = d;
        else result.value = 'client.lua did not answer.';
    });
}

// Page -> server: an endpoint registered with the app (server.lua). It rejects with the
// endpoint's own message when it says no.
function loadServer() {
    serverError.value = '';
    computer.callServer('example:status').then(
        (d) => (server.value = d),
        (err) => (serverError.value = err.message),
    );
}

onMounted(() => {
    loadGame();
    loadServer();
    computer.storage.get('notes', '').then((v) => (notes.value = v || ''));
    // Server -> page: what /computerping_vue sends (server.lua, SendAppMessage).
    stopListening = computer.onMessage('ping', (d) => (ping.value = `${d.text} (from ${d.from})`));
});

onUnmounted(() => stopListening());

// Kept a moment after typing stops. Until it is, closing the window (or standing up) asks first.
function notesChanged() {
    notesState.value = 'Saving...';
    computer.window.preventClose('Your notes are still being saved.');
    clearTimeout(saving);
    saving = setTimeout(async () => {
        const ok = await computer.storage.set('notes', notes.value);
        notesState.value = ok ? 'Saved' : 'Could not save';
        computer.window.preventClose(false);
    }, 600);
}

async function clearNotes() {
    const yes = await computer.dialog.confirm({
        title: 'Clear the notes?',
        message: 'They go for good, on every computer.',
        confirmLabel: 'Clear',
        danger: true,
    });
    if (!yes) return (result.value = 'Kept the notes.');
    notes.value = '';
    computer.storage.set('notes', '');
    result.value = 'Cleared the notes.';
}

function notify() {
    computer.notify({ title: app.label, body: `Hello from the ${STACK} template.` });
}

async function ask() {
    const answer = await computer.dialog.prompt({ title: 'Your call sign', message: 'Anything will do.', placeholder: 'Unit 12' });
    result.value = answer === null ? 'You cancelled.' : `You answered: ${answer}`;
}

// The desktop's own context menu, opened under the button. Each item's onClick runs when picked.
function menu(e) {
    const r = e.currentTarget.getBoundingClientRect();
    computer.menu({ clientX: r.left, clientY: r.bottom + 4 }, [
        { label: 'Refresh both cards', onClick: () => { loadGame(); loadServer(); result.value = 'Refreshed.'; } },
        { label: 'Send a notification', onClick: notify },
        { label: 'Clear the badge', disabled: badge.value === 0, onClick: () => { badge.value = 0; computer.setBadge(0); result.value = 'Badge cleared.'; } },
        { separator: true },
        { label: 'Clear the notes', danger: true, onClick: clearNotes },
    ]);
}

// The count on the app's icon (taskbar, dock, desktop). It stays with this player.
function addBadge() {
    badge.value += 1;
    computer.setBadge(badge.value);
    result.value = `Badge: ${badge.value}`;
}

// A plain typed page to a printer near the computer (the print dialog picks which).
async function print() {
    const sent = await computer.print({ title: `${app.label} notes`, text: notes.value || '(no notes yet)' });
    result.value = sent ? 'Sent to the printer.' : 'Not printed.';
}

function mail() {
    computer.openApp('mail', { subject: `Sent from ${app.label}` }).catch((err) => (result.value = err.message));
}
</script>

<template>
    <div class="app">
        <header class="top">
            <img :src="ICON" alt="" />
            <div>
                <h1>{{ app.label }}</h1>
                <p>sd-computers app template · {{ STACK }}</p>
            </div>
            <div class="where">
                <b>{{ machine.label }}</b>
                <span>{{ machine.hostname }} · {{ user.name }}</span>
            </div>
        </header>

        <main class="grid">
            <section class="card">
                <div class="card-head">
                    <span class="card-title">From your game</span>
                    <span class="tag">fetchNui</span>
                    <button type="button" class="link" @click="loadGame">Refresh</button>
                </div>
                <div class="row"><span class="k">Player</span><span class="v">{{ game?.playerName ?? '-' }}</span></div>
                <div class="row"><span class="k">Server ID</span><span class="v">{{ game?.serverId ?? '-' }}</span></div>
                <div class="row"><span class="k">Street</span><span class="v">{{ game?.street ?? '-' }}</span></div>
                <div class="row"><span class="k">In-game time</span><span class="v">{{ game?.time ?? '-' }}</span></div>
                <p class="hint">Answered by client.lua's getExampleData NUI callback.</p>
            </section>

            <section class="card">
                <div class="card-head">
                    <span class="card-title">From the server</span>
                    <span class="tag">callServer</span>
                    <button type="button" class="link" @click="loadServer">Refresh</button>
                </div>
                <div class="row"><span class="k">You</span><span class="v">{{ server?.you ?? '-' }}</span></div>
                <div class="row"><span class="k">Computer</span><span class="v">{{ server ? `${server.computer} (${server.hostname})` : '-' }}</span></div>
                <div class="row"><span class="k">Players online</span><span class="v">{{ server?.online ?? '-' }}</span></div>
                <div class="row"><span class="k">Server time</span><span class="v">{{ server?.time ?? '-' }}</span></div>
                <p v-if="serverError" class="error">{{ serverError }}</p>
                <p class="hint">Answered by the example:status endpoint in server.lua.</p>
            </section>

            <section class="card wide">
                <div class="card-head">
                    <span class="card-title">Notes</span>
                    <span class="tag">storage</span>
                    <span class="hint" style="margin: 0 0 0 auto">{{ notesState }}</span>
                </div>
                <textarea v-model="notes" @input="notesChanged" placeholder="Type anything. It is kept for this character, on every computer."></textarea>
            </section>

            <section class="card wide">
                <div class="card-head">
                    <span class="card-title">Pushed from Lua</span>
                    <span class="tag">onMessage</span>
                </div>
                <div :class="ping ? 'ping' : 'ping empty'">{{ ping ?? 'Nothing yet.' }}</div>
                <p class="hint">Run {{ PING }} hello in chat or the server console.</p>
            </section>
        </main>

        <footer class="actions">
            <button type="button" class="btn primary" @click="notify">Notify</button>
            <button type="button" class="btn" @click="clearNotes">Confirm</button>
            <button type="button" class="btn" @click="ask">Ask</button>
            <button type="button" class="btn" @click="menu">Menu</button>
            <button type="button" class="btn" @click="addBadge">Badge +1</button>
            <button type="button" class="btn" :disabled="!computer.supports('print')" @click="print">Print notes</button>
            <button type="button" class="btn" @click="mail">Open Mail</button>
            <span class="result">{{ result }}</span>
        </footer>
    </div>
</template>
