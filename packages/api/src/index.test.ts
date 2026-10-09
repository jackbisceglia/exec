import assert from "node:assert/strict";
import { test } from "node:test";
import { Health } from "@exec/core";
import { Schema } from "effect";

import { createHandler } from "./index.ts";

await test("the portable API serves the validated health contract", async () => {
  const { handler, dispose } = createHandler();

  try {
    const response = await handler(new Request("http://localhost/api/health"));
    const body: unknown = await response.json();

    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("content-type") ?? "",
      /application\/json/,
    );
    assert.deepEqual(Schema.decodeUnknownSync(Health)(body), { status: "ok" });
  } finally {
    await dispose();
  }
});

await test("unknown API paths return 404", async () => {
  const { handler, dispose } = createHandler();

  try {
    const response = await handler(new Request("http://localhost/api/missing"));

    assert.equal(response.status, 404);
  } finally {
    await dispose();
  }
});
