import { createRoot } from "react-dom/client";
import "./lib/i18n";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(<App />);
