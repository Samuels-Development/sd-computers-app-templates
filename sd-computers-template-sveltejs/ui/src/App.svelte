<script>
    import { onMount } from 'svelte';

    const STACK = 'Svelte';
    const PING = '/computerping_svelte';

    // Each card and button uses one part of the sd-computers SDK; the reference for all of it is
    // https://docs.samueldev.shop/resources/computers/custom-apps
    let { computer } = $props();
    const app = $derived(computer.app);
    const machine = $derived(computer.machine);
    const user = $derived(computer.user);

    let game = $state(null);
    let server = $state(null);
    let serverError = $state('');
    let notes = $state('');
    let notesState = $state('');
    let ping = $state(null);
    let badge = $state(0);
    let result = $state('');
    let saving = 0;

    // Page -> client: this resource's own NUI callback (client.lua).
    function loadGame() {
        computer.fetchNui('getExampleData').then((d) => {
            if (d) game = d;
            else result = 'client.lua did not answer.';
        });
    }

    // Page -> server: an endpoint registered with the app (server.lua). It rejects with the
    // endpoint's own message when it says no.
    function loadServer() {
        serverError = '';
        computer.callServer('example:status').then(
            (d) => (server = d),
            (err) => (serverError = err.message),
        );
    }

    onMount(() => {
        loadGame();
        loadServer();
        computer.storage.get('notes', '').then((v) => (notes = v || ''));
        // Server -> page: what /computerping_svelte sends (server.lua, SendAppMessage).
        return computer.onMessage('ping', (d) => (ping = `${d.text} (from ${d.from})`));
    });

    // Kept a moment after typing stops. Until it is, closing the window (or standing up) asks first.
    function notesChanged() {
        notesState = 'Saving...';
        computer.window.preventClose('Your notes are still being saved.');
        clearTimeout(saving);
        saving = setTimeout(async () => {
            const ok = await computer.storage.set('notes', notes);
            notesState = ok ? 'Saved' : 'Could not save';
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
        if (!yes) return (result = 'Kept the notes.');
        notes = '';
        computer.storage.set('notes', '');
        result = 'Cleared the notes.';
    }

    function notify() {
        computer.notify({ title: app.label, body: `Hello from the ${STACK} template.` });
    }

    async function ask() {
        const answer = await computer.dialog.prompt({ title: 'Your call sign', message: 'Anything will do.', placeholder: 'Unit 12' });
        result = answer === null ? 'You cancelled.' : `You answered: ${answer}`;
    }

    // The desktop's own context menu, opened under the button. Each item's onClick runs when picked.
    function menu(e) {
        const r = e.currentTarget.getBoundingClientRect();
        computer.menu({ clientX: r.left, clientY: r.bottom + 4 }, [
            { label: 'Refresh both cards', onClick: () => { loadGame(); loadServer(); result = 'Refreshed.'; } },
            { label: 'Send a notification', onClick: notify },
            { label: 'Clear the badge', disabled: badge === 0, onClick: () => { badge = 0; computer.setBadge(0); result = 'Badge cleared.'; } },
            { separator: true },
            { label: 'Clear the notes', danger: true, onClick: clearNotes },
        ]);
    }

    // The count on the app's icon (taskbar, dock, desktop). It stays with this player.
    function addBadge() {
        badge += 1;
        computer.setBadge(badge);
        result = `Badge: ${badge}`;
    }

    // A plain typed page to a printer near the computer (the print dialog picks which).
    async function print() {
        const sent = await computer.print({ title: `${app.label} notes`, text: notes || '(no notes yet)' });
        result = sent ? 'Sent to the printer.' : 'Not printed.';
    }

    function mail() {
        computer.openApp('mail', { subject: `Sent from ${app.label}` }).catch((err) => (result = err.message));
    }
</script>

<div class="app">
    <header class="top">
        <img src="icon.svg" alt="" />
        <div>
            <h1>{app.label}</h1>
            <p>sd-computers app template · {STACK}</p>
        </div>
        <div class="where">
            <b>{machine.label}</b>
            <span>{machine.hostname} · {user.name}</span>
        </div>
    </header>

    <main class="grid">
        <section class="card">
            <div class="card-head">
                <span class="card-title">From your game</span>
                <span class="tag">fetchNui</span>
                <button type="button" class="link" onclick={loadGame}>Refresh</button>
            </div>
            <div class="row"><span class="k">Player</span><span class="v">{game?.playerName ?? '-'}</span></div>
            <div class="row"><span class="k">Server ID</span><span class="v">{game?.serverId ?? '-'}</span></div>
            <div class="row"><span class="k">Street</span><span class="v">{game?.street ?? '-'}</span></div>
            <div class="row"><span class="k">In-game time</span><span class="v">{game?.time ?? '-'}</span></div>
            <p class="hint">Answered by client.lua's getExampleData NUI callback.</p>
        </section>

        <section class="card">
            <div class="card-head">
                <span class="card-title">From the server</span>
                <span class="tag">callServer</span>
                <button type="button" class="link" onclick={loadServer}>Refresh</button>
            </div>
            <div class="row"><span class="k">You</span><span class="v">{server?.you ?? '-'}</span></div>
            <div class="row"><span class="k">Computer</span><span class="v">{server ? `${server.computer} (${server.hostname})` : '-'}</span></div>
            <div class="row"><span class="k">Players online</span><span class="v">{server?.online ?? '-'}</span></div>
            <div class="row"><span class="k">Server time</span><span class="v">{server?.time ?? '-'}</span></div>
            {#if serverError}<p class="error">{serverError}</p>{/if}
            <p class="hint">Answered by the example:status endpoint in server.lua.</p>
        </section>

        <section class="card wide">
            <div class="card-head">
                <span class="card-title">Notes</span>
                <span class="tag">storage</span>
                <span class="hint" style="margin: 0 0 0 auto">{notesState}</span>
            </div>
            <textarea bind:value={notes} oninput={notesChanged} placeholder="Type anything. It is kept for this character, on every computer."></textarea>
        </section>

        <section class="card wide">
            <div class="card-head">
                <span class="card-title">Pushed from Lua</span>
                <span class="tag">onMessage</span>
            </div>
            <div class={ping ? 'ping' : 'ping empty'}>{ping ?? 'Nothing yet.'}</div>
            <p class="hint">Run {PING} hello in chat or the server console.</p>
        </section>
    </main>

    <footer class="actions">
        <button type="button" class="btn primary" onclick={notify}>Notify</button>
        <button type="button" class="btn" onclick={clearNotes}>Confirm</button>
        <button type="button" class="btn" onclick={ask}>Ask</button>
        <button type="button" class="btn" onclick={menu}>Menu</button>
        <button type="button" class="btn" onclick={addBadge}>Badge +1</button>
        <button type="button" class="btn" disabled={!computer.supports('print')} onclick={print}>Print notes</button>
        <button type="button" class="btn" onclick={mail}>Open Mail</button>
        <span class="result">{result}</span>
    </footer>
</div>
