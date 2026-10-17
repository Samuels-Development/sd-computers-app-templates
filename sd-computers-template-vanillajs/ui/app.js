// sd-computers example app (Vanilla JS): no framework and no build step.
//
// Everything starts once the computer is ready (computer.js). Each card and button uses one part
// of the SDK; the reference for all of it is https://docs.samueldev.shop/resources/computers/custom-apps
(function () {
    'use strict';

    var STACK = 'Vanilla JS';
    var PING = '/computerping_vanilla';

    var $ = function (id) {
        return document.getElementById(id);
    };

    var computer = null;
    var badge = 0;
    var saving = 0;

    function show(id, value) {
        $(id).textContent = value === undefined || value === null ? '-' : String(value);
    }

    function say(text) {
        $('result').textContent = text;
    }

    // Page -> client: this resource's own NUI callback (client.lua).
    function loadGame() {
        computer.fetchNui('getExampleData').then(function (d) {
            if (!d) return say('client.lua did not answer.');
            show('player', d.playerName);
            show('serverId', d.serverId);
            show('street', d.street);
            show('gameTime', d.time);
        });
    }

    // Page -> server: an endpoint registered with the app (server.lua). It rejects with the
    // endpoint's own message when it says no.
    function loadServer() {
        $('serverError').hidden = true;
        computer.callServer('example:status').then(
            function (d) {
                show('you', d.you);
                show('computer', d.computer + ' (' + d.hostname + ')');
                show('online', d.online);
                show('serverTime', d.time);
            },
            function (err) {
                $('serverError').textContent = err.message;
                $('serverError').hidden = false;
            },
        );
    }

    // Kept a moment after typing stops. Until it is, closing the window (or standing up) asks first.
    function notesChanged() {
        $('notesState').textContent = 'Saving...';
        computer.window.preventClose('Your notes are still being saved.');
        clearTimeout(saving);
        saving = setTimeout(function () {
            computer.storage.set('notes', $('notes').value).then(function (ok) {
                $('notesState').textContent = ok ? 'Saved' : 'Could not save';
                computer.window.preventClose(false);
            });
        }, 600);
    }

    function clearNotes() {
        computer.dialog
            .confirm({
                title: 'Clear the notes?',
                message: 'They go for good, on every computer.',
                confirmLabel: 'Clear',
                danger: true,
            })
            .then(function (yes) {
                if (!yes) return say('Kept the notes.');
                $('notes').value = '';
                computer.storage.set('notes', '');
                say('Cleared the notes.');
            });
    }

    function notify() {
        computer.notify({ title: computer.app.label, body: 'Hello from the ' + STACK + ' template.' });
    }

    function wire() {
        $('refreshGame').addEventListener('click', loadGame);
        $('refreshServer').addEventListener('click', loadServer);
        $('notes').addEventListener('input', notesChanged);
        $('notify').addEventListener('click', notify);
        $('confirm').addEventListener('click', clearNotes);

        $('ask').addEventListener('click', function () {
            computer.dialog.prompt({ title: 'Your call sign', message: 'Anything will do.', placeholder: 'Unit 12' }).then(function (answer) {
                say(answer === null ? 'You cancelled.' : 'You answered: ' + answer);
            });
        });

        // The desktop's own context menu, opened under the button. Each item's onClick runs when picked.
        $('menu').addEventListener('click', function (e) {
            var r = e.currentTarget.getBoundingClientRect();
            computer.menu({ clientX: r.left, clientY: r.bottom + 4 }, [
                { label: 'Refresh both cards', onClick: function () { loadGame(); loadServer(); say('Refreshed.'); } },
                { label: 'Send a notification', onClick: notify },
                { label: 'Clear the badge', disabled: badge === 0, onClick: function () { badge = 0; computer.setBadge(0); say('Badge cleared.'); } },
                { separator: true },
                { label: 'Clear the notes', danger: true, onClick: clearNotes },
            ]);
        });

        // The count on the app's icon (taskbar, dock, desktop). It stays with this player.
        $('badge').addEventListener('click', function () {
            badge += 1;
            computer.setBadge(badge);
            say('Badge: ' + badge);
        });

        // A plain typed page to a printer near the computer (the print dialog picks which).
        $('print').addEventListener('click', function () {
            computer.print({ title: computer.app.label + ' notes', text: $('notes').value || '(no notes yet)' }).then(function (sent) {
                say(sent ? 'Sent to the printer.' : 'Not printed.');
            });
        });

        $('mail').addEventListener('click', function () {
            computer.openApp('mail', { subject: 'Sent from ' + computer.app.label }).catch(function (err) {
                say(err.message);
            });
        });
    }

    window.whenComputer().then(function (c) {
        computer = c;

        $('label').textContent = c.app.label;
        $('stack').textContent = 'sd-computers app template · ' + STACK;
        show('machine', c.machine.label);
        show('who', c.machine.hostname + ' · ' + c.user.name);
        $('pingHint').textContent = 'Run ' + PING + ' hello in chat or the server console.';
        $('print').disabled = !c.supports('print');

        loadGame();
        loadServer();
        c.storage.get('notes', '').then(function (notes) {
            $('notes').value = notes || '';
        });

        // Server -> page: what /computerping_vanilla sends (server.lua, SendAppMessage).
        c.onMessage('ping', function (d) {
            $('ping').textContent = d.text + ' (from ' + d.from + ')';
            $('ping').classList.remove('empty');
        });

        wire();
    });
})();
