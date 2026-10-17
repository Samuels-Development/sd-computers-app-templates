import { createRoot } from 'react-dom/client';
import App from './App';
import { whenComputer } from './computer';
import './style.css';

// Drawn once the computer is ready (at once in a plain browser tab, with the stand-in).
whenComputer().then((computer) => {
    createRoot(document.getElementById('root')).render(<App computer={computer} />);
});
