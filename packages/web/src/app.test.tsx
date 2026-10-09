import { render } from "solid-yield";
import { expect, test } from "vitest";

import { App } from "./index.ts";

test("mounts a real generator component through the Solid Yield plugin", () => {
  const root = document.createElement("div");
  document.body.append(root);
  const dispose = render(App, root);

  try {
    expect(root.querySelector("h1")?.textContent).toBe("Exec");
    expect(root.querySelector("p")?.textContent).toBe(
      "The workspace is ready.",
    );
  } finally {
    dispose();
    root.remove();
  }
});
