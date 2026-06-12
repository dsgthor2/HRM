const text = "Please note that all the above documents are mandatory, and you will not be allowed to join without them. 2\nCompensation\nDuring your probation period...";

function fixOrphanedSectionNumbers(text) {
    let out = text;
    const lines = out.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
        let l1 = lines[i].trim();
        if (!l1) continue;

        // check if l1 ends with a space/dot and a number
        const match = l1.match(/^(.*?)(?:\s|\.)+(\d{1,2})\.?$/);
        if (match) {
            let nextIdx = i + 1;
            while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;
            if (nextIdx < lines.length) {
                const nextLine = lines[nextIdx].trim();
                if (nextLine.length > 0 && nextLine.length < 80 && !/^\d/.test(nextLine)) {
                    lines[i] = match[1].trim() + ".";
                    lines[nextIdx] = match[2] + ". " + nextLine;
                }
            }
        } else if (/^\d{1,2}\.?$/.test(l1)) {
            // Standalone number on a line
            let nextIdx = i + 1;
            while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;
            if (nextIdx < lines.length) {
                const nextLine = lines[nextIdx].trim();
                if (nextLine.length > 0 && nextLine.length < 80 && !/^\d/.test(nextLine)) {
                    lines[i] = "";
                    lines[nextIdx] = l1.replace(/\.?$/, "") + ". " + nextLine;
                }
            }
        }
    }
    return lines.join("\n");
}

console.log("RESULT:");
console.log(fixOrphanedSectionNumbers(text));
