import "./assets/main.css";

import { clerkPlugin } from "@clerk/vue";
import { createApp } from "vue";

import { accountsAvailable, clerkKey } from "./accounts";
import App from "./App.vue";

const app = createApp(App);
if (accountsAvailable) app.use(clerkPlugin, { publishableKey: clerkKey! });
app.mount("#app");
