import { mount } from 'svelte';
import App from './App.svelte';
import { whenComputer } from './computer';
import './style.css';

// Drawn once the computer is ready (at once in a plain browser tab, with the stand-in).
whenComputer().then((computer) => {
    mount(App, { target: document.getElementById('app'), props: { computer } });
});
