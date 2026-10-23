import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Pencil,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  browserStorage,
  loadState,
  persistState,
  steps,
} from "./services/profile";
import "./styles.css";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  createDemoProfile,
} from "./data/demoAccount";

const choices = {
  skills: [
    "Python",
    "SQL",
    "Data visualization",
    "Statistics",
    "Machine learning",
    "Communication",
  ],
  interests: [
    "AI & technology",
    "Business strategy",
    "Product",
    "Social impact",
    "Entrepreneurship",
  ],
  roles: [
    "Data analyst",
    "Business analyst",
    "Data scientist",
    "Product analyst",
    "Consultant",
  ],
  industries: [
    "Technology",
    "Consulting",
    "Finance",
    "Healthcare",
    "Entertainment",
    "Retail",
  ],
  learning: [
    "LLMs & generative AI",
    "Analytics",
    "Leadership",
    "Interview skills",
    "Storytelling",
  ],
  topics: [
    "AI & machine learning",
    "Career development",
    "Analytics",
    "Entrepreneurship",
  ],
  types: ["Workshops", "Networking mixers", "Conferences", "Career panels"],
  formats: ["In person", "Online", "Hybrid"],
};
const availability = [
  "Mon morning",
  "Mon afternoon",
  "Mon evening",
  "Tue morning",
  "Tue afternoon",
  "Tue evening",
  "Wed morning",
  "Wed afternoon",
  "Wed evening",
  "Thu morning",
  "Thu afternoon",
  "Thu evening",
  "Fri morning",
  "Fri afternoon",
  "Fri evening",
  "Sat morning",
  "Sat afternoon",
  "Sat evening",
  "Sun morning",
  "Sun afternoon",
  "Sun evening",
];

