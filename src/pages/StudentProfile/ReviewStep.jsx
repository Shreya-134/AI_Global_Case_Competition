import { Button, Card } from "../../components/ui";
import { resolveOptionLabels, sectionHasData } from "../../profile/profileLogic.js";

function SummaryCard({ title, items, provided, editLabel, addLabel, emptyText, onEdit, accent }) {
  return (
    <Card className="review-card">
      <div className="review-card__header">
        <h3>{title}</h3>
        <Button onClick={onEdit} variant="secondary">{provided ? editLabel : addLabel}</Button>
      </div>
      {provided ? <ul className="summary-list">{items.map((item) => <li className={item === accent ? "summary-accent" : ""} key={item}>{item === accent ? "★ " : ""}{item}</li>)}</ul> : <p className="empty-state">{emptyText}</p>}
    </Card>
  );
}

export default function ReviewStep({ config, profile, onEdit, onSubmit, onClear }) {
  const backgroundText = profile.background.text.trim();
  const backgroundPreview = backgroundText.length > config.background.reviewPreviewCharacters
    ? `${backgroundText.slice(0, config.background.reviewPreviewCharacters).trimEnd()}…`
    : backgroundText;
  const backgroundItems = [
    backgroundPreview ? `${config.background.textPreviewLabel}: ${backgroundPreview}` : null,
    profile.background.resume ? `${config.background.resumePreviewLabel}: ${profile.background.resume.fileName} · ${config.background.selectedStatus}` : null,
  ].filter(Boolean);
  const topics = [...resolveOptionLabels(profile.interests.topicIds, config.interests.topics), ...profile.interests.customTopics.map((item) => item.label)];
  const eventTypes = resolveOptionLabels(profile.interests.eventTypeIds, config.interests.eventTypes);
  const industries = profile.industries.stillExploring
    ? [config.industries.stillExploringLabel]
    : [...resolveOptionLabels(profile.industries.industryIds, config.industries.options), ...profile.industries.customIndustries.map((item) => item.label)];
  const goals = resolveOptionLabels(profile.career.goalIds, config.career.goals);
  const priority = config.career.goals.find((goal) => goal.id === profile.career.priorityGoalId)?.label;
  const distance = config.carpool.distances.find((item) => item.id === profile.carpool.meetingDistanceId)?.label;
  const preferred = resolveOptionLabels(profile.schedule.preferredTimeIds, config.schedule.preferredTimes);
  const busySummary = `${profile.schedule.busyBlocks.length} ${profile.schedule.busyBlocks.length === 1 ? config.review.busyBlockLabel : config.review.busyBlocksLabel}`;
  const countFor = (sources) => profile.schedule.busyBlocks.filter((item) => sources.includes(item.sourceId || item.source)).length;
  const sourceCounts = [
    profile.schedule.providerConnections.google.selectedCalendarIds.length
      ? `${config.schedule.googleSourceLabel}: ${config.schedule.states[profile.schedule.providerConnections.google.status]} · ${countFor(["google"])} ${countFor(["google"]) === 1 ? config.review.busyBlockLabel : config.review.busyBlocksLabel}` : null,
    profile.schedule.uploadedCalendars.some((item) => item.sourceId === "apple")
      ? `${config.schedule.appleSourceLabel}: ${countFor(["apple"])} ${countFor(["apple"]) === 1 ? config.review.busyBlockLabel : config.review.busyBlocksLabel}` : null,
    profile.schedule.uploadedCalendars.some((item) => item.sourceId === "calendar-file") || countFor(["calendar-import"])
      ? `${config.schedule.importSourceLabel}: ${countFor(["calendar-file", "calendar-import"])} ${countFor(["calendar-file", "calendar-import"]) === 1 ? config.review.busyBlockLabel : config.review.busyBlocksLabel}` : null,
    countFor(["manual"]) ? `${config.schedule.manualSourceLabel}: ${countFor(["manual"])} ${countFor(["manual"]) === 1 ? config.review.busyBlockLabel : config.review.busyBlocksLabel}` : null,
  ].filter(Boolean);

  return (
    <div className="step-stack">
      <div className="completion-banner"><span aria-hidden="true">✓</span><strong>{config.copy.setupComplete}</strong></div>
      <div className="review-grid">
        <SummaryCard addLabel={config.buttons.addSection} editLabel={config.buttons.edit} emptyText={config.copy.notProvided} items={backgroundItems} onEdit={() => onEdit(0)} provided={sectionHasData(profile, "background")} title={config.review.backgroundTitle} />
        <SummaryCard addLabel={config.buttons.addSection} editLabel={config.buttons.edit} emptyText={config.copy.notProvided} items={[...(topics.length ? [`${config.review.topicsLabel}: ${topics.join(", ")}`] : []), ...(eventTypes.length ? [`${config.review.eventTypesLabel}: ${eventTypes.join(", ")}`] : [])]} onEdit={() => onEdit(1)} provided={sectionHasData(profile, "interests")} title={config.review.interestsTitle} />
        <SummaryCard addLabel={config.buttons.addSection} editLabel={config.buttons.edit} emptyText={config.copy.notProvided} items={industries} onEdit={() => onEdit(2)} provided={sectionHasData(profile, "industries")} title={config.review.industriesTitle} />
        <SummaryCard accent={priority} addLabel={config.buttons.addSection} editLabel={config.buttons.edit} emptyText={config.copy.notProvided} items={goals} onEdit={() => onEdit(3)} provided={sectionHasData(profile, "career")} title={config.review.careerTitle} />
        <SummaryCard addLabel={config.buttons.addSection} editLabel={config.buttons.edit} emptyText={config.copy.notProvided} items={[profile.carpool.startingPoint, distance].filter(Boolean)} onEdit={() => onEdit(4)} provided={sectionHasData(profile, "carpool")} title={config.review.carpoolTitle} />
        <SummaryCard addLabel={config.buttons.addSection} editLabel={config.buttons.edit} emptyText={config.copy.notProvided} items={[`${config.review.timezoneLabel}: ${profile.schedule.timezone}`, `${config.review.preferredLabel}: ${preferred.join(", ") || config.copy.notProvided}`, busySummary, ...sourceCounts, ...(profile.schedule.varies ? [config.schedule.variesLabel] : [])]} onEdit={() => onEdit(5)} provided={sectionHasData(profile, "schedule")} title={config.review.scheduleTitle} />
      </div>
      <div className="review-actions">
        <Button onClick={onSubmit}>{config.buttons.findEvents}</Button>
        <Button onClick={onClear} variant="secondary">{config.buttons.clearProfile}</Button>
      </div>
    </div>
  );
}

