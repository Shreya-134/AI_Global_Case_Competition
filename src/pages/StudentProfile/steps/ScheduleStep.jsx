import { useMemo, useRef, useState } from "react";
import { Button, TextInput } from "../../../components/ui";
import { createStableId } from "../../../profile/profileSchema.js";
import { selectPreferredTime, toggleId, validateManualBlock } from "../../../profile/profileLogic.js";
import { parseCalendarText, replaceSourceBlocks, validateCalendarFile } from "../../../services/calendarImport.js";
import { appleCalendarProvider } from "../../../services/calendarProviders/appleCalendarProvider.js";
import { createGoogleCalendarProvider } from "../../../services/calendarProviders/googleCalendarProvider.js";
import { providerStates } from "../../../services/calendarProviders/providerStates.js";
import Choice from "../components/Choice";

function emptyManualBlock(timezone) {
  return { label: "", recurrence: "once", date: "", weekdays: [], startTime: "", endTime: "", startDate: "", endDate: "", timezone };
}

function formatTime(value, allDay) {
  if (allDay) return "All day";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function DateRange({ copy, value, update }) {
  return <div className="form-grid form-grid--two">
    <label className="native-field">{copy.rangeStartLabel}<input onChange={(event) => update({ importRange: { ...value.importRange, start: event.target.value } })} type="date" value={value.importRange.start} /></label>
    <label className="native-field">{copy.rangeEndLabel}<input onChange={(event) => update({ importRange: { ...value.importRange, end: event.target.value } })} type="date" value={value.importRange.end} /></label>
  </div>;
}

export default function ScheduleStep({ config, value, onChange }) {
  const copy = config.schedule;
  const [method, setMethod] = useState("google");
  const [manual, setManual] = useState(() => emptyManualBlock(value.timezone));
  const [editingId, setEditingId] = useState(null);
  const [manualErrors, setManualErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [fileSource, setFileSource] = useState("calendar-file");
  const [fileError, setFileError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [googlePreview, setGooglePreview] = useState([]);
  const [status, setStatus] = useState("");
  const [providerError, setProviderError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const pendingFileSourceRef = useRef("calendar-file");
  const googleProviderRef = useRef(null);
  if (!googleProviderRef.current) googleProviderRef.current = createGoogleCalendarProvider();
  const googleProvider = googleProviderRef.current;
  const google = value.providerConnections.google;
  const googleNeedsReconnect = Boolean(google.calendars.length && !googleProvider.hasSession);

  const timezoneOptions = useMemo(() => [...new Set([value.timezone, "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "UTC"].filter(Boolean))], [value.timezone]);
  const update = (patch) => onChange({ ...value, ...patch });
  const updateGoogle = (patch) => update({ providerConnections: { ...value.providerConnections, google: { ...google, ...patch } } });
  const message = (code) => copy.validation[code] || code || "";
  const chooseFile = () => fileInputRef.current?.click();
  const beginFile = (sourceId = "calendar-file") => { pendingFileSourceRef.current = sourceId; setFileSource(sourceId); setMethod("file"); setTimeout(chooseFile, 0); };
  const clearFile = () => { setFileName(""); setFileError(""); setWarnings([]); setFilePreview([]); setStatus(""); };

  const handleFile = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; clearFile();
    const errorCode = validateCalendarFile(file, copy.maxFileSizeBytes);
    if (errorCode) { setFileError(message(errorCode)); return; }
    setFileName(file.name); setFileSource(pendingFileSourceRef.current); setLoading(true);
    try {
      const result = parseCalendarText(await file.text(), { rangeStart: value.importRange.start, rangeEnd: value.importRange.end });
      setFilePreview(result.blocks); setWarnings(result.warnings);
      if (!result.blocks.length) setFileError(message("no-events"));
    } catch (error) { setFileError(message(error.code || error.message)); }
    finally { setLoading(false); }
  };

  const confirmFile = () => {
    const providerConnections = fileSource === "apple" ? { ...value.providerConnections, apple: { ...value.providerConnections.apple, status: providerStates.READY, lastSuccessfulRefresh: new Date().toISOString() } } : value.providerConnections;
    update({ busyBlocks: replaceSourceBlocks(value.busyBlocks, fileSource, filePreview.map((block) => ({ ...block, source: fileSource, sourceId: fileSource }))), uploadedCalendars: [...value.uploadedCalendars.filter((item) => item.sourceId !== fileSource), { fileName, importedAt: new Date().toISOString(), blockCount: filePreview.length, sourceId: fileSource }], providerConnections });
    setFilePreview([]); setFileName(""); setStatus(copy.importComplete);
  };

  const connectGoogle = async () => {
    setProviderError(""); setGooglePreview([]); updateGoogle({ status: providerStates.CONNECTING });
    const result = await googleProvider.connect();
    if (result.errorCode) setProviderError(message(result.errorCode));
    const calendars = result.calendars || [];
    const availableIds = new Set(calendars.map((calendar) => calendar.id));
    const priorSelection = google.selectedCalendarIds.filter((id) => availableIds.has(id));
    updateGoogle({ status: result.status, calendars, selectedCalendarIds: priorSelection.length ? priorSelection : calendars.filter((calendar) => calendar.primary).map((calendar) => calendar.id) });
  };

  const previewGoogleBusy = async () => {
    if (!google.selectedCalendarIds.length) { setProviderError(message("calendar-required")); return; }
    setProviderError(""); updateGoogle({ status: providerStates.IMPORTING });
    const result = await googleProvider.importBusy({ calendarIds: google.selectedCalendarIds, rangeStart: value.importRange.start, rangeEnd: value.importRange.end, timezone: value.timezone });
    if (result.errorCode) setProviderError(message(result.errorCode));
    setGooglePreview(result.blocks || []); updateGoogle({ status: result.status });
  };

  const confirmGoogle = () => {
    update({ busyBlocks: replaceSourceBlocks(value.busyBlocks, "google", googlePreview), providerConnections: { ...value.providerConnections, google: { ...google, status: providerStates.READY, lastSuccessfulRefresh: new Date().toISOString() } } });
    setGooglePreview([]); setStatus(copy.googleImported);
  };

  const disconnectGoogle = () => {
    if (!window.confirm(copy.googleDisconnectConfirm)) return;
    googleProvider.disconnect();
    update({ busyBlocks: replaceSourceBlocks(value.busyBlocks, "google", []), providerConnections: { ...value.providerConnections, google: { status: providerStates.NOT_CONNECTED, selectedCalendarIds: [], calendars: [], lastSuccessfulRefresh: null } } });
    setGooglePreview([]); setProviderError("");
  };

  const saveManual = () => {
    const errors = validateManualBlock(manual); setManualErrors(errors);
    if (Object.keys(errors).length) return;
    const next = { ...manual, id: editingId || createStableId("busy", manual.label || "busy"), label: manual.label.trim() || "Busy", source: "manual", sourceId: "manual" };
    update({ busyBlocks: editingId ? value.busyBlocks.map((block) => block.id === editingId ? next : block) : [...value.busyBlocks, next] });
    setManual(emptyManualBlock(value.timezone)); setManualErrors({}); setEditingId(null);
  };
  const editBlock = (block) => { setMethod("manual"); setEditingId(block.id); setManual({ ...emptyManualBlock(value.timezone), ...block }); setManualErrors({}); };

  return <div className="step-stack">
    <fieldset className="profile-fieldset"><legend>{copy.methodsLabel}</legend><div className="schedule-methods">{copy.methods.map((option) => <button aria-pressed={method === option.id} className="schedule-method" key={option.id} onClick={() => { if (option.id === "file") { pendingFileSourceRef.current = "calendar-file"; setFileSource("calendar-file"); } setMethod(option.id); setStatus(""); }} type="button"><strong>{option.title}</strong><span>{option.description}</span></button>)}</div></fieldset>
    <input accept=".ics,text/calendar" className="sr-only" onChange={handleFile} ref={fileInputRef} type="file" />

    {method === "google" ? <section className="method-panel step-stack" aria-labelledby="google-title">
      <h3 id="google-title">{copy.googleTitle}</h3><p className="field-helper">{copy.googlePrivacy}</p><DateRange copy={copy} update={update} value={value} />
      {!googleProvider.isConfigured ? <p className="storage-message">{copy.googleUnavailable}</p> : null}<p className="provider-state" role="status">{copy.states[googleNeedsReconnect ? providerStates.RECONNECTION_REQUIRED : google.status]}</p>{google.lastSuccessfulRefresh ? <p className="field-helper">{copy.lastRefreshLabel}: {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(google.lastSuccessfulRefresh))}</p> : null}
      {google.calendars.length ? <fieldset className="profile-fieldset"><legend>{copy.googleChooseCalendars}</legend><div className="choice-grid choice-grid--compact">{google.calendars.map((calendar) => <Choice checked={google.selectedCalendarIds.includes(calendar.id)} key={calendar.id} label={calendar.label} onChange={() => updateGoogle({ selectedCalendarIds: toggleId(google.selectedCalendarIds, calendar.id) })} value={calendar.id} />)}</div></fieldset> : null}
      <div className="inline-actions">{!google.calendars.length || googleNeedsReconnect ? <Button disabled={!googleProvider.isConfigured || google.status === providerStates.CONNECTING} onClick={connectGoogle}>{copy.googleButton}</Button> : <Button disabled={google.status === providerStates.IMPORTING} onClick={previewGoogleBusy}>{google.lastSuccessfulRefresh ? copy.googleRefresh : copy.googleImport}</Button>}<Button onClick={() => beginFile("calendar-file")} variant="secondary">{copy.googleFallback}</Button>{google.calendars.length || google.lastSuccessfulRefresh ? <Button onClick={disconnectGoogle} variant="secondary">{copy.googleDisconnect}</Button> : null}</div>
      {providerError ? <p className="inline-error" role="alert">{providerError}</p> : null}{googlePreview.length ? <section className="import-preview"><h3>{copy.previewHeading}</h3><p>{googlePreview.length} {googlePreview.length === 1 ? config.review.busyBlockLabel : config.review.busyBlocksLabel}</p><Button onClick={confirmGoogle}>{copy.confirmImport}</Button></section> : null}
    </section> : null}

    {method === "apple" ? <section className="method-panel step-stack" aria-labelledby="apple-title"><h3 id="apple-title">{copy.appleTitle}</h3><p>{copy.appleHelper}</p><p className="field-helper">{copy.appleNativeNote}</p><Button onClick={() => { appleCalendarProvider.connect(); beginFile("apple"); }}>{copy.appleButton}</Button></section> : null}
    <span aria-live="polite" className="sr-only">{loading ? `Loading ${fileName}` : ""}</span>

    {method === "file" ? <section className="method-panel step-stack" aria-labelledby="file-title"><h3 id="file-title">{fileSource === "apple" ? copy.appleTitle : copy.uploadTitle}</h3><p className="field-helper">{fileSource === "apple" ? copy.appleHelper : copy.uploadHelper}</p><DateRange copy={copy} update={update} value={value} /><div className="inline-actions"><Button onClick={chooseFile} variant="secondary">{fileName ? copy.replaceFile : copy.uploadButton}</Button>{fileName ? <Button onClick={clearFile} variant="secondary">{copy.removeFile}</Button> : null}</div>{fileName ? <p className="file-status"><strong>{fileName}</strong>{loading ? " — Loading…" : ""}</p> : null}{fileError ? <p className="inline-error" role="alert">{fileError}</p> : null}{warnings.length ? <ul className="warning-list">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}{filePreview.length ? <section className="import-preview"><h3>{copy.previewHeading}</h3><div className="busy-list">{filePreview.map((block) => <div className="busy-row" key={block.sourceRef}><div><strong>{block.label}</strong><span>{formatTime(block.start, block.allDay)} – {formatTime(block.end, block.allDay)}</span></div><Button onClick={() => setFilePreview((items) => items.filter((item) => item.sourceRef !== block.sourceRef))} variant="secondary">{config.buttons.remove}</Button></div>)}</div><Button onClick={confirmFile}>{copy.confirmImport}</Button></section> : null}</section> : null}

    {method === "manual" ? <section className="method-panel step-stack" aria-labelledby="manual-title"><h3 id="manual-title">{copy.manualHeading}</h3><TextInput label={copy.labelLabel} onChange={(event) => setManual({ ...manual, label: event.target.value })} placeholder={copy.labelPlaceholder} value={manual.label} /><fieldset className="profile-fieldset"><legend>{copy.recurrenceLabel}</legend><div className="choice-grid choice-grid--compact"><Choice checked={manual.recurrence === "once"} label={copy.oneTime} name="recurrence" onChange={() => setManual({ ...manual, recurrence: "once" })} type="radio" value="once" /><Choice checked={manual.recurrence === "weekly"} label={copy.weekly} name="recurrence" onChange={() => setManual({ ...manual, recurrence: "weekly" })} type="radio" value="weekly" /></div></fieldset>
      {manual.recurrence === "once" ? <label className="native-field">{copy.dateLabel}<input aria-invalid={Boolean(manualErrors.date)} onChange={(event) => setManual({ ...manual, date: event.target.value })} type="date" value={manual.date} />{manualErrors.date ? <span className="inline-error">{message(manualErrors.date)}</span> : null}</label> : <><fieldset className="profile-fieldset"><legend>{copy.weekdaysLabel}</legend><div className="weekday-list">{copy.weekdays.map((day) => <Choice checked={manual.weekdays.includes(day.id)} key={day.id} label={day.shortLabel} onChange={() => setManual({ ...manual, weekdays: toggleId(manual.weekdays, day.id) })} value={day.id} />)}</div>{manualErrors.weekdays ? <p className="inline-error">{message(manualErrors.weekdays)}</p> : null}</fieldset><div className="form-grid form-grid--two"><label className="native-field">{copy.startDateLabel}<input aria-invalid={Boolean(manualErrors.startDate)} onChange={(event) => setManual({ ...manual, startDate: event.target.value })} type="date" value={manual.startDate} />{manualErrors.startDate ? <span className="inline-error">{message(manualErrors.startDate)}</span> : null}</label><label className="native-field">{copy.endDateLabel}<input aria-invalid={Boolean(manualErrors.endDate)} onChange={(event) => setManual({ ...manual, endDate: event.target.value })} type="date" value={manual.endDate} />{manualErrors.endDate ? <span className="inline-error">{message(manualErrors.endDate)}</span> : null}</label></div></>}
      <div className="form-grid form-grid--two"><label className="native-field">{copy.startTimeLabel}<input aria-invalid={Boolean(manualErrors.startTime)} onChange={(event) => setManual({ ...manual, startTime: event.target.value })} type="time" value={manual.startTime} />{manualErrors.startTime ? <span className="inline-error">{message(manualErrors.startTime)}</span> : null}</label><label className="native-field">{copy.endTimeLabel}<input aria-invalid={Boolean(manualErrors.endTime)} onChange={(event) => setManual({ ...manual, endTime: event.target.value })} type="time" value={manual.endTime} />{manualErrors.endTime ? <span className="inline-error">{message(manualErrors.endTime)}</span> : null}</label></div><label className="native-field">{copy.timezoneLabel}<select onChange={(event) => setManual({ ...manual, timezone: event.target.value })} value={manual.timezone}>{timezoneOptions.map((zone) => <option key={zone}>{zone}</option>)}</select></label><div className="inline-actions"><Button onClick={saveManual}>{editingId ? copy.updateBlock : copy.addBlock}</Button>{editingId ? <Button onClick={() => { setEditingId(null); setManual(emptyManualBlock(value.timezone)); }} variant="secondary">{copy.cancelEdit}</Button> : null}</div>
    </section> : null}

    {status ? <p className="success-message" role="status">{status}</p> : null}
    <section className="schedule-shared" aria-labelledby="schedule-preferences-title"><h3 id="schedule-preferences-title">{copy.preferredHeading}</h3><label className="native-field">{copy.timezoneLabel}<select onChange={(event) => update({ timezone: event.target.value })} value={value.timezone}>{timezoneOptions.map((zone) => <option key={zone}>{zone}</option>)}</select></label><label className="native-checkbox"><input checked={value.varies} onChange={(event) => update({ varies: event.target.checked })} type="checkbox" />{copy.variesLabel}</label><p className="field-helper">{copy.preferredHelper}</p><div className="choice-grid choice-grid--compact">{copy.preferredTimes.map((option) => <Choice checked={value.preferredTimeIds.includes(option.id)} key={option.id} label={option.label} onChange={() => update({ preferredTimeIds: selectPreferredTime(value.preferredTimeIds, option.id) })} value={option.id} />)}</div><p className="field-helper">{copy.busyHelper}</p></section>
    <section className="weekly-preview" aria-labelledby="weekly-preview-title"><h3 id="weekly-preview-title">{copy.previewLabel}</h3>{!value.busyBlocks.length ? <p className="empty-state">{copy.emptyPreview}</p> : <div className="busy-list">{value.busyBlocks.map((block) => <div className="busy-row" key={block.id}><div><strong>{block.label}</strong><span>{block.source !== "manual" ? `${formatTime(block.start, block.allDay)}${block.allDay ? "" : ` – ${formatTime(block.end, false)}`}` : block.recurrence === "weekly" ? `${block.weekdays.join(", ")} · ${block.startTime}–${block.endTime}` : `${block.date} · ${block.startTime}–${block.endTime}`}</span></div><div className="inline-actions">{block.source === "manual" ? <Button onClick={() => editBlock(block)} variant="secondary">{config.buttons.edit}</Button> : null}<Button onClick={() => update({ busyBlocks: value.busyBlocks.filter((item) => item.id !== block.id) })} variant="secondary">{config.buttons.remove}</Button></div></div>)}</div>}</section>
  </div>;
}
