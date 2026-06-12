const htmlToText = (html) => html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "\n");
const body = `<p>With best wishes,</p><br><p>For Fingrow Consulting services private limited hh</p><p>HR Manager</p><p>Candidate Undertaking:</p>`;
let cleanBody = htmlToText(body);
cleanBody = cleanBody
    .split("\n")
    .filter(line => {
        const l = line.trim();
        const clean = l.replace(/\*/g, "");
        const lower = clean.toLowerCase();
        if (lower.includes("name:") && lower.includes("signature:")) return false;
        if (lower.startsWith("for ") && (lower.includes("fingrow") || lower.includes("consulting"))) return false;
        if (lower === "authorized signatory" || lower === "hr manager" || lower === "signature:") return false;
        return true;
    })
    .join("\n")
    .trim();
console.log("--- CLEAN BODY ---");
console.log(cleanBody);
console.log("------------------");
