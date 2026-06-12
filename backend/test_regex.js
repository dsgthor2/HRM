const text = "Please note that all the above documents are mandatory, and you will not be allowed to join without them. 2\nCompensation\nDuring your probation period...";
let out = text.replace(/([^\n]+)\.\s+(\d{1,2})\s*\n+([A-Z][^\n]{1,80})/g, (m, body, num, title) => {
    return body.trim() + ".\n" + num + ". " + title.trim();
});
console.log("RESULT:");
console.log(out);
