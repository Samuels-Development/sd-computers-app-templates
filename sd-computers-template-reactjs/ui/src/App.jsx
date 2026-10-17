import { useEffect, useRef, useState } from 'react';

const STACK = 'React JS';
const PING = '/computerping_react';

// Each card and button uses one part of the sd-computers SDK; the reference for all of it is
// https://docs.samueldev.shop/resources/computers/custom-apps
export default function App({ computer }) {
    const { app, machine, user } = computer;

    const [game, setGame] = useState(null);
    const [server, setServer] = useState(null);
    const [serverError, setServerError] = useState('');
    const [notes, setNotes] = useState('');
    const [notesState, setNotesState] = useState('');
    const [ping, setPing] = useState(null);
    const [badge, setBadge] = useState(0);
    const [result, setResult] = useState('');
    const saving = useRef(0);

    // Page -> client: this resource's own NUI callback (client.lua).
    const loadGame = () => {
        computer.fetchNui('getExampleData').then((d) => (d ? setGame(d) : setResult('client.lua did not answer.')));
    };

    // Page -> server: an endpoint registered with the app (server.lua). It rejects with the
    // endpoint's own message when it says no.
    const loadServer = () => {
        setServerError('');
        computer.callServer('example:status').then(setServer, (err) => setServerError(err.message));
    };

    useEffect(() => {
        loadGame();
        loadServer();
        computer.storage.get('notes', '').then((v) => setNotes(v || ''));
        // Server -> page: what /computerping_react sends (server.lua, SendAppMessage).
        return computer.onMessage('ping', (d) => setPing(`${d.text} (from ${d.from})`));
    }, []);

    // Kept a moment after typing stops. Until it is, closing the window (or standing up) asks first.
    const changeNotes = (value) => {
        setNotes(value);
        setNotesState('Saving...');
        computer.window.preventClose('Your notes are still being saved.');
        clearTimeout(saving.current);
        saving.current = setTimeout(async () => {
            const ok = await computer.storage.set('notes', value);
            setNotesState(ok ? 'Saved' : 'Could not save');
            computer.window.preventClose(false);
        }, 600);
    };

    const clearNotes = async () => {
        const yes = await computer.dialog.confirm({
            title: 'Clear the notes?',
            message: 'They go for good, on every computer.',
            confirmLabel: 'Clear',
            danger: true,
        });
        if (!yes) return setResult('Kept the notes.');
        setNotes('');
        computer.storage.set('notes', '');
        setResult('Cleared the notes.');
    };

    const notify = () => computer.notify({ title: app.label, body: `Hello from the ${STACK} template.` });

    const ask = async () => {
        const answer = await computer.dialog.prompt({ title: 'Your call sign', message: 'Anything will do.', placeholder: 'Unit 12' });
        setResult(answer === null ? 'You cancelled.' : `You answered: ${answer}`);
    };

    // The desktop's own context menu, opened under the button. Each item's onClick runs when picked.
    const menu = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        computer.menu({ clientX: r.left, clientY: r.bottom + 4 }, [
            { label: 'Refresh both cards', onClick: () => { loadGame(); loadServer(); setResult('Refreshed.'); } },
            { label: 'Send a notification', onClick: notify },
            { label: 'Clear the badge', disabled: badge === 0, onClick: () => { setBadge(0); computer.setBadge(0); setResult('Badge cleared.'); } },
            { separator: true },
            { label: 'Clear the notes', danger: true, onClick: clearNotes },
        ]);
    };

    // The count on the app's icon (taskbar, dock, desktop). It stays with this player.
    const addBadge = () => {
        const next = badge + 1;
        setBadge(next);
        computer.setBadge(next);
        setResult(`Badge: ${next}`);
    };

    // A plain typed page to a printer near the computer (the print dialog picks which).
    const print = async () => {
        const sent = await computer.print({ title: `${app.label} notes`, text: notes || '(no notes yet)' });
        setResult(sent ? 'Sent to the printer.' : 'Not printed.');
    };

    const mail = () => computer.openApp('mail', { subject: `Sent from ${app.label}` }).catch((err) => setResult(err.message));

    return (
        <div className="app">
            <header className="top">
                <img src="icon.svg" alt="" />
                <div>
                    <h1>{app.label}</h1>
                    <p>sd-computers app template · {STACK}</p>
                </div>
                <div className="where">
                    <b>{machine.label}</b>
                    <span>{machine.hostname} · {user.name}</span>
                </div>
            </header>

            <main className="grid">
                <section className="card">
                    <div className="card-head">
                        <span className="card-title">From your game</span>
                        <span className="tag">fetchNui</span>
                        <button type="button" className="link" onClick={loadGame}>Refresh</button>
                    </div>
                    <Row k="Player" v={game?.playerName} />
                    <Row k="Server ID" v={game?.serverId} />
                    <Row k="Street" v={game?.street} />
                    <Row k="In-game time" v={game?.time} />
                    <p className="hint">Answered by client.lua's getExampleData NUI callback.</p>
                </section>

                <section className="card">
                    <div className="card-head">
                        <span className="card-title">From the server</span>
                        <span className="tag">callServer</span>
                        <button type="button" className="link" onClick={loadServer}>Refresh</button>
                    </div>
                    <Row k="You" v={server?.you} />
                    <Row k="Computer" v={server && `${server.computer} (${server.hostname})`} />
                    <Row k="Players online" v={server?.online} />
                    <Row k="Server time" v={server?.time} />
                    {serverError && <p className="error">{serverError}</p>}
                    <p className="hint">Answered by the example:status endpoint in server.lua.</p>
                </section>

                <section className="card wide">
                    <div className="card-head">
                        <span className="card-title">Notes</span>
                        <span className="tag">storage</span>
                        <span className="hint" style={{ margin: '0 0 0 auto' }}>{notesState}</span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => changeNotes(e.target.value)}
                        placeholder="Type anything. It is kept for this character, on every computer."
                    />
                </section>

                <section className="card wide">
                    <div className="card-head">
                        <span className="card-title">Pushed from Lua</span>
                        <span className="tag">onMessage</span>
                    </div>
                    <div className={ping ? 'ping' : 'ping empty'}>{ping ?? 'Nothing yet.'}</div>
                    <p className="hint">Run {PING} hello in chat or the server console.</p>
                </section>
            </main>

            <footer className="actions">
                <button type="button" className="btn primary" onClick={notify}>Notify</button>
                <button type="button" className="btn" onClick={clearNotes}>Confirm</button>
                <button type="button" className="btn" onClick={ask}>Ask</button>
                <button type="button" className="btn" onClick={menu}>Menu</button>
                <button type="button" className="btn" onClick={addBadge}>Badge +1</button>
                <button type="button" className="btn" onClick={print} disabled={!computer.supports('print')}>Print notes</button>
                <button type="button" className="btn" onClick={mail}>Open Mail</button>
                <span className="result">{result}</span>
            </footer>
        </div>
    );
}

function Row({ k, v }) {
    return (
        <div className="row">
            <span className="k">{k}</span>
            <span className="v">{v ?? '-'}</span>
        </div>
    );
}
