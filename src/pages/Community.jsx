import React, { useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  GraduationCap,
  Plus,
  Search,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import {
  DEMO_DISCUSSIONS,
  DISCUSSION_CATEGORIES,
} from "../data/communityDiscussions";
import DiscussionCard from "./DiscussionCard.jsx";
import {
  loadCommunityState,
  persistCommunityState,
} from "../services/communityStorage";
import "./community.css";

const GROUPS = ["All groups", "MSBA Class of 2027", "Career Changers"];

function makeId(prefix) {
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
}

function CommunityPage() {
  const [loaded] = useState(() => loadCommunityState());
  const [communityState, setCommunityState] = useState(loaded.state);
  const [storageNotice, setStorageNotice] = useState(loaded.notice);
  const [group, setGroup] = useState("All groups");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [title, setTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [body, setBody] = useState("");
  const discussions = useMemo(
    () => [
      ...communityState.posts,
      ...DEMO_DISCUSSIONS.map((item) => ({
        ...item,
        postedAt: item.postedAt,
      })),
    ],
    [communityState.posts],
  );
  const filteredDiscussions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return discussions.filter((item) => {
      const matchesGroup = group === "All groups" || item.group === group;
      const matchesCategory = category === "All" || item.category === category;
      const searchableText =
        `${item.title} ${item.body} ${item.tag}`.toLocaleLowerCase();
      return (
        matchesGroup &&
        matchesCategory &&
        (!query || searchableText.includes(query))
      );
    });
  }, [category, discussions, group, search]);

  function updateCommunityState(nextState) {
    const result = persistCommunityState(undefined, nextState);
    setCommunityState(nextState);
    setStorageNotice(result.notice);
  }

  function publishDiscussion(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !newCategory || !cleanBody) {
      setFormError("Add a title, choose a category, and write a message.");
      return;
    }
    const post = {
      id: makeId("post"),
      group: group === "All groups" ? "MSBA Class of 2027" : group,
      category: newCategory,
      title: cleanTitle,
      author: "You (Demo)",
      initials: "YD",
      postedAt: "Just now",
      createdAt: new Date().toISOString(),
      body: cleanBody,
      tag: "Community",
      initialReplyCount: 0,
      isDemo: true,
    };
    updateCommunityState({
      ...communityState,
      posts: [post, ...communityState.posts],
    });
    setTitle("");
    setNewCategory("");
    setBody("");
    setFormError("");
    setCategory("All");
    setSearch("");
    setFormOpen(false);
    setExpandedId(post.id);
  }

  function addReply(discussionId, replyBody) {
    const currentReplies = communityState.replies[discussionId] ?? [];
    updateCommunityState({
      ...communityState,
      replies: {
        ...communityState.replies,
        [discussionId]: [
          ...currentReplies,
          {
            id: makeId("reply"),
            discussionId,
            author: "You",
            body: replyBody,
            createdAt: new Date().toISOString(),
            isDemo: true,
          },
        ],
      },
    });
  }

  function toggleSaved(discussionId) {
    const saved = communityState.savedIds.includes(discussionId);
    updateCommunityState({
      ...communityState,
      savedIds: saved
        ? communityState.savedIds.filter((id) => id !== discussionId)
        : [...communityState.savedIds, discussionId],
    });
  }

  return (
    <div className="community-page">
      <header className="community-hero">
        <div className="community-topbar">
          <a
            href="/"
            className="community-brand"
            aria-label="Opportunity Hub home"
          >
            <span className="community-brand-mark">
              <GraduationCap size={22} aria-hidden="true" />
            </span>
            <span>
              <strong>Opportunity Hub</strong>
              <small>USC MARSHALL · MSBA</small>
            </span>
          </a>
          <button
            className="notification-button"
            type="button"
            aria-label="Notifications (demo only)"
            title="Notifications are not connected in this demo"
          >
            <Bell size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="hero-copy">
          <span className="hero-eyebrow">YOUR COHORT. YOUR CONNECTIONS.</span>
          <h1>Community Board</h1>
          <p>Good opportunities are better when shared.</p>
          <button
            className="start-discussion"
            type="button"
            onClick={() => {
              setFormOpen(true);
              setFormError("");
            }}
          >
            <Plus size={19} aria-hidden="true" />
            Start a Discussion
          </button>
        </div>
        <span className="hero-orb hero-orb-one" aria-hidden="true" />
        <span className="hero-orb hero-orb-two" aria-hidden="true" />
      </header>

      <main className="community-main">
        <section className="circle-section" aria-labelledby="circle-heading">
          <div className="section-heading circle-heading">
            <span className="section-icon">
              <UsersRound size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="circle-heading">Find your circle</h2>
              <p>Explore by cohort, background, or interest</p>
            </div>
          </div>
          <div className="filter-panel">
            <label className="group-filter" htmlFor="community-group">
              Community group
              <span className="select-wrap">
                <UsersRound size={16} aria-hidden="true" />
                <select
                  id="community-group"
                  value={group}
                  onChange={(event) => setGroup(event.target.value)}
                >
                  {GROUPS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </label>
            <label className="search-filter" htmlFor="discussion-search">
              Search conversations
              <span className="search-wrap">
                <Search size={17} aria-hidden="true" />
                <input
                  id="discussion-search"
                  type="search"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="clear-search"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </span>
            </label>
          </div>
        </section>

        {formOpen && (
          <section
            className="new-discussion-panel"
            aria-labelledby="new-post-heading"
          >
            <div className="new-post-heading">
              <div>
                <span className="form-kicker">DEMO POST</span>
                <h2 id="new-post-heading">Start a discussion</h2>
              </div>
              <button
                type="button"
                className="close-form"
                aria-label="Close discussion form"
                onClick={() => {
                  setFormOpen(false);
                  setFormError("");
                }}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <p className="form-description">
              Share with your cohort. Posts are stored only in this browser.
            </p>
            <form className="discussion-form" onSubmit={publishDiscussion}>
              <label htmlFor="new-discussion-title">
                Discussion title <span aria-hidden="true">*</span>
                <input
                  id="new-discussion-title"
                  autoFocus
                  required
                  maxLength={140}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What would you like to talk about?"
                />
              </label>
              <label htmlFor="new-discussion-category">
                Category <span aria-hidden="true">*</span>
                <select
                  id="new-discussion-category"
                  required
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                >
                  <option value="">Choose a category</option>
                  {DISCUSSION_CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="new-discussion-message">
                Message <span aria-hidden="true">*</span>
                <textarea
                  id="new-discussion-message"
                  required
                  maxLength={2000}
                  rows={5}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Share context, ask a question, or pass along a helpful lead..."
                />
              </label>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="new-post-actions">
                <button
                  className="cancel-post"
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setFormError("");
                  }}
                >
                  Cancel
                </button>
                <button className="publish-post" type="submit">
                  <Send size={16} aria-hidden="true" />
                  Publish Demo Post
                </button>
              </div>
            </form>
          </section>
        )}

        <section
          className="discussions-section"
          aria-labelledby="discussions-heading"
        >
          <div className="discussion-section-top">
            <div>
              <h2 id="discussions-heading">Discussions</h2>
              <p className="thread-count">
                {filteredDiscussions.length}{" "}
                {filteredDiscussions.length === 1
                  ? "conversation"
                  : "conversations"}
              </p>
            </div>
            <span className="demo-content-label">
              <CircleHelp size={15} aria-hidden="true" />
              Fictional students, posts, events & reply counts · Demo only
            </span>
          </div>
          <div className="category-filters" aria-label="Filter by category">
            {["All", ...DISCUSSION_CATEGORIES].map((item) => {
              const selected = category === item;
              return (
                <button
                  className={`category-chip ${selected ? "selected" : ""}`}
                  type="button"
                  aria-pressed={selected}
                  key={item}
                  onClick={() => setCategory(item)}
                >
                  {selected && <Check size={14} aria-hidden="true" />}
                  {item}
                </button>
              );
            })}
          </div>

          {storageNotice && (
            <p className="community-notice" role="status">
              {storageNotice}
            </p>
          )}
          <div className="discussion-list" aria-live="polite">
            {filteredDiscussions.length ? (
              filteredDiscussions.map((item) => (
                <DiscussionCard
                  key={item.id}
                  discussion={item}
                  replies={communityState.replies[item.id] ?? []}
                  saved={communityState.savedIds.includes(item.id)}
                  expanded={expandedId === item.id}
                  onToggle={(id) =>
                    setExpandedId((current) => (current === id ? "" : id))
                  }
                  onReply={addReply}
                  onSave={toggleSaved}
                />
              ))
            ) : (
              <div className="empty-state">
                <Search size={23} aria-hidden="true" />
                <h3>No conversations found</h3>
                <p>Try another search or adjust your filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="community-nav" aria-label="Main navigation">
        <a className="nav-item" href="/" aria-label="Home">
          <span className="nav-icon">
            <GraduationCap size={19} aria-hidden="true" />
          </span>
          <span>Home</span>
        </a>
        <button
          className="nav-item planned-nav"
          type="button"
          disabled
          title="Events are planned"
        >
          <span className="nav-icon">
            <Compass size={19} aria-hidden="true" />
          </span>
          <span>Events</span>
        </button>
        <button
          className="nav-item planned-nav"
          type="button"
          disabled
          title="Assistant is planned"
        >
          <span className="nav-icon">
            <Sparkles size={19} aria-hidden="true" />
          </span>
          <span>Assistant</span>
        </button>
        <a className="nav-item active" href="/community" aria-current="page">
          <span className="nav-icon">
            <UsersRound size={19} aria-hidden="true" />
          </span>
          <span>Community</span>
        </a>
        <a className="nav-item" href="/" aria-label="Profile">
          <span className="nav-icon profile-nav-icon" aria-hidden="true">
            P
          </span>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
}

export default CommunityPage;
