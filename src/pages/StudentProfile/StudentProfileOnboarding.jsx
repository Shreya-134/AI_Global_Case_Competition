import { useEffect, useRef, useState } from "react";
import { Button, Card } from "../../components/ui";
import { onboardingConfig } from "../../config/onboardingConfig";
import { createInitialProfile } from "../../profile/profileSchema.js";
import { getStepAfterSave, markSectionSkipped, validateCareer } from "../../profile/profileLogic.js";
import { clearStoredProfile, loadProfileDraft, loadSavedProfile, saveProfile, saveProfileDraft } from "../../services/profileStorage.js";
import StepActions from "./components/StepActions";
import ProfessionalBackgroundStep from "./steps/ProfessionalBackgroundStep";
import ProfessionalInterestsStep from "./steps/ProfessionalInterestsStep";
import IndustriesStep from "./steps/IndustriesStep";
import CareerGoalsStep from "./steps/CareerGoalsStep";
import CarpoolStep from "./steps/CarpoolStep";
import ScheduleStep from "./steps/ScheduleStep";
import ReviewStep from "./ReviewStep";
import "./StudentProfileOnboarding.css";

const REVIEW_INDEX = 6;
const ONBOARDING_STEP_COUNT = 6;

function initialState() {
  const draft = loadProfileDraft();
  if (draft.value) return { profile: draft.value, storageAvailable: draft.available };
  const saved = loadSavedProfile();
  return { profile: saved.value || createInitialProfile(), storageAvailable: draft.available && saved.available };
}

