import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const host = document.createElement("div");
const shadowRoot = host.attachShadow({ mode: "open" });

const container = document.createElement("div");
container.id = "exporterContainer";

const style = document.createElement("style");
style.innerHTML = "{style_place_holder}";

shadowRoot.appendChild(container);
shadowRoot.appendChild(style);
document.body.appendChild(host);

createApp(App).mount(container);
