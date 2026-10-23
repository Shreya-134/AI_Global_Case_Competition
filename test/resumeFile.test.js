import test from "node:test";
import assert from "node:assert/strict";
import { createResumeMetadata, formatFileSize, validateResumeFile } from "../src/services/resumeFile.js";

const rules = {
  maxBytes: 5 * 1024 * 1024,
  allowedExtensions: [".pdf", ".docx"],
  allowedMimeTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

test("resume validation accepts PDF and DOCX within the configured limit", () => {
  assert.equal(validateResumeFile({ name: "resume.pdf", size: 1024, type: "application/pdf" }, rules), null);
  assert.equal(validateResumeFile({ name: "resume.DOCX", size: 2048, type: "" }, rules), null);
});

test("resume validation rejects missing, unsupported, mismatched, and oversized files", () => {
  assert.equal(validateResumeFile(null, rules), "missing");
  assert.equal(validateResumeFile({ name: "resume.txt", size: 10, type: "text/plain" }, rules), "unsupported");
  assert.equal(validateResumeFile({ name: "resume.pdf", size: 10, type: "text/plain" }, rules), "unsupported");
  assert.equal(validateResumeFile({ name: "resume.pdf", size: rules.maxBytes + 1, type: "application/pdf" }, rules), "oversized");
});

test("resume metadata excludes file contents and accurately marks session storage", () => {
  const metadata = createResumeMetadata({ name: "resume.pdf", size: 1536, type: "application/pdf", contents: "private" });
  assert.deepEqual(metadata, { fileName: "resume.pdf", size: 1536, mimeType: "application/pdf", storageStatus: "session-selected" });
  assert.equal(formatFileSize(1536), "1.5 KB");
});