export default function StudentProfileOnboarding() {
  const config = onboardingConfig;
  const [{ profile: initialProfile, storageAvailable: initialStorage }] = useState(initialState);
  const [profile, setProfile] = useState(initialProfile);
  const [storageAvailable, setStorageAvailable] = useState(initialStorage);
  const [stepIndex, setStepIndex] = useState(0);
  const [returnToReview, setReturnToReview] = useState(false);
  const [careerError, setCareerError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeNotRetained, setResumeNotRetained] = useState(false);
  const [saved, setSaved] = useState(false);
  const headingRef = useRef(null);
  const step = config.steps[stepIndex];

  useEffect(() => { document.title = `${step.heading} · ${config.productName}`; }, [config.productName, step.heading]);
  useEffect(() => { headingRef.current?.focus(); }, [stepIndex]);
  useEffect(() => {
    if (!saved && !saveProfileDraft(profile)) setStorageAvailable(false);
  }, [profile, saved]);

  const updateSection = (sectionId, value) => {
    setProfile((current) => ({
      ...current,
      [sectionId]: value,
      sectionStatus: { ...current.sectionStatus, [sectionId]: "in-progress" },
    }));
  };

  const advance = () => {
    if (step.id === "career" && validateCareer(profile.career)) {
      setCareerError("priority-required"); return;
    }
    setCareerError("");
    setProfile((current) => ({
      ...current,
      sectionStatus: stepIndex < REVIEW_INDEX
        ? { ...current.sectionStatus, [step.id]: "complete" }
        : current.sectionStatus,
    }));
    const next = getStepAfterSave(stepIndex, returnToReview, REVIEW_INDEX);
    setStepIndex(next); setReturnToReview(false);
  };

  const skip = () => {
    setCareerError("");
    setProfile((current) => markSectionSkipped(current, step.id));
    setStepIndex(returnToReview ? REVIEW_INDEX : Math.min(stepIndex + 1, REVIEW_INDEX));
    setReturnToReview(false);
  };

  const submit = () => {
    if (validateCareer(profile.career)) { setCareerError("priority-required"); setStepIndex(3); return; }
    const hadSessionResume = Boolean(resumeFile && profile.background.resume);
    const completed = { ...profile, background: { ...profile.background, text: profile.background.text.trim(), resume: null }, setupComplete: true, completedAt: new Date().toISOString() };
    if (!saveProfile(completed)) { setStorageAvailable(false); return; }
    setProfile(completed);
    setResumeFile(null); setResumeNotRetained(hadSessionResume);
    setSaved(true);
    if (config.eventDiscoveryRoute) window.location.assign(config.eventDiscoveryRoute);
  };

  const clearProfile = () => {
    if (!window.confirm(config.copy.clearConfirmation)) return;
    const cleared = clearStoredProfile(); setProfile(createInitialProfile()); setResumeFile(null); setResumeNotRetained(false); setStepIndex(0);
    setReturnToReview(false); setCareerError(""); setSaved(false); setStorageAvailable(cleared);
  };

  if (saved && !config.eventDiscoveryRoute) {
    return (
      <main className="onboarding-page onboarding-page--centered">
        <Card className="saved-confirmation" elevated>
          <div className="completion-icon" aria-hidden="true">✓</div>
          <h1>{config.copy.savedTitle}</h1><p>{config.copy.savedBody}</p>
          {resumeNotRetained ? <p className="storage-message" role="status">{config.background.notRetainedAfterSave}</p> : null}
          <p className="field-helper">{config.copy.routePending}</p>
          <Button onClick={() => { setSaved(false); setStepIndex(REVIEW_INDEX); }}>{config.buttons.editProfile}</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <a className="onboarding-brand" href="/">{config.productName}</a>
        <button className="clear-profile-link" onClick={clearProfile} type="button">{config.buttons.clearProfile}</button>
      </header>
      <div className="onboarding-progress" aria-label={stepIndex === REVIEW_INDEX ? config.copy.reviewLabel : `${config.copy.stepLabel} ${stepIndex + 1} ${config.copy.ofLabel} ${ONBOARDING_STEP_COUNT}`}>
        <div className="progress-copy"><span>{stepIndex === REVIEW_INDEX ? config.copy.reviewLabel : `${config.copy.stepLabel} ${stepIndex + 1} ${config.copy.ofLabel} ${ONBOARDING_STEP_COUNT}`}</span><span>{Math.round(((stepIndex + 1) / (REVIEW_INDEX + 1)) * 100)}%</span></div>
        <div className="progress-track"><span style={{ width: `${((stepIndex + 1) / (REVIEW_INDEX + 1)) * 100}%` }} /></div>
      </div>
      <Card className="onboarding-card" elevated>
        <div className="step-heading">
          <div className="step-title-line"><h1 ref={headingRef} tabIndex={-1}>{step.heading}</h1>{step.optional ? <span className="optional-badge">{config.carpool.optionalBadge}</span> : null}</div>
          <p>{step.description}</p>
        </div>
        {!storageAvailable ? <p className="storage-message" role="status">{config.copy.storageUnavailable}</p> : <p className="storage-message">{config.copy.draftNotice}</p>}

        {stepIndex === 0 ? <ProfessionalBackgroundStep config={config} onChange={(value) => updateSection("background", value)} onResumeFileChange={setResumeFile} resumeFile={resumeFile} value={profile.background} /> : null}
        {stepIndex === 1 ? <ProfessionalInterestsStep config={config} onChange={(value) => updateSection("interests", value)} value={profile.interests} /> : null}
        {stepIndex === 2 ? <IndustriesStep config={config} onChange={(value) => updateSection("industries", value)} value={profile.industries} /> : null}
        {stepIndex === 3 ? <CareerGoalsStep config={config} error={careerError} onChange={(value) => { setCareerError(""); updateSection("career", value); }} value={profile.career} /> : null}
        {stepIndex === 4 ? <CarpoolStep config={config} onChange={(value) => updateSection("carpool", value)} value={profile.carpool} /> : null}
        {stepIndex === 5 ? <ScheduleStep config={config} onChange={(value) => updateSection("schedule", value)} value={profile.schedule} /> : null}
        {stepIndex === REVIEW_INDEX ? <ReviewStep config={config} onClear={clearProfile} onEdit={(index) => { setReturnToReview(true); setStepIndex(index); }} onSubmit={submit} profile={profile} /> : (
          <StepActions canGoBack={stepIndex > 0} config={config} isReviewNext={stepIndex === 5} onBack={() => setStepIndex((index) => Math.max(0, index - 1))} onContinue={advance} onSkip={skip} returnToReview={returnToReview} />
        )}
      </Card>
    </main>
  );
}

