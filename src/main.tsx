
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set favicon dynamically
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = '/lovable-uploads/ed6dc4fc-70bd-4ee0-aa8e-01c89f7c45f3.png';
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
