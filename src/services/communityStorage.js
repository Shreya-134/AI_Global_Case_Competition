export const COMMUNITY_STORAGE_KEY = "msba-opportunity-hub:community:v1";

export const emptyCommunityState = () => ({
  posts: [],
  replies: {},
  savedIds: [],
});

function validCommunityState(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray(value.posts) &&
      value.posts.every(
        (post) =>
          post &&
          typeof post.id === "string" &&
          typeof post.title === "string" &&
          typeof post.body === "string" &&
          typeof post.category === "string" &&
          typeof post.group === "string" &&
          typeof post.tag === "string" &&
          typeof post.createdAt === "string",
      ) &&
      value.replies &&
      typeof value.replies === "object" &&
      !Array.isArray(value.replies) &&
      Object.values(value.replies).every(
        (replies) =>
          Array.isArray(replies) &&
          replies.every(
            (reply) =>
              reply &&
              typeof reply.id === "string" &&
              typeof reply.body === "string" &&
              typeof reply.createdAt === "string",
          ),
      ) &&
      Array.isArray(value.savedIds) &&
      value.savedIds.every((id) => typeof id === "string"),
  );
}

export function loadCommunityState(storage) {
  try {
    const browserStorage = storage ?? window.localStorage;
    const raw = browserStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) {
      return { state: emptyCommunityState(), notice: "" };
    }
    const data = JSON.parse(raw);
    if (data.version !== 1 || !validCommunityState(data.state)) {
      throw new Error("Saved community data has an unsupported format.");
    }
    return { state: data.state, notice: "" };
  } catch {
    return {
      state: emptyCommunityState(),
      notice:
        "Saved discussion data could not be read. You can continue, but existing demo posts, replies, and saves may not be available.",
    };
  }
}

export function persistCommunityState(storage, state) {
  try {
    const browserStorage = storage ?? window.localStorage;
    browserStorage.setItem(
      COMMUNITY_STORAGE_KEY,
      JSON.stringify({ version: 1, state }),
    );
    return { success: true, notice: "" };
  } catch {
    return {
      success: false,
      notice:
        "Browser storage is unavailable. Your changes will be lost when you refresh or leave this page.",
    };
  }
}
