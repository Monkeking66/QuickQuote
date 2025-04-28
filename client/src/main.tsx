import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.dir = "rtl";
document.documentElement.lang = "he";

createRoot(document.getElementById("root")!).render(<App />);
