export const getQuestionId = (question) => {
  return question
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")   // keep spaces first
    .replace(/\s+/g, "_")          // convert spaces → _
    .replace(/_+/g, "_")            // remove duplicate _
    .replace(/^_|_$/g, "")         // remove leading/trailing _
    .slice(0, 80);
};