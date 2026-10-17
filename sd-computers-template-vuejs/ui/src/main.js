import { createApp } from 'vue';
import App from './App.vue';
import { whenComputer } from './computer';
import './style.css';

// Drawn once the computer is ready (at once in a plain browser tab, with the stand-in).
whenComputer().then((computer) => {
    createApp(App, { computer }).mount('#app');
});
