import { useMemo, useRef, useState } from "react";
import { Button, Card, TextInput } from "../../../components/ui";
import { createStableId } from "../../../profile/profileSchema.js";
import { selectPreferredTime, toggleId, validateManualBlock } from "../../../profile/profileLogic.js";
import { mergeBusyBlocks, parseCalendarText, validateCalendarFile } from "../../../services/calendarImport.js";
import Choice from "../components/Choice";

function emptyManualBlock(timezone) {
  return {
    label: "", recurrence: "once", date: "", weekdays: [], startTime: "", endTime: "",
    startDate: "", endDate: "", timezone,
  };
}

function formatImportedTime(value, allDay) {
  if (allDay) return "All day";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ScheduleStep({ config, value, onChange }) {
  const copy = config.schedule;
  const [tab, setTab] = useState("import");
  const [manual, setManual] = useState(() => emptyManualBlock(value.timezone));
  const [editingId, setEditingId] = useState(null);
  const [manualErrors, setManualErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [importWarnings, setImportWarnings] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importStatus, setImportStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const timezoneOptions = useMemo(() => {
    const common = [value.timezone, "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "UTC"];
    return [...new Set(common.filter(Boolean))];
  }, [value.timezone]);

  const update = (patch) => onChange({ ...value, ...patch });

  const chooseFile = () => fileInputRef.current?.click();
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportStatus(""); setImportWarnings([]); setImportPreview([]);
    const validation = validateCalendarFile(file, copy.maxFileSizeBytes);
    if (validation) { setFileError(validation); return; }
    setFileName(file.name); setFileError(""); setLoading(true);
    try {
      const result = parseCalendarText(await file.text(), {
        rangeStart: value.importRange.start,
        rangeEnd: value.importRange.end,
      });
      setImportPreview(result.blocks); setImportWarnings(result.warnings);
      if (!result.blocks.length) setFileError("No busy events were found in the selected date range.");
    } catch (error) { setFileError(error.message); }
    finally { setLoading(false); }
  };

  const confirmImport = () => {
    update({ busyBlocks: mergeBusyBlocks(value.busyBlocks, importPreview) });
    setImportPreview([]); setFileName(""); setImportStatus(copy.importComplete);
  };

  const saveManualBlock = () => {
    const errors = validateManualBlock(manual);
    setManualErrors(errors);
    if (Object.keys(errors).length) return;
    const next = {
      ...manual,
      id: editingId || createStableId("busy", manual.label || "busy"),
      label: manual.label.trim() || "Busy",
      source: "manual",
    };
    const busyBlocks = editingId
      ? value.busyBlocks.map((block) => block.id === editingId ? next : block)
      : [...value.busyBlocks, next];
    update({ busyBlocks });
    setManual(emptyManualBlock(value.timezone)); setManualErrors({}); setEditingId(null);
  };

  const editBlock = (block) => {
    setTab("manual"); setEditingId(block.id);
    setManual({ ...emptyManualBlock(value.timezone), ...block }); setManualErrors({});
  };

  return (
    <div className="step-stack">
      <div className="schedule-tabs" role="tablist" aria-label="Schedule entry method">
        {Object.entries(copy.tabs).map(([id, label]) => (
          <button aria-selected={tab === id} className="schedule-tab" key={id} onClick={() => setTab(id)} role="tab" type="button">{label}</button>
        ))}
      </div>

      {tab === "import" ? (
        <div className="step-stack" role="tabpanel">
          <div className="form-grid form-grid--two">
            <label className="native-field">{copy.rangeStartLabel}<input onChange={(event) => update({ importRange: { ...value.importRange, start: event.target.value } })} type="date" value={value.importRange.start} /></label>
            <label className="native-field">{copy.rangeEndLabel}<input onChange={(event) => update({ importRange: { ...value.importRange, end: event.target.value } })} type="date" value={value.importRange.end} /></label>
          </div>
          <input accept=".ics,text/calendar" className="sr-only" onChange={handleFile} ref={fileInputRef} type="file" />
          <div className="import-options">
            <Card>
              <h3>{copy.googleTitle}</h3>
              <p>{copy.googleUnavailable}</p>
              <Button disabled>{copy.googleButton}</Button>
              <Button onClick={chooseFile} variant="secondary">{copy.googleFallback}</Button>
            </Card>
            <Card>
              <h3>{copy.appleTitle}</h3><p>{copy.appleHelper}</p>
              <Button onClick={chooseFile} variant="secondary">{copy.appleButton}</Button>
            </Card>
            <Card>
              <h3>{copy.uploadTitle}</h3><p>{copy.uploadHelper}</p>
              <Button onClick={chooseFile} variant="secondary">{copy.uploadButton}</Button>
            </Card>
          </div>
          {fileName ? <p className="file-status"><strong>{fileName}</strong>{loading ? " — Loading…" : ""}</p> : null}
          {fileError ? <p className="inline-error" role="alert">{fileError}</p> : null}
          {importWarnings.length ? <ul className="warning-list">{importWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
          {importPreview.length ? (
            <section className="import-preview" aria-labelledby="import-preview-title">
              <h3 id="import-preview-title">{copy.previewHeading}</h3>
              <div className="busy-list">
                {importPreview.map((block) => (
                  <div className="busy-row" key={block.sourceRef}>
                    <div><strong>{block.label}</strong><span>{formatImportedTime(block.start, block.allDay)} – {formatImportedTime(block.end, block.allDay)}</span></div>
                    <Button onClick={() => setImportPreview((items) => items.filter((item) => item.sourceRef !== block.sourceRef))} variant="secondary">{config.buttons.remove}</Button>
                  </div>
                ))}
              </div>
              <Button onClick={confirmImport}>{copy.confirmImport}</Button>
            </section>
          ) : null}
          {importStatus ? <p className="success-message" role="status">{importStatus}</p> : null}
        </div>
      ) : (
        <section className="step-stack" role="tabpanel" aria-labelledby="manual-title">
          <h3 id="manual-title">{copy.manualHeading}</h3>
          <TextInput label={copy.labelLabel} onChange={(event) => setManual({ ...manual, label: event.target.value })} placeholder={copy.labelPlaceholder} value={manual.label} />
          <fieldset className="profile-fieldset">
            <legend>{copy.recurrenceLabel}</legend>
            <div className="choice-grid choice-grid--compact">
              <Choice checked={manual.recurrence === "once"} label={copy.oneTime} name="recurrence" onChange={() => setManual({ ...manual, recurrence: "once" })} type="radio" value="once" />
              <Choice checked={manual.recurrence === "weekly"} label={copy.weekly} name="recurrence" onChange={() => setManual({ ...manual, recurrence: "weekly" })} type="radio" value="weekly" />
            </div>
          </fieldset>
          {manual.recurrence === "once" ? (
            <label className="native-field">{copy.dateLabel}<input aria-invalid={Boolean(manualErrors.date)} onChange={(event) => setManual({ ...manual, date: event.target.value })} type="date" value={manual.date} />{manualErrors.date ? <span className="inline-error">{manualErrors.date}</span> : null}</label>
          ) : (
            <>
              <fieldset className="profile-fieldset">
                <legend>{copy.weekdaysLabel}</legend>
                <div className="weekday-list">
                  {copy.weekdays.map((day) => <Choice key={day.id} checked={manual.weekdays.includes(day.id)} label={day.shortLabel} onChange={() => setManual({ ...manual, weekdays: toggleId(manual.weekdays, day.id) })} value={day.id} />)}
                </div>
                {manualErrors.weekdays ? <p className="inline-error">{manualErrors.weekdays}</p> : null}
              </fieldset>
              <div className="form-grid form-grid--two">
                <label className="native-field">{copy.startDateLabel}<input aria-invalid={Boolean(manualErrors.startDate)} onChange={(event) => setManual({ ...manual, startDate: event.target.value })} type="date" value={manual.startDate} />{manualErrors.startDate ? <span className="inline-error">{manualErrors.startDate}</span> : null}</label>
                <label className="native-field">{copy.endDateLabel}<input aria-invalid={Boolean(manualErrors.endDate)} onChange={(event) => setManual({ ...manual, endDate: event.target.value })} type="date" value={manual.endDate} />{manualErrors.endDate ? <span className="inline-error">{manualErrors.endDate}</span> : null}</label>
              </div>
            </>
          )}
          <div className="form-grid form-grid--two">
            <label className="native-field">{copy.startTimeLabel}<input aria-invalid={Boolean(manualErrors.startTime)} onChange={(event) => setManual({ ...manual, startTime: event.target.value })} type="time" value={manual.startTime} />{manualErrors.startTime ? <span className="inline-error">{manualErrors.startTime}</span> : null}</label>
            <label className="native-field">{copy.endTimeLabel}<input aria-invalid={Boolean(manualErrors.endTime)} onChange={(event) => setManual({ ...manual, endTime: event.target.value })} type="time" value={manual.endTime} />{manualErrors.endTime ? <span className="inline-error">{manualErrors.endTime}</span> : null}</label>
          </div>
          <label className="native-field">{copy.timezoneLabel}<select onChange={(event) => setManual({ ...manual, timezone: event.target.value })} value={manual.timezone}>{timezoneOptions.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
          <div className="inline-actions">
            <Button onClick={saveManualBlock}>{editingId ? copy.updateBlock : copy.addBlock}</Button>
            {editingId ? <Button onClick={() => { setEditingId(null); setManual(emptyManualBlock(value.timezone)); }} variant="secondary">{copy.cancelEdit}</Button> : null}
          </div>
        </section>
      )}

      <section className="schedule-shared" aria-labelledby="schedule-preferences-title">
        <h3 id="schedule-preferences-title">{copy.preferredHeading}</h3>
        <label className="native-field">{copy.timezoneLabel}<select onChange={(event) => update({ timezone: event.target.value })} value={value.timezone}>{timezoneOptions.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
        <label className="native-checkbox"><input checked={value.varies} onChange={(event) => update({ varies: event.target.checked })} type="checkbox" />{copy.variesLabel}</label>
        <p className="field-helper">{copy.preferredHelper}</p>
        <div className="choice-grid choice-grid--compact">
          {copy.preferredTimes.map((option) => <Choice key={option.id} checked={value.preferredTimeIds.includes(option.id)} label={option.label} onChange={() => update({ preferredTimeIds: selectPreferredTime(value.preferredTimeIds, option.id) })} value={option.id} />)}
        </div>
        <p className="field-helper">{copy.busyHelper}</p>
      </section>

      <section className="weekly-preview" aria-labelledby="weekly-preview-title">
        <h3 id="weekly-preview-title">{copy.previewLabel}</h3>
        {!value.busyBlocks.length ? <p className="empty-state">{copy.emptyPreview}</p> : (
          <div className="busy-list">
            {value.busyBlocks.map((block) => (
              <div className="busy-row" key={block.id}>
                <div>
                  <strong>{block.label}</strong>
                  <span>{block.source === "calendar-import" ? `${formatImportedTime(block.start, block.allDay)}${block.allDay ? "" : ` – ${formatImportedTime(block.end, false)}`}` : block.recurrence === "weekly" ? `${block.weekdays.join(", ")} · ${block.startTime}–${block.endTime}` : `${block.date} · ${block.startTime}–${block.endTime}`}</span>
                </div>
                <div className="inline-actions">
                  {block.source === "manual" ? <Button onClick={() => editBlock(block)} variant="secondary">{config.buttons.edit}</Button> : null}
                  <Button onClick={() => update({ busyBlocks: value.busyBlocks.filter((item) => item.id !== block.id) })} variant="secondary">{config.buttons.remove}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

