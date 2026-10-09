import { render } from "solid-yield";

import { App } from "./index.ts";
import "./style.css";

const root = document.getElementById("app");

if (root === null) {
  throw new Error("The application root is missing.");
}

render(App, root);
