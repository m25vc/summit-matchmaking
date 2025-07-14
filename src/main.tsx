
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set favicon dynamically
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = '/M25_Logo.png';
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
