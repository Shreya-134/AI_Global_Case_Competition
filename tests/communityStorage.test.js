import test from "node:test";
import assert from "node:assert/strict";
import {
  COMMUNITY_STORAGE_KEY,
  emptyCommunityState,
  loadCommunityState,
  persistCommunityState,
} from "../src/services/communityStorage.js";

const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test("community posts, replies, and saved discussions persist independently", () => {
  const storage = memory();
  const state = {
    posts: [
      {
        id: "post-1",
        title: "Demo post",
        body: "A demo message",
        category: "Events & Meetups",
        group: "MSBA Class of 2027",
        tag: "Community",
        createdAt: "2026-10-23T14:00:00.000Z",
      },
    ],
    replies: {
      "post-1": [
        {
          id: "reply-1",
          body: "A demo reply",
          createdAt: "2026-10-23T14:01:00.000Z",
        },
      ],
    },
    savedIds: ["demo-sophia-product-ai-night"],
  };

  assert.deepEqual(persistCommunityState(storage, state), {
    success: true,
    notice: "",
  });
  assert.deepEqual(loadCommunityState(storage), { state, notice: "" });
  assert.ok(storage.getItem(COMMUNITY_STORAGE_KEY));
});

test("missing or invalid community data recovers with a visible notice", () => {
  const storage = memory();
  assert.deepEqual(loadCommunityState(storage), {
    state: emptyCommunityState(),
    notice: "",
  });

  storage.setItem(COMMUNITY_STORAGE_KEY, "{");
  const restored = loadCommunityState(storage);
  assert.deepEqual(restored.state, emptyCommunityState());
  assert.match(restored.notice, /could not be read/);
});

test("blocked storage operations return visible failure states", () => {
  const blockedStorage = {
    getItem() {
      throw new Error("Blocked");
    },
    setItem() {
      throw new Error("Quota");
    },
  };

  assert.match(loadCommunityState(blockedStorage).notice, /could not be read/);
  const result = persistCommunityState(blockedStorage, emptyCommunityState());
  assert.equal(result.success, false);
  assert.match(result.notice, /unavailable/);
});
