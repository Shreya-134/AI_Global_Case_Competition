import { useId, useRef, useState } from "react";
import { Button, Card } from "../../../components/ui";
import { createResumeMetadata, formatFileSize, validateResumeFile } from "../../../services/resumeFile.js";

export default function ProfessionalBackgroundStep({ config, value, onChange, resumeFile, onResumeFileChange }) {
  const copy = config.background;
  const textareaId = useId();
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState("");
  const resume = resumeFile && value.resume?.storageStatus === "session-selected" ? value.resume : null;

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const errorCode = validateResumeFile(file, copy);
    if (errorCode) { setFileError(copy.errors[errorCode]); return; }
    setFileError("");
    onResumeFileChange(file);
    onChange({ ...value, resume: createResumeMetadata(file) });
  };

  const removeFile = () => {
    setFileError(""); onResumeFileChange(null); onChange({ ...value, resume: null });
  };

  return <div className="step-stack">
    <section className="background-section" aria-labelledby={`${textareaId}-heading`}>
      <label className="background-label" htmlFor={textareaId} id={`${textareaId}-heading`}>{copy.textLabel}</label>
      <textarea aria-describedby={`${textareaId}-helper ${textareaId}-count`} id={textareaId} maxLength={copy.maxCharacters} onChange={(event) => onChange({ ...value, text: event.target.value })} placeholder={copy.textPlaceholder} rows="8" value={value.text} />
      <div className="background-field-footer"><span id={`${textareaId}-helper`}>{copy.textHelper}</span><span aria-live="polite" id={`${textareaId}-count`}>{value.text.length}/{copy.maxCharacters} {copy.characterCountLabel}</span></div>
    </section>

    <Card className="resume-upload-card">
      <div><h3>{copy.resumeTitle}</h3><p>{copy.resumeHelper}</p><p className="field-helper">{copy.acceptedFormats}</p></div>
      <input accept={copy.allowedExtensions.join(",")} className="sr-only" onChange={handleFile} ref={fileInputRef} type="file" />
      {resume ? <div className="resume-selection" role="status"><div><strong>{resume.fileName}</strong><span>{formatFileSize(resume.size)} · {copy.selectedStatus}</span></div><div className="inline-actions"><Button onClick={() => fileInputRef.current?.click()} variant="secondary">{copy.replaceButton}</Button><Button onClick={removeFile} variant="secondary">{copy.removeButton}</Button></div></div> : <Button onClick={() => fileInputRef.current?.click()}>{copy.uploadButton}</Button>}
      <p className="storage-message">{copy.sessionOnlyHelper}</p>
      {fileError ? <p className="inline-error" role="alert">{fileError}</p> : null}
    </Card>
  </div>;
}
