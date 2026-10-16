import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Fuentes autohospedadas (antes Google Fonts) — elimina la conexión a un tercero y el
// request bloqueante de fonts.googleapis.com. Solo el eje de peso normal (sin cursiva,
// que ya no se usa en el sitio).
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/dm-sans/wght.css';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
