import React, { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  MessageCircle,
  Send,
} from "lucide-react";

function DiscussionCard({
  discussion,
  replies,
  saved,
  expanded,
  onToggle,
  onReply,
  onSave,
}) {
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState("");
  const replyCount = discussion.initialReplyCount + replies.length;
  const canSave =
    discussion.category === "Events & Meetups" ||
    discussion.category === "Event Reviews";

  function submitReply(event) {
    event.preventDefault();
    const body = reply.trim();
    if (!body) {
      setReplyError("Write a reply before posting.");
      return;
    }
    onReply(discussion.id, body);
    setReply("");
    setReplyError("");
  }

  return (
    <article className={`discussion-card ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="discussion-summary"
        aria-expanded={expanded}
        aria-controls={`thread-${discussion.id}`}
        onClick={() => onToggle(discussion.id)}
      >
        <span className="avatar" aria-hidden="true">
          {discussion.initials}
        </span>
        <span className="discussion-content">
          <span className="discussion-meta">
            <strong>{discussion.author}</strong>
            <span>{discussion.group}</span>
            <span aria-hidden="true">·</span>
            <span>{discussion.postedAt}</span>
            <span className="demo-badge">Demo</span>
          </span>
          <span className="discussion-title">{discussion.title}</span>
          <span className="discussion-preview">{discussion.body}</span>
          <span className="discussion-card-footer">
            <span className="topic-tag">{discussion.tag}</span>
            <span className="reply-count">
              <MessageCircle size={15} aria-hidden="true" />
              {replyCount} replies
            </span>
          </span>
        </span>
        <span className="open-label">
          {expanded ? "Close" : "Open"}
          {expanded ? (
            <ChevronDown size={17} aria-hidden="true" />
          ) : (
            <ChevronRight size={17} aria-hidden="true" />
          )}
        </span>
      </button>

      {expanded && (
        <section
          className="thread-content"
          id={`thread-${discussion.id}`}
          aria-label={`Discussion thread: ${discussion.title}`}
        >
          <div className="thread-heading">
            <h3>Discussion thread</h3>
            <span>Demo content</span>
          </div>
          <p className="thread-body">{discussion.body}</p>
          <p className="reply-metadata">
            {discussion.initialReplyCount > 0
              ? `${discussion.initialReplyCount} demo replies shown as count metadata only.`
              : replies.length
                ? "Demo replies"
                : "No replies yet."}
          </p>
          {replies.length > 0 && (
            <ul className="reply-list" aria-label="Demo replies">
              {replies.map((item) => (
                <li className="reply-item" key={item.id}>
                  <span className="reply-avatar" aria-hidden="true">
                    Y
                  </span>
                  <div>
                    <strong>You · Just now</strong>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form className="reply-form" onSubmit={submitReply}>
            <label htmlFor={`reply-${discussion.id}`}>Add a reply</label>
            <textarea
              id={`reply-${discussion.id}`}
              value={reply}
              maxLength={1000}
              onChange={(event) => {
                setReply(event.target.value);
                if (replyError) setReplyError("");
              }}
              placeholder="Share a helpful thought..."
              rows={3}
            />
            {replyError && (
              <p className="form-error" role="alert">
                {replyError}
              </p>
            )}
            <button className="reply-submit" type="submit">
              <Send size={16} aria-hidden="true" />
              Post Demo Reply
            </button>
          </form>
          {canSave && (
            <aside className="opportunity-panel">
              <div className="opportunity-icon">
                <Compass size={19} aria-hidden="true" />
              </div>
              <div className="opportunity-copy">
                <h4>Turn discussions into opportunities</h4>
                <p>
                  In the full app, verified event details can be attached to a
                  thread and sent to the AI weekly planner.
                </p>
                <button
                  type="button"
                  className={`save-discussion ${saved ? "is-saved" : ""}`}
                  aria-pressed={saved}
                  onClick={() => onSave(discussion.id)}
                >
                  {saved ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <Bookmark size={16} aria-hidden="true" />
                  )}
                  {saved ? "Saved to demo list" : "Save discussion"}
                </button>
                <p className="save-note">
                  Saves this discussion only. It does not add an event to your
                  calendar or schedule it with AI.
                </p>
              </div>
            </aside>
          )}
        </section>
      )}
    </article>
  );
}

export default DiscussionCard;