function App() {
  const [initial] = useState(() => loadState(browserStorage));
  const [profile, setProfile] = useState(initial.profile);
  const [stage, setStage] = useState(initial.stage);
  const [saved, setSaved] = useState(initial.saved);
  const [notice, setNotice] = useState(initial.notice);
  const [storageError, setStorageError] = useState(false);
  const [login, setLogin] = useState(
    initial.stage === -1 || initial.stage === 5,
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [error, setError] = useState("");
  const [demoSession, setDemoSession] = useState(false);
  const beforeDemo = useRef(null);
  const heading = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (demoSession) return;
    setStorageError(!persistState(browserStorage, { profile, stage, saved }));
  }, [profile, stage, saved, demoSession]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [stage, login]);
  const update = (key, value) =>
    setProfile((current) => ({ ...current, [key]: value }));
  const toggle = (key, item) =>
    update(
      key,
      profile[key].includes(item)
        ? profile[key].filter((value) => value !== item)
        : [...profile[key], item],
    );
  const move = (next) => {
    setError("");
    setNotice("");
    setStage(next);
  };
  const submit = (event) => {
    event.preventDefault();
    if (login) {
      if (loginEmail.trim().toLowerCase() === DEMO_EMAIL) {
        if (password !== DEMO_PASSWORD) {
          setError(
            "That demo password does not match. Use the credentials shown below.",
          );
          return;
        }
        beforeDemo.current = { profile, stage };
        setDemoSession(true);
        setProfile(createDemoProfile());
        setPassword("");
        setLogin(false);
        move(5);
        return;
      }
      if (
        !saved ||
        saved.email.toLowerCase() !== loginEmail.trim().toLowerCase()
      ) {
        setError(
          "No matching demo profile was found in this browser. Use the email you saved here, or create a demo profile.",
        );
        return;
      }
      setPassword("");
      setProfile(saved);
      setLogin(false);
      move(5);
      return;
    }
    if (stage === -1) {
      if (
        !profile.name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
      ) {
        setError("Enter your preferred name and a valid email address.");
        return;
      }
      setProfile((current) => ({
        ...current,
        name: current.name.trim(),
        email: current.email.trim(),
      }));
    }
    if (stage === 3 && !profile.availability.length) {
      setError(
        "Choose at least one available time block so a future plan can fit your week.",
      );
      return;
    }
    if (stage === 4) setSaved({ ...profile });
    move(stage + 1);
  };
  const chips = (key, label, options = choices[key]) => (
    <fieldset>
      <legend>
        {label} <span className="optional">Optional · choose any</span>
      </legend>
      <div className="chips">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={profile[key].includes(item)}
            className={`chip ${profile[key].includes(item) ? "selected" : ""}`}
            onClick={() => toggle(key, item)}
          >
            {profile[key].includes(item) && (
              <Check size={14} aria-hidden="true" />
            )}
            {item}
          </button>
        ))}
      </div>
    </fieldset>
  );
  const select = (key, label, options, hint) => (
    <label className="field">
      {label}
      <select
        value={profile[key]}
        onChange={(event) => update(key, event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
  const review = (label, value, target) => (
    <div className="review-row">
      <div>
        <strong>{label}</strong>
        <p>{value || "No preference yet"}</p>
      </div>
      <button
        className="icon-button"
        type="button"
        aria-label={`Edit ${label}`}
        onClick={() => move(target)}
      >
        <Pencil size={17} />
      </button>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="./" className="brand" aria-label="MSBA Opportunity Hub">
          <span className="brand-mark">
            <GraduationCap size={24} />
          </span>
          <span>
            opportunity<span className="brand-light">hub</span>
            <small>USC MARSHALL · MSBA 2027</small>
          </span>
        </a>
      </header>
      <main className="layout">
        <section className="form-card" aria-label="Demo profile setup">
          <div className="card-top">
            <span className="pill">
              <Sparkles size={13} /> STUDENT ACCESS
            </span>
            <span className="prototype">DEMO</span>
          </div>
          {stage >= 0 && stage < 5 && !login && (
            <div className="progress-section">
              <div>
                <span>Step {stage + 1} of 5</span>
                <span>{steps[stage]}</span>
              </div>
              <progress
                aria-label="Profile setup progress"
                max="5"
                value={stage + 1}
              />
            </div>
          )}
          <div className="card-heading">
            <h1 tabIndex="-1" ref={heading}>
              {login
                ? "Welcome back."
                : stage === -1
                  ? "Create your profile."
                  : stage === 5
                    ? `You’re ready, ${profile.name}.`
                    : steps[stage]}
            </h1>
            <p>
              {login
                ? "Sign in to your networking week."
                : stage === -1
                  ? "Start with your name and email, then personalize your networking week."
                  : stage === 0
                    ? "Start with what makes you, you. You can add to this later."
                    : stage === 1
                      ? "Where would you like your next connection to take you?"
                      : stage === 2
                        ? "Make space for growth without overloading your calendar."
                        : stage === 3
                          ? "Choose when networking fits. You’ll review every plan before it reaches your calendar."
                          : stage === 4
                            ? "A quick check before you begin. You can edit these preferences later."
                            : "Your demo profile is set. Here’s the starting point for your networking week."}
            </p>
          </div>
          <div aria-live="polite">
            {notice && <p className="notice">{notice}</p>}
            {storageError && (
              <p className="notice warning">
                Browser storage is unavailable. You can continue, but your
                progress will be lost when you leave or refresh.
              </p>
            )}
          </div>
          {stage === 5 && !login ? (
            <div className="complete">
              {demoSession && (
                <p className="notice" role="status">
                  Signed in successfully. You’re viewing a sample student
                  profile.
                </p>
              )}
              <div className="success-icon">
                <Check size={26} />
              </div>
              <p className="success-label">
                {demoSession
                  ? "Demo account · Sample data"
                  : storageError
                    ? "Profile ready for this session"
                    : "Profile saved in this browser"}
              </p>
              <div className="summary-card">
                <p>
                  <strong>{profile.hours} hours</strong>
                  <span>Weekly networking target</span>
                </p>
                <p>
                  <strong>
                    {profile.industries.join(", ") || "Open to possibilities"}
                  </strong>
                  <span>Industry interests</span>
                </p>
                <p>
                  <strong>{profile.availability.length} time blocks</strong>
                  <span>
                    Availability · {profile.timezone.replaceAll("_", " ")}
                  </span>
                </p>
              </div>
              <p className="hint">
                This is your profile completion preview. Event discovery, the
                Assistant, and the full dashboard are planned features. No
                events have been added to your calendar.
              </p>
              {!demoSession && (
                <button
                  className="primary"
                  type="button"
                  onClick={() => move(4)}
                >
                  Review profile <ArrowRight size={18} />
                </button>
              )}
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  if (demoSession) {
                    setProfile(beforeDemo.current.profile);
                    setStage(beforeDemo.current.stage);
                    setDemoSession(false);
                  }
                  setLogin(true);
                  setLoginEmail("");
                  setPassword("");
                  setError("");
                }}
              >
                {demoSession ? "Log out of demo" : "Try demo login"}
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              {login ? (
                <>
                  <label className="field">
                    Email address
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      placeholder="you@usc.edu"
                    />
                  </label>
                  <div className="field">
                    <label htmlFor="login-password">Password</label>
                    <span className="password-control">
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter a sample password"
                        aria-describedby="password-hint"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={19} aria-hidden="true" />
                        ) : (
                          <Eye size={19} aria-hidden="true" />
                        )}
                      </button>
                    </span>
                    <span className="hint" id="password-hint">
                      Demo only. Use the sample credentials below.
                    </span>
                  </div>
                  <div className="demo-account">
                    <strong>Just exploring? Try the demo.</strong>
                    <p>
                      Email: <span>{DEMO_EMAIL}</span>
                      <br />
                      Password: <span>{DEMO_PASSWORD}</span>
                    </p>
                    <button
                      type="button"
                      className="demo-fill"
                      onClick={() => {
                        setLoginEmail(DEMO_EMAIL);
                        setPassword(DEMO_PASSWORD);
                        setError("");
                        setNotice(
                          "Demo credentials filled in. Select Log in to continue.",
                        );
                      }}
                    >
                      Use demo account
                    </button>
                  </div>
                </>
              ) : stage === -1 ? (
                <>
                  <label className="field">
                    Preferred name
                    <input
                      autoComplete="given-name"
                      maxLength="80"
                      required
                      value={profile.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="What should we call you?"
                    />
                  </label>
                  <label className="field">
                    Email address
                    <input
                      type="email"
                      autoComplete="email"
                      maxLength="254"
                      required
                      value={profile.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="you@usc.edu"
                    />
                  </label>
                  <div className="cohort-label">
                    <GraduationCap size={18} />
                    <span>
                      USC Marshall <strong>MSBA Class of 2027</strong>
                    </span>
                    <CheckCircle2 size={16} />
                  </div>
                </>
              ) : stage === 0 ? (
                <>
                  {select("experience", "Background (optional)", [
                    "",
                    "New graduate",
                    "Career switcher",
                    "1–3 years of experience",
                    "4+ years of experience",
                  ])}
                  {chips("skills", "Skills you bring")}
                  {chips("interests", "What sparks your curiosity?")}
                </>
              ) : stage === 1 ? (
                <>
                  {chips("roles", "Roles you’re exploring")}
                  {chips("industries", "Industries you’re drawn to")}
                  {chips("learning", "What would you like to develop?")}
                </>
              ) : stage === 2 ? (
                <>
                  <label className="field" htmlFor="hours">
                    Weekly networking target{" "}
                    <span className="range-value">{profile.hours} hours</span>
                  </label>
                  <input
                    id="hours"
                    type="range"
                    min="1"
                    max="12"
                    value={profile.hours}
                    onChange={(event) =>
                      update("hours", Number(event.target.value))
                    }
                  />
                  <div className="range-labels">
                    <span>1 hour</span>
                    <span>12 hours</span>
                  </div>
                  {chips("topics", "Topics")}
                  {chips("types", "Event types")}
                  {chips("formats", "Event formats")}
                  {select("budget", "Budget per event", [
                    "Free events",
                    "Up to $25",
                    "Up to $50",
                    "Up to $100",
                  ])}
                </>
              ) : stage === 3 ? (
                <>
                  {select("timezone", "Your timezone", [
                    "America/Los_Angeles",
                    "America/Denver",
                    "America/Chicago",
                    "America/New_York",
                    "Pacific/Honolulu",
                    "Asia/Shanghai",
                    "Asia/Kolkata",
                    "Europe/London",
                  ])}
                  <fieldset>
                    <legend>
                      Available time blocks{" "}
                      <span className="required-label">
                        Choose at least one
                      </span>
                    </legend>
                    <p className="hint">
                      Morning 8am–12pm · Afternoon 12–5pm · Evening 5–9pm. All
                      times use your selected timezone.
                    </p>
                    <div className="availability-grid">
                      {availability.map((item) => (
                        <button
                          type="button"
                          key={item}
                          aria-pressed={profile.availability.includes(item)}
                          className={`chip ${profile.availability.includes(item) ? "selected" : ""}`}
                          onClick={() => toggle("availability", item)}
                        >
                          {profile.availability.includes(item) && (
                            <Check size={12} />
                          )}
                          {item}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="field-pair">
                    {select("generationDay", "Plan generation day", [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ])}
                    <label className="field">
                      Preferred time
                      <input
                        type="time"
                        required
                        value={profile.generationTime}
                        onChange={(event) =>
                          update("generationTime", event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <p className="hint">
                    Saved in {profile.timezone}. Recurring generation and
                    notifications will be simulated; nothing runs in the
                    background.
                  </p>
                </>
              ) : (
                <>
                  <div className="review-list">
                    {review(
                      "About you",
                      `${profile.name} · ${profile.email}`,
                      -1,
                    )}
                    {review(
                      "Background & skills",
                      [
                        profile.experience,
                        ...profile.skills,
                        ...profile.interests,
                      ]
                        .filter(Boolean)
                        .join(", "),
                      0,
                    )}
                    {review(
                      "Career direction",
                      [
                        ...profile.roles,
                        ...profile.industries,
                        ...profile.learning,
                      ].join(", "),
                      1,
                    )}
                    {review(
                      "Your networking week",
                      [
                        `${profile.hours} hours · ${profile.budget}`,
                        ...profile.topics,
                        ...profile.types,
                        ...profile.formats,
                      ].join(" · "),
                      2,
                    )}
                    {review(
                      "Availability & generation",
                      `${profile.availability.join(", ")} · ${profile.timezone} · ${profile.generationDay} at ${profile.generationTime}`,
                      3,
                    )}
                  </div>
                  {select(
                    "calendarView",
                    "Preferred calendar view",
                    ["Agenda", "Week"],
                    "Agenda is recommended on mobile. Calendar integration is a future simulation.",
                  )}
                  <div className="privacy-box">
                    <ShieldCheck size={20} />
                    <div>
                      <strong>Private by default</strong>
                      <p>
                        Your calendar stays private. Attendance sharing and
                        carpool participation are separate, optional choices for
                        each approved event. Both start off. Only approximate
                        pickup areas will be used.
                      </p>
                    </div>
                  </div>
                  <p className="hint">
                    Saving this profile does not approve a plan, register you
                    for an event, or connect an external calendar.
                  </p>
                </>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-actions">
                {stage >= 0 && !login && (
                  <button
                    className="back-button"
                    type="button"
                    onClick={() => move(stage - 1)}
                  >
                    <ArrowLeft size={17} /> Back
                  </button>
                )}
                <button className="primary" type="submit">
                  {login
                    ? "Log in"
                    : stage === -1
                      ? "Create demo profile"
                      : stage === 4
                        ? "Save profile and continue"
                        : "Continue"}
                  <ArrowRight size={18} />
                </button>
              </div>
              {(stage === -1 || login) && (
                <>
                  <p className="login-link">
                    {login ? "New here? " : "Already have a demo profile? "}
                    <button
                      type="button"
                      onClick={() => {
                        if (login) move(-1);
                        setLogin(!login);
                        setPassword("");
                        setError("");
                      }}
                    >
                      {" "}
                      {login ? "Create a profile" : "Log in"}
                    </button>
                  </p>
                  <div className="divider" />
                  <p className="privacy-note">
                    <ShieldCheck size={17} />
                    <span>
                      Demo profiles stay in this browser. No secure account or
                      cross-device sync. Use sample details.
                    </span>
                  </p>
                </>
              )}
            </form>
          )}
        </section>
      </main>
      <footer>
        <span>MSBA Opportunity Hub · Competition prototype</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
