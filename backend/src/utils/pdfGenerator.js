import "dotenv/config";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── PAGE CONSTANTS ───────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 50;
const CW = PAGE_W - M * 2;

// ─── FONTS ────────────────────────────────────────────────────────────────────
const F = { reg: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" };

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
    black: "#000000", text: "#1a1a1a", muted: "#555555", grey: "#888888",
    border: "#aaaaaa", rowAlt: "#f5f5f5", hdrBg: "#e2e2e2", white: "#ffffff",
};
const navy = "#1e293b", lightBlue = "#f8fafc", textDark = "#1e293b", textMuted = "#64748b";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = n => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const safe = v => (v ?? "—").toString().replace(/[^\x20-\x7E]/g, "");
const stripAsterisks = s => (s || "").toString().replace(/\*+/g, "");
const toTitleCase = s => (s || "").toString().replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

const MONTH_MAP = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12",
};
const MONTHS = Object.keys(MONTH_MAP);

function numToWords(n) {
    const num = Math.round(parseFloat(n || 0));
    if (!num) return "Zero Only";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"];
    const t = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const h = x => x < 20 ? ones[x] : x < 100
        ? t[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "")
        : ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " and " + h(x % 100) : "");
    let r = num, o = "";
    if (r >= 10000000) { o += h(Math.floor(r / 10000000)) + " Crore "; r %= 10000000; }
    if (r >= 100000) { o += h(Math.floor(r / 100000)) + " Lakh "; r %= 100000; }
    if (r >= 1000) { o += h(Math.floor(r / 1000)) + " Thousand "; r %= 1000; }
    if (r > 0) o += h(r);
    return o.trim() + " Only";
}

// ─── SHARED LETTER/ATTENDANCE CONSTANTS ──────────────────────────────────────
const MARGIN = 50;
const HEADER_BOTTOM = 95;
const CONTENT_WIDTH = PAGE_W - MARGIN * 2;

const DEFAULT_CO = {
    name: "Fingrow Consulting Services\nPrivate Limited",
    address: "2nd floor, Sri ram nagar, 21-1-45/4, Akkarampalle, Tirupati, Andhra pradesh - 517507",
    email: "lokesh.vasu@fingrow.in",
};

function cleanCompanyName(name) {
    return (name || "").replace(/\n/g, " ").replace(/\*+/g, "").trim();
}

// ─── FIX 1: Header now uses two separate text calls so the full name fits ─────
function drawPageHeader(doc, company) {
    const co = { ...DEFAULT_CO, ...(company || {}) };
    try {
        const logoPath = path.join(__dirname, "../../uploads/logo.png");
        if (fs.existsSync(logoPath)) doc.image(logoPath, MARGIN, 20, { height: 45 });
    } catch (_) { }

    // Split company name on newline and render each line right-aligned
    const nl = co.name.split("\n");
    const rx = PAGE_W - 215;

    doc.font(F.bold).fontSize(9).fillColor(C.black);
    // First line of company name
    doc.text(stripAsterisks(nl[0] || ""), rx, 20, { width: 180, align: "right" });
    // Second line of company name (if exists) – directly below, no gap
    if (nl[1]) {
        doc.text(stripAsterisks(nl[1] || ""), rx, doc.y + 1, { width: 180, align: "right" });
    }

    doc.font(F.reg).fontSize(7.5).fillColor(C.muted);
    // Address on one line below company name
    doc.text(co.address.replace(/\n/g, ", "), rx, doc.y + 3, { width: 180, align: "right", lineGap: 1 });

    doc.y = HEADER_BOTTOM;
    doc.fillColor(C.black);
}

// ─── PAYSLIP GENERATOR ────────────────────────────────────────────────────────
export async function generatePayslipPDF(data, employee, template = "standard") {
    const fileName = `payslip_${safe(employee.employeeId)}_${data.month}_${data.year}.pdf`;
    const folder = "documents";
    const dir = path.join(__dirname, "../../uploads", folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, fileName);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: M, autoFirstPage: true });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));

            const isClassic = template === "classic";
            const navy = "#1e293b", lightBlue = "#f1f5f9", textDark = "#334155", textMuted = "#64748b";

            if (!isClassic) {
                try {
                    const lp = path.join(__dirname, "../../uploads/logo.png");
                    if (fs.existsSync(lp)) doc.image(lp, M, M - 5, { height: 40 });
                } catch (_) { }
                const bh = 55, by = M + 45;
                doc.rect(M, by, CW, bh).fill(navy);
                doc.font(F.bold).fontSize(16).fillColor(C.white).text("PAYSLIP", M, by + 12, { width: CW, align: "center", tracking: 2 });
                doc.font(F.reg).fontSize(9).fillColor("#cbd5e1").text(cleanCompanyName(DEFAULT_CO.name), M, by + 32, { width: CW, align: "center" });
                doc.y = by + bh + 20;
            } else {
                try {
                    const lp = path.join(__dirname, "../../uploads/logo.png");
                    if (fs.existsSync(lp)) doc.image(lp, M, M, { height: 35 });
                } catch (_) { }
                doc.font(F.bold).fontSize(14).fillColor(textDark).text(cleanCompanyName(DEFAULT_CO.name), M + 50, M + 2, { align: "left" });
                doc.font(F.reg).fontSize(8).fillColor(textMuted).text(DEFAULT_CO.address.replace(/\n/g, ", "), M + 50, doc.y + 2, { width: CW - 60 });
                doc.rect(M, M + 45, CW, 1.5).fill("#f1f5f9");
                doc.y = M + 65;
                doc.font(F.bold).fontSize(12).fillColor(textDark).text(`Payslip for ${data.month} ${data.year}`, M, doc.y);
                doc.y += 20;
            }

            const mNum = String(MONTHS.indexOf(data.month) + 1).padStart(2, "0");
            const empId = employee.employeeId || (employee.id ? employee.id.slice(-6) : "");
            const refNo = `FING/PS/${data.year}/${mNum}/${String(empId).padStart(4, "0")}`;

            const formatDateLocal = (d) => {
                if (!d) return "";
                const date = new Date(d);
                const day = String(date.getUTCDate()).padStart(2, "0");
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const year = date.getUTCFullYear();
                return `${day}/${month}/${year}`;
            };

            // Calculate last day of the payslip month for Issue Date
            const monthIdx = MONTHS.indexOf(data.month);
            const lastDay = new Date(data.year, monthIdx + 1, 0).getDate();
            const autoIssueDate = new Date(Date.UTC(data.year, monthIdx, lastDay));

            const infoLeft = [
                ["Name:", safe(employee.name)],
                ["Payslip Ref No:", refNo],
                ["Emp Code:", empId],
                ["Designation:", toTitleCase(safe(employee.designation))],
                ["Department:", safe(employee.department)],
                ["PF No:", safe(employee.pfNumber)],
                ["UAN No:", safe(employee.uan)],
                ["Date of Issue:", formatDateLocal(data.generatedDate || autoIssueDate)]
            ];
            const infoRight = [
                ["Bank Name:", safe(employee.bankName)],
                ["Account Number:", safe(employee.accountNo)],
                ["IFSC Code:", safe(employee.ifsc)],
                ["Paid Days:", String(data.presentDays ?? 26)],
                ["LOP Days:", String(Math.max(0, (data.workingDays || 26) - (data.presentDays || 26)))],
                ["Location:", safe(employee.workLocation || employee.city)]
            ];

            const curY = doc.y;
            const startX2 = M + Math.floor(CW / 2) + 10;
            const rowH_header = 16;
            const maxHeaderRows = Math.max(infoLeft.length, infoRight.length);

            for (let i = 0; i < maxHeaderRows; i++) {
                const rowY = curY + (i * rowH_header);
                if (i < infoLeft.length) {
                    doc.font(F.bold).fontSize(8.5).fillColor(textDark).text(infoLeft[i][0], M, rowY);
                    doc.font(F.reg).fontSize(8.5).fillColor(textDark).text(infoLeft[i][1], M + 85, rowY);
                }
                if (i < infoRight.length) {
                    doc.font(F.bold).fontSize(8.5).fillColor(textDark).text(infoRight[i][0], startX2, rowY);
                    doc.font(F.reg).fontSize(8.5).fillColor(textDark).text(infoRight[i][1], startX2 + 85, rowY);
                }
            }

            doc.y = curY + (maxHeaderRows * rowH_header) + 20;

            const eW = Math.floor(CW / 2), valW = 60, rowH = 24;

            if (!isClassic) {
                doc.rect(M, doc.y, CW, rowH).fill(navy);
                doc.font(F.bold).fontSize(9).fillColor(C.white);
            } else {
                doc.rect(M, doc.y, CW, rowH).fill(lightBlue);
                doc.font(F.bold).fontSize(9).fillColor(textDark);
            }

            const tY = doc.y + 7.5;
            doc.text("EARNINGS", M + 10, tY);
            doc.text("AMOUNT", M + eW - valW - 10, tY, { width: valW, align: "right" });
            doc.text("DEDUCTIONS", M + eW + 10, tY);
            doc.text("AMOUNT", M + CW - valW - 10, tY, { width: valW, align: "right" });

            doc.y += rowH;
            let rowY0 = doc.y;

            const earningsRows = [
                ["Basic Salary", data.basic || 0],
                ["House Rent Allowance", data.hra || 0],
                ["Special Allowance", data.specialAllow || 0]
            ];
            if (parseFloat(data.otherAllow || 0) > 0) earningsRows.push(["Other Allowance", data.otherAllow]);

            const deductRows = [
                ["Employee's PF", data.epf || 0],
                ["Professional Tax", data.professionalTax || 0]
            ];
            if (Math.round(parseFloat(data.esi || 0)) > 0) deductRows.push(["ESI", data.esi]);
            if (Math.round(parseFloat(data.tds || 0)) > 0) deductRows.push(["TDS", data.tds]);
            if (Math.round(parseFloat(data.otherDeduct || 0)) > 0) deductRows.push(["Other Deductions", data.otherDeduct]);
            if (deductRows.length === 0) deductRows.push(["—", 0]);

            const maxRows = Math.max(earningsRows.length, deductRows.length);
            const rowH_body = 20;

            for (let i = 0; i < maxRows; i++) {
                const ry = rowY0 + (i * rowH_body);
                doc.font(F.reg).fontSize(8.5).fillColor(textDark);
                if (i < earningsRows.length) {
                    doc.text(earningsRows[i][0], M + 10, ry + 6);
                    doc.text(fmt(earningsRows[i][1]), M + eW - valW - 10, ry + 6, { width: valW, align: "right" });
                }
                if (i < deductRows.length) {
                    doc.text(deductRows[i][0], M + eW + 10, ry + 6);
                    doc.text(fmt(deductRows[i][1]), M + CW - valW - 10, ry + 6, { width: valW, align: "right" });
                }
            }

            const tableBot = rowY0 + (maxRows * rowH_body);
            if (!isClassic) {
                doc.rect(M, rowY0 - rowH, CW, (maxRows * rowH_body) + rowH).lineWidth(1).stroke(navy);
                doc.moveTo(M + eW, rowY0 - rowH).lineTo(M + eW, tableBot).stroke(navy);
            } else {
                doc.rect(M, rowY0 - rowH, CW, (maxRows * rowH_body) + rowH).lineWidth(1).stroke("#e2e8f0");
                doc.moveTo(M + eW, rowY0 - rowH).lineTo(M + eW, tableBot).stroke("#e2e8f0");
            }

            doc.y = tableBot;
            if (!isClassic) {
                doc.rect(M, doc.y, CW, rowH).fill(navy);
                doc.font(F.bold).fontSize(9).fillColor(C.white);
            } else {
                doc.rect(M, doc.y, CW, rowH).fill(lightBlue);
                doc.font(F.bold).fontSize(9).fillColor(textDark);
            }
            const totY = doc.y + 7.5;
            doc.text("GROSS EARNINGS", M + 10, totY);
            doc.text(fmt(data.grossSalary), M + eW - valW - 10, totY, { width: valW, align: "right" });
            doc.text("TOTAL DEDUCTIONS", M + eW + 10, totY);
            doc.text(fmt(data.totalDeduct), M + CW - valW - 10, totY, { width: valW, align: "right" });

            doc.y += 35;

            const net = Math.round(parseFloat(data.netSalary || 0));
            const netBoxH = 38, netY = doc.y;
            doc.rect(M, netY, CW, netBoxH).fill(lightBlue);
            if (isClassic) doc.rect(M, netY, CW, netBoxH).lineWidth(1).stroke("#e2e8f0");

            const textY = netY + (netBoxH / 2) - 5;
            doc.font(F.bold).fontSize(11).fillColor(textDark).text("NET PAYABLE:", M + 15, textY);
            doc.font(F.bold).fontSize(14).fillColor(navy).text(`INR ${net.toLocaleString("en-IN")}`, M, textY - 1, { width: CW - 15, align: "right", lineBreak: false });

            doc.y = netY + netBoxH;
            doc.font(F.reg).fontSize(8.5).fillColor(textMuted).text(`Amount in words: ${numToWords(net)}`, M, doc.y + 15, { width: CW, align: "center" });

            doc.y += 60;
            doc.font(F.italic).fontSize(8).fillColor("#94a3b8").text("This is a computer-generated payslip and does not require a physical signature.", M, doc.y, { width: CW, align: "center" });

            doc.end();
            doc.on("end", async () => {
                try {
                    const pdfBuffer = Buffer.concat(chunks);
                    const dbFile = await prisma.fileStorage.create({
                        data: { filename: fileName, mimeType: "application/pdf", data: pdfBuffer }
                    });
                    resolve(`/api/upload/file/${dbFile.id}`);
                } catch (err) { reject(err); }
            });
        } catch (err) { reject(err); }
    });
}

// ─── PROFESSIONAL LETTER GENERATOR ───────────────────────────────────────────
const formatDate = (val) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const bold2 = (val) => (val && val !== "________" ? `**${val}**` : val);
const fmt2 = n => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const safe2 = v => (v || "").toString().replace(/[^\x20-\x7E\n]/g, "");
const stripB = s => s.replace(/\*\*/g, "");

function numToWords2(n) {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    let numStr = (n || 0).toString().replace(/,/g, "").trim();
    let num = parseInt(numStr, 10);
    if (isNaN(num) || num === 0) return "Zero";
    if (numStr.length > 9) return "Overflow";
    let match = ("000000000" + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!match) return "Zero";
    let str = "";
    str += match[1] != 0 ? (a[Number(match[1])] || b[match[1][0]] + " " + a[match[1][1]]) + " Crore " : "";
    str += match[2] != 0 ? (a[Number(match[2])] || b[match[2][0]] + " " + a[match[2][1]]) + " Lakh " : "";
    str += match[3] != 0 ? (a[Number(match[3])] || b[match[3][0]] + " " + a[match[3][1]]) + " Thousand " : "";
    str += match[4] != 0 ? (a[Number(match[4])] || b[match[4][0]] + " " + a[match[4][1]]) + " Hundred " : "";
    str += match[5] != 0 ? ((str !== "") ? "And " : "") + (a[Number(match[5])] || b[match[5][0]] + " " + a[match[5][1]]) : "";
    return str.trim() || "Zero";
}

function htmlToText(html) {
    if (!html) return "";
    return html
        .replace(/<!--[\s\S]*?-->/g, "").replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n").replace(/<\/p>/gi, "\n").replace(/<p[^>]*>/gi, "")
        .replace(/<\/li>/gi, "\n").replace(/<li[^>]*>/gi, "• ")
        .replace(/<\/ul>|<\/ol>/gi, "\n").replace(/<ul[^>]*>|<ol[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n").replace(/<\/h[1-6]>/gi, "\n\n")
        .replace(/<(strong|b)[^>]*>/gi, "**").replace(/<\/(strong|b)>/gi, "**")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/\n\s*\n\s*\n/g, "\n\n").trim();
}

// ─── FIX ORPHANED SECTION NUMBERS ────────────────────────────────────────────
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
                // Check if next line is short and doesn't already start with a number
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

// ─── FIX PROBATION DESIGNATION INLINE ────────────────────────────────────────
function fixProbationDesignationInline(text) {
    return text.replace(
        /for the role of\s+:?\s*\*?\*?([^,\n*]+?)\*?\*?\s*,?\s*which will/gi,
        (_, designation) => {
            const clean = designation.trim().replace(/\*+/g, "");
            return `for the role of **${clean}**, which will`;
        }
    );
}

// ─── FIX 2: Remove extra spaces around bold date in "commence on __date__." ──
function fixCommenceOnDate(text) {
    // Normalise "commence on  17 April 2026 ." → "commence on 17 April 2026."
    return text.replace(
        /commence on\s{2,}(\*\*)?([^.\n]+?)(\*\*)?\s+\./g,
        (_, ob, date, cb) => {
            const cleanDate = date.trim();
            if (ob && cb) return `commence on **${cleanDate}**.`;
            return `commence on ${cleanDate}.`;
        }
    ).replace(
        /commence on\s{2,}([^.\n]+?)\s+\./g,
        (_, date) => `commence on ${date.trim()}.`
    );
}

function isNumberedHeading(line) {
    const t = line.trim().replace(/\*/g, ""); if (!t) return false;
    const fm = t.match(/^(\d+)/); if (!fm) return false;
    const after = t.slice(fm[0].length, fm[0].length + 1);
    return !after || /[\s.).]/.test(after);
}
function isBoldLine(line) { const t = line.trim(); return t.startsWith("**") && t.endsWith("**"); }
function isBulletLine(line) { return /^[•\-\*]\s+/.test(line.trim()); }

// ─── INLINE BOLD PARAGRAPH RENDERER ─────────────────────────────────────────
function renderInlineParagraph(doc, text, x, maxWidth, fontSize, lineGap, align) {
    const tokens = [];
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach(p => {
        if (!p) return;
        if (p.startsWith("**") && p.endsWith("**")) {
            tokens.push({ text: p.slice(2, -2), bold: true });
        } else {
            tokens.push({ text: p, bold: false });
        }
    });

    const words = [];
    tokens.forEach(tok => {
        const ws = tok.text.split(/(?<= )|(?= )/);
        ws.forEach(w => { if (w) words.push({ text: w, bold: tok.bold }); });
    });

    const lines = [];
    let currentLine = [];
    let currentWidth = 0;

    const wordWidth = (w) => {
        doc.font(w.bold ? F.bold : F.reg).fontSize(fontSize);
        return doc.widthOfString(w.text);
    };

    words.forEach(word => {
        const ww = wordWidth(word);
        if (currentWidth + ww > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = [word];
            currentWidth = ww;
        } else {
            currentLine.push(word);
            currentWidth += ww;
        }
    });
    if (currentLine.length) lines.push(currentLine);

    lines.forEach((lineWords, lineIdx) => {
        const lineY = doc.y;
        const lineTextWidth = lineWords.reduce((sum, w) => sum + wordWidth(w), 0);
        const isLastLine = lineIdx === lines.length - 1;

        if (align === "justify" && !isLastLine && lineWords.length > 1) {
            const extraSpace = maxWidth - lineTextWidth;
            const spaceExtra = extraSpace / (lineWords.length - 1);
            let cx = x;
            lineWords.forEach((w, wi) => {
                doc.font(w.bold ? F.bold : F.reg).fontSize(fontSize).fillColor(C.black);
                doc.text(w.text, cx, lineY, { lineBreak: false });
                cx += wordWidth(w) + (wi < lineWords.length - 1 ? spaceExtra : 0);
            });
        } else if (align === "right") {
            let cx = x + maxWidth - lineTextWidth;
            lineWords.forEach(w => {
                doc.font(w.bold ? F.bold : F.reg).fontSize(fontSize).fillColor(C.black);
                doc.text(w.text, cx, lineY, { lineBreak: false });
                cx += wordWidth(w);
            });
        } else if (align === "center") {
            let cx = x + (maxWidth - lineTextWidth) / 2;
            lineWords.forEach(w => {
                doc.font(w.bold ? F.bold : F.reg).fontSize(fontSize).fillColor(C.black);
                doc.text(w.text, cx, lineY, { lineBreak: false });
                cx += wordWidth(w);
            });
        } else {
            let cx = x;
            lineWords.forEach(w => {
                doc.font(w.bold ? F.bold : F.reg).fontSize(fontSize).fillColor(C.black);
                doc.text(w.text, cx, lineY, { lineBreak: false });
                cx += wordWidth(w);
            });
        }

        doc.font(F.reg).fontSize(fontSize);
        doc.y = lineY + doc.currentLineHeight(true) + lineGap;
    });
}

function guardPage(doc, needed = 40) { if (doc.y + needed > 780) doc.addPage(); }

function renderTextBlocks(doc, text, options = {}) {
    const { fontSize = 10, lineGap = 3, align = "left" } = options;

    const lines = text.split("\n");

    lines.forEach(line => {
        if (!line.trim()) { doc.moveDown(0.6); return; }

        let processedLine = line;
        const doubleStar = (processedLine.match(/\*\*/g) || []).length;
        if (doubleStar % 2 !== 0) {
            processedLine = processedLine.replace(/\*+/g, "");
        }

        const rawClean = processedLine.replace(/\*\*/g, "");
        let xOffset = 0;
        const ls = processedLine.match(/^ +/);
        if (ls) xOffset = ls[0].length * 3;

        const fSize = isNumberedHeading(processedLine) || isBoldLine(processedLine) ? fontSize + 0.5 : fontSize;

        if (isNumberedHeading(processedLine) || isBoldLine(processedLine)) {
            doc.moveDown(0.4);
            doc.font(F.bold).fontSize(fSize).fillColor(C.black);
            let head = rawClean.trim();
            if (/^\d+\s/.test(head)) head = head.replace(/^(\d+)\s+/, "$1. ");
            doc.text(head, MARGIN + xOffset, doc.y, { width: CONTENT_WIDTH - xOffset, lineGap, align: align === "justify" ? "justify" : "left" });

        } else if (isBulletLine(processedLine)) {
            const bb = "• " + processedLine.trim().replace(/^[•\-\*]\s+/, "");
            const hasBold = bb.includes("**");
            if (hasBold) {
                renderInlineParagraph(doc, bb, MARGIN + 15 + xOffset, CONTENT_WIDTH - 15 - xOffset, fSize, lineGap, "left");
            } else {
                doc.font(F.reg).fontSize(fSize).fillColor(C.black);
                doc.text(stripB(bb), MARGIN + 15 + xOffset, doc.y, { width: CONTENT_WIDTH - 15 - xOffset, lineGap, align: "left" });
            }

        } else {
            const hasBold = processedLine.includes("**");
            if (hasBold) {
                renderInlineParagraph(doc, processedLine.trim(), MARGIN + xOffset, CONTENT_WIDTH - xOffset, fSize, lineGap, align);
            } else {
                doc.font(F.reg).fontSize(fSize).fillColor(C.black);
                doc.text(rawClean.trim(), MARGIN + xOffset, doc.y, { width: CONTENT_WIDTH - xOffset, lineGap, align: align === "justify" ? "justify" : align });
            }
        }
    });
}

function drawAnnexureTitle(doc, title) {
    doc.font(F.bold).fontSize(12).fillColor(C.black).text(title, MARGIN, doc.y, { align: "left" });
    doc.moveDown(0.4);
    doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + 250, doc.y).strokeColor(C.black).lineWidth(1).stroke();
    doc.moveDown(0.8);
}

function drawCompensationPage(doc, salaryData, data, company) {
    doc.addPage(); drawPageHeader(doc, company);
    doc.font(F.bold).fontSize(11).fillColor(C.black).text("ANNEXURE - III", MARGIN, doc.y, { align: "left" });
    doc.moveDown(0.5);
    const col1 = MARGIN, col2 = MARGIN + 300, col3 = MARGIN + 400, rowH = 15;
    const drawRow = (l, v, p = null, isBold = false) => {
        const y = doc.y;
        doc.rect(col1, y, 300, rowH).stroke(); doc.rect(col2, y, 100, rowH).stroke();
        doc.rect(col3, y, CONTENT_WIDTH - 400, rowH).stroke();
        doc.font(isBold ? F.bold : F.reg).fontSize(8).fillColor(C.black);
        doc.text(l, col1 + 5, y + 4);
        let m = "", a = "";
        if (l.toLowerCase().includes("(annual)") || l.toLowerCase() === "total ctc") {
            m = ""; a = (v === null || v === undefined) ? "" : fmt2(v);
        } else if (p === null) {
            m = (v === null || v === undefined) ? "" : fmt2(v);
            a = (v === null || v === undefined) ? "" : fmt2(Number(v || 0) * 12);
        } else {
            m = (v === null || v === undefined) ? "" : fmt2(v); a = p;
        }
        doc.text(m, col2, y + 4, { width: 95, align: "right" });
        doc.text(a, col3, y + 4, { width: CONTENT_WIDTH - 400 - 5, align: "right" });
        doc.y = y + rowH;
    };
    doc.rect(MARGIN, doc.y, CONTENT_WIDTH, rowH).stroke();
    doc.font(F.bold).fontSize(8.5).text("Compensation Structure", MARGIN + 5, doc.y + 4); doc.y += rowH;

    const drawMeta = (lbl, val) => {
        const y = doc.y; doc.rect(col1, y, 300, rowH).stroke(); doc.rect(col2, y, CONTENT_WIDTH - 300, rowH).stroke();
        doc.font(F.bold).fontSize(8).fillColor(C.black).text(lbl, col1 + 5, y + 4);
        doc.font(F.reg).text(stripAsterisks(val || ""), col2 + 5, y + 4); doc.y = y + rowH;
    };
    const drawMetaBold = (lbl, val) => {
        const y = doc.y; doc.rect(col1, y, 300, rowH).stroke(); doc.rect(col2, y, CONTENT_WIDTH - 300, rowH).stroke();
        doc.font(F.bold).fontSize(8).fillColor(C.black).text(lbl, col1 + 5, y + 4);
        doc.font(F.bold).fontSize(8).text(stripAsterisks(val || ""), col2 + 5, y + 4); doc.y = y + rowH;
    };

    drawMetaBold("Name", safe2(data.name || ""));
    drawMetaBold("Designation", toTitleCase(safe2(data.designation || "")));
    drawMeta("Location", safe2(data.location || data.workLocation || ""));

    const hY = doc.y;
    doc.rect(col1, hY, 300, rowH).stroke(); doc.rect(col2, hY, 100, rowH).stroke();
    doc.rect(col3, hY, CONTENT_WIDTH - 400, rowH).stroke();
    doc.font(F.bold).text("Salary component", col1 + 5, hY + 5);
    doc.text("Monthly Gross (INR)", col2 + 5, hY + 5);
    doc.text("Annual Gross (INR)", col3 + 5, hY + 5);
    doc.y = hY + rowH;
    (salaryData?.earnings || []).forEach(e => drawRow(e.name, e.value));
    drawRow("Gross Monthly Salary [a]", salaryData?.grossMonthly, null, true);
    const hasDeductions = (salaryData?.deductions || []).length > 0;
    if (hasDeductions) {
        const dY = doc.y; doc.rect(MARGIN, dY, CONTENT_WIDTH, rowH).stroke();
        doc.font(F.bold).text("Deductions", MARGIN + 5, dY + 5); doc.y += rowH;
        (salaryData.deductions).forEach(d => drawRow(d.name, d.value));
        drawRow("Total Deductions", salaryData?.totalDeductions || 0, null, true);
    }
    drawRow("Net Monthly Salary", salaryData?.netMonthly || 0, null, true);
    const eY = doc.y; doc.rect(MARGIN, eY, CONTENT_WIDTH, rowH).stroke();
    doc.font(F.bold).text("Employer Contribution:", MARGIN + 5, eY + 5); doc.y += rowH;
    if (Number(salaryData?.epf) > 0) drawRow("Employer contribution to EPF", salaryData.epf);
    if (Number(salaryData?.esi) > 0) drawRow("Employer contribution to ESI", salaryData.esi);
    if (Number(salaryData?.gratuity) > 0) drawRow("Gratuity (Retiral)", salaryData.gratuity);
    drawRow("Total Employer Contribution", salaryData?.totalEmployer || 0, null, true);
    drawRow("Total Fixed CTC (Monthly)", Math.round((data.annualCTC || salaryData?.annualCTC || 0) / 12), "", true);
    drawRow("Total Fixed CTC (Annual)", data.annualCTC || salaryData?.annualCTC || 0, "", true);
    drawRow("Total CTC", data.annualCTC || salaryData?.annualCTC || 0, "", true);
    doc.y += 25;
}

// ─── FIX 3: Signatory — name on its OWN line, not appended after company ─────
function drawSignatory(doc, data, company) {
    const co = { ...DEFAULT_CO, ...(company || {}) };
    const sigName = stripAsterisks(data.sigName || co.signatoryName || "Authorized Signatory");
    const sigDesig = stripAsterisks(data.sigDesignation || co.signatoryDesignation || "HR Manager");
    doc.y += 1;
    guardPage(doc, 40);

    const cleanCoName = cleanCompanyName(co.name);

    doc.font(F.bold).fontSize(9).fillColor(C.black)
        .text("For " + cleanCoName, MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.y += 10;

    doc.font(F.bold).fontSize(9).fillColor(C.black)
        .text(sigName, MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.y += 10;

    doc.font(F.reg).fontSize(8).fillColor(C.black)
        .text(sigDesig, MARGIN, doc.y, { width: CONTENT_WIDTH });
}

function drawCandidateAcceptance(doc) {
    doc.moveDown(0.2);
    guardPage(doc, 20);
    const y = doc.y;
    doc.font(F.bold).fontSize(8.5).fillColor(C.black);
    doc.text("Name:", MARGIN, y);
    doc.text("Date:", MARGIN + 220, y);
    doc.text("Signature:", MARGIN + 400, y);
    doc.moveDown(0.2);
}

// ─── BOLD INR ────────────────────────────────────────────────────────────────
function boldInr(text) {
    let out = text.replace(/\*\*(INR\s*[\d,]+(?:\s*\([^)]+\))?)\*\*/g, "$1");
    out = out.replace(/(INR\s*)([\d,]+(?:\s*\([^)]+\))?)/g, (_, prefix, rest) => {
        return `**INR ${rest.trimStart()}**`;
    });
    return out;
}

// ─── NORMALIZE BOLD ──────────────────────────────────────────────────────────
function normalizeBold(text) {
    let out = text.replace(/\*{3,}/g, "**");
    out = out.replace(/\*\*\s*\*\*/g, " ");
    out = out.replace(/ {2,}/g, " ");
    return out;
}

function applyReplacements(text, map) {
    let out = text;
    let sno = 1;
    while (out.includes("-SNo-")) out = out.replace("-SNo-", (sno++).toString());

    Object.keys(map).forEach(k => {
        const val = (map[k] || "").toString();
        const cleanK = k.replace(/_/g, " ");
        out = out.split(`{{${k}}}`).join(val).split(`--${k}--`).join(val);
        const patterns = [k, k.toLowerCase(), cleanK, cleanK.toLowerCase()];
        [...new Set(patterns)].forEach(p => {
            const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            out = out.replace(new RegExp(`-${escaped}-`, "gi"), val);
        });
    });

    out = out
        .replace(/-designation-/gi, map.DESIGNATION || "________")
        .replace(/-confirmation date-/gi, map.CONFIRMATION_DATE || map.DATE)
        .replace(/-reviewer name-/gi, map.REVIEWER_NAME || "________")
        .replace(/-company name-/gi, map.COMPANY_NAME || "________")
        .replace(/-Date of Join-/gi, map.JOINING_DATE || "________")
        .replace(/-effective from\(exit date\)-/gi, map.LAST_WORKING_DAY || map.EXIT_DATE || "________")
        .replace(/-effective from\(relieving date\)-/gi, map.LAST_WORKING_DAY || map.EXIT_DATE || "________");

    const ctcVal = map.CTC || "**INR 0 (Zero Only)**";
    out = out.replace(/INR\s*{{CTC}}/gi, ctcVal).replace(/INR\s*-CTC-/gi, ctcVal);
    out = out.replace(/{{CTC}}/gi, ctcVal).replace(/-CTC-/gi, ctcVal);

    const vTill = map.VALID_TILL || map.OFFER_VALID_TILL || "";
    const validVal = vTill ? (typeof vTill === "string" && vTill.includes("April") ? vTill : formatDate(vTill)) : "";
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const dateVal = map.DATE || today;

    out = out
        .replace(/-date-/gi, validVal || dateVal)
        .replace(/-Date-/gi, validVal || dateVal)
        .replace(/-Valid Till-/gi, validVal || "________")
        .replace(/-valid till-/gi, validVal || "________")
        .replace(/-Offer Valid-/gi, validVal || "________")
        .replace(/-Offer Valid Till-/gi, validVal || "________")
        .replace(/-VALID_TILL-/gi, validVal || "________")
        .split("-Date of Join-").join(map.JOINING_DATE || "");

    out = out
        .replace(/-ctc words-/gi, map.CTC_WORDS || "")
        .split("-location-").join(map.LOCATION || "")
        .split("-company address-").join(map.COMPANY_ADDRESS || "")
        .split("-state-").join(map.STATE || "")
        .split("-Hr Name-").join(map.SIGNATORY_NAME || "")
        .split("-Signatory Designation-").join(map.SIGNATORY_DESIGNATION || "");

    out = out
        .replace(/(send an email to:)\s*\n\s*/gi, "$1 ")
        .replace(/hr@fingrow\.in/gi, "lokesh.vasu@fingrow.in");

    out = boldInr(out);

    out = out.replace(
        /(?<!\*\*)(\d+\s+(?:Month(?:s|\(s\))?|months?|years?|weeks?|days?))(?!\*\*)/gi,
        "**$1**"
    );

    out = normalizeBold(out);
    return out;
}

// ─── POST-PROCESS: bold key values ───────────────────────────────────────────
function boldKeyValues(text, data, company) {
    const co = { ...DEFAULT_CO, ...(company || {}) };
    let out = text;

    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const rawName = safe2(data.name || "");
    const PREFIXES = ["mr.", "ms.", "mrs.", "dr."];
    let cleanName = rawName.trim();
    let found = true;
    while (found) {
        found = false;
        for (const t of PREFIXES) {
            if (cleanName.toLowerCase().startsWith(t + " ")) {
                cleanName = cleanName.slice(t.length + 1).trim();
                found = true; break;
            }
        }
    }

    const desig = toTitleCase(stripAsterisks(data.designation || data.position || "").trim());
    const coName = cleanCompanyName(co.name);

    const targets = [
        cleanName,
        desig,
        coName,
        "Fingrow Consulting services private limited",
        "Fingrow Consulting Services Private Limited",
        "Fingrow Consulting Services Pvt Ltd",
    ].filter(v => v && v.length > 2);

    out = boldInr(out);

    for (const target of [...new Set(targets)]) {
        if (!target) continue;
        out = out.replace(new RegExp(`(?<!\\*)(${esc(target)})(?!\\*)`, "gi"), "**$1**");
    }

    out = normalizeBold(out);
    out = out.replace(/(\*\*)([^\s*])/g, "$1 $2");

    return out;
}

export async function generateProfessionalLetter(options) {
    const { type, data, company, template, salaryData, isPreview = false } = options;
    const fileName = `${type.toLowerCase()}_${Date.now()}.pdf`;
    const folder = isPreview ? "temp" : "pdfs";
    const filePath = path.join(__dirname, "../../uploads", folder, fileName);
    const todayRaw = data.date ? new Date(data.date) : new Date();
    const today = todayRaw.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const doc = new PDFDocument({ margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 20 }, size: "A4" });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    drawPageHeader(doc, company);

    // ─── Reference Number ─────────────────────────────────────────────────────
    const refYear = todayRaw.getFullYear();
    let refNum = data.refNum;

    if (!refNum) {
        // Extract numeric part from human-readable IDs like "EMP0020" → "0020"
        const empIdStr = data.employeeIdNum || data.empId || "";
        const candIdStr = String(data.candidateId || data.employeeId || data.id || "");
        const refDigits = empIdStr
            ? empIdStr.replace(/[^0-9]/g, "")                    // "EMP0020" → "0020"
            : (candIdStr.replace(/[^0-9]/g, "").slice(-4) || "0000"); // fallback: last 4 digits
        refNum = refDigits.padStart(4, "0");
    }

    doc.font(F.reg).fontSize(9).fillColor(C.muted).text(`Ref: FING/${refYear}/${refNum}`, MARGIN, doc.y);
    doc.moveDown(0.2);
    doc.font(F.reg).fontSize(9).fillColor(C.muted).text(`Date: ${today}`, MARGIN, doc.y);
    doc.moveDown(0.5);



    const rawName = safe2(data.name || "");
    const TITLE_PREFIXES = ["mr.", "ms.", "mrs.", "dr.", "mr", "ms", "mrs", "dr"];
    let cleanName = rawName.trim();
    let found = true;
    while (found) {
        found = false;
        for (const t of TITLE_PREFIXES) {
            if (cleanName.toLowerCase().startsWith(t + " ")) {
                cleanName = cleanName.slice(t.length + 1).trim();
                found = true; break;
            }
        }
    }

    // ─── FIX 4: Title-case the candidate name on the letter ──────────────────
    const displayName = toTitleCase(cleanName);

    const prefix = data.prefix || "Mr.";

    doc.font(F.bold).fontSize(10).fillColor(C.black).text(displayName, MARGIN, doc.y);
    if (data.address && data.address !== "Address not provided" && data.address.trim().length > 0) {
        doc.font(F.reg).fontSize(9).fillColor(C.black).text(safe2(data.address), MARGIN, doc.y + 1, { width: 280, lineGap: 1.5 });
    }
    doc.moveDown(1.2);

    const rawTitle = (template?.name || type).toUpperCase();
    const title = rawTitle.endsWith("LETTER") || rawTitle.endsWith("OFFER") ? rawTitle : `${rawTitle} LETTER`;
    doc.font(F.bold).fontSize(11).fillColor(C.black).text(title, MARGIN, doc.y, { align: "center", width: CONTENT_WIDTH });
    doc.moveDown(0.8);

    // ─── FIX 5: Title-case name in greeting too ───────────────────────────────
    const greeting = `**Dear ${prefix} ${displayName},**`;

    const replacements = buildReplacements(data, company, today);
    const body = template?.content || getFallbackBody(type, data, today);
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

    if (cleanBody.toLowerCase().startsWith("dear")) {
        const lines = cleanBody.split("\n");
        lines[0] = greeting;
        cleanBody = lines.join("\n");
    } else {
        cleanBody = greeting + "\n\n" + cleanBody;
    }

    // ── Repair orphaned section numbers BEFORE bold processing ───────────────
    cleanBody = fixOrphanedSectionNumbers(cleanBody);

    // ── For PROBATION letters: ensure designation is bold + new line ──────────
    if (type === "PROBATION") {
        cleanBody = fixProbationDesignationInline(cleanBody);
    }

    let resolvedBody = applyReplacements(cleanBody, replacements);

    // ─── FIX 6: Clean up extra whitespace around dates in probation body ──────
    if (type === "PROBATION") {
        resolvedBody = fixCommenceOnDate(resolvedBody);
        resolvedBody = resolvedBody.replace(
            /commence on\s{2,}(\*\*[^*]+\*\*)\s*\./g,
            (_, boldDate) => `commence on ${boldDate}.`
        );
    }

    // ─── FIX 7: Clean up EXIT / EXPERIENCE letter date formatting ────────────
    if (type === "EXIT" || type === "EXPERIENCE" || type === "RELIEVING") {
        // Force the certification paragraph to be a single continuous line (remove all internal newlines)
        resolvedBody = resolvedBody.replace(/(This is to certify that[\s\S]+?endeavors\.)/gi, (match) => {
            return match.replace(/\n+/g, " ");
        });

        // Collapse double spaces around dates: "from  23 April" → "from 23 April"
        resolvedBody = resolvedBody.replace(/\b(from|to|with effect from|worked as)\s{2,}/gi, "$1 ");

        // Prevent Month Year from wrapping: "April 2026" -> "April[NBSP]2026"
        resolvedBody = resolvedBody.replace(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\s+(\d{4})/gi, "$1\u00A0$2");

        // Remove trailing " ." (space then period) after dates: "2026 ." → "2026."
        resolvedBody = resolvedBody.replace(/(\d{4}|\*\*)\s+\./g, "$1.");

        // Remove extra spaces before period: "April 2026 ." → "April 2026."
        resolvedBody = resolvedBody.replace(/\s+\./g, ".");

        // Clean up "  " double spaces everywhere
        resolvedBody = resolvedBody.replace(/ {2,}/g, " ");

        // Ensure "Software Engineering at" doesn't have double space
        resolvedBody = resolvedBody.replace(/as\s{2,}/gi, "as ");
    }



    const boldedBody = boldKeyValues(resolvedBody, data, company);

    const isOffer = type === "OFFER";
    const bodyFontSize = isOffer ? 8.4 : 8.8;
    const bodyLineGap = isOffer ? 1.1 : 1.6;

    renderTextBlocks(doc, boldedBody, { fontSize: bodyFontSize, lineGap: bodyLineGap, align: "justify" });

    doc.moveDown(0.5);
    drawSignatory(doc, data, company);
    doc.y -= 3;

    if (isOffer && !boldedBody.includes("Candidate Undertaking:")) {
        doc.font(F.bold).fontSize(9).fillColor(C.black).text("Candidate Undertaking:", MARGIN, doc.y);
        doc.moveDown(0.2);
        const compactU = `I have carefully read and understood the terms and conditions mentioned above and in the Annexure I and II attached. I acknowledge that while I am working for **Fingrow Consulting services private limited**, I will take proper care of all company equipment. I understand I may be held financially responsible for lost or damaged property. I accept all terms and conditions and shall commence my employment with effect from ____________`;
        renderTextBlocks(doc, compactU, { fontSize: 8.4, lineGap: 1.1, align: "justify" });
    }

    drawCandidateAcceptance(doc);

    if (template?.annexure1?.trim()) {
        doc.addPage();
        drawAnnexureTitle(doc, "Annexure I: Terms & Conditions");
        let a1 = htmlToText(template.annexure1).replace(/Name:.*Date:.*Signature:.*/gi, "").trim();
        a1 = fixOrphanedSectionNumbers(a1);
        renderTextBlocks(doc, applyReplacements(a1, replacements), { fontSize: 10.2, lineGap: 3.5, align: "justify" });
        drawCandidateAcceptance(doc);
    }

    if (template?.annexure2?.trim()) {
        doc.addPage();
        drawAnnexureTitle(doc, "Annexure II: Confidential Information");
        let a2 = htmlToText(template.annexure2).replace(/Name:.*Date:.*Signature:.*/gi, "").trim();
        a2 = fixOrphanedSectionNumbers(a2);
        renderTextBlocks(doc, applyReplacements(a2, replacements), { fontSize: 9.3, lineGap: 2.5, align: "justify" });
        drawCandidateAcceptance(doc);
    }

    const isInternship = type === "INTERNSHIP" || (data.empType && data.empType.toLowerCase() === "internship");
    if (salaryData && !isInternship) {
        drawCompensationPage(doc, salaryData, data, company);
        if (template?.compensationNotes?.trim()) {
            doc.moveDown(0.5);
            renderTextBlocks(doc, applyReplacements(htmlToText(template.compensationNotes), replacements), { fontSize: 9.0, lineGap: 2, align: "left" });
        }
        doc.moveDown(1.5);
        drawSignatory(doc, data, company);
    }

    doc.end();
    return new Promise((res, rej) => {
        doc.on("end", async () => {
            try {
                const pdfBuffer = Buffer.concat(chunks);
                const dbFile = await prisma.fileStorage.create({
                    data: { filename: fileName, mimeType: "application/pdf", data: pdfBuffer }
                });
                res(`/api/upload/file/${dbFile.id}`);
            } catch (err) { rej(err); }
        });
        doc.on("error", rej);
    });
}

function buildReplacements(data, company, today) {
    const todayRaw = new Date();
    const d = data;
    const co = { ...DEFAULT_CO, ...(company || {}) };
    const fullName = safe2(d.name || "");
    const PREFIXES = ["mr.", "ms.", "mrs.", "dr.", "mr", "ms", "mrs", "dr"];
    let cleanFullName = fullName.trim();
    let f2 = true;
    while (f2) {
        f2 = false;
        for (const t of PREFIXES) {
            if (cleanFullName.toLowerCase().startsWith(t + " ")) {
                cleanFullName = cleanFullName.slice(t.length + 1).trim();
                f2 = true; break;
            }
        }
    }
    // Title-case the name used in replacements too
    cleanFullName = toTitleCase(cleanFullName);
    const cleanFirstName = cleanFullName.split(" ")[0] || "Sir/Madam";
    const cleanLastName = cleanFullName.split(" ").slice(1).join(" ") || "________";
    const cleanCoName = cleanCompanyName(co.name);

    const ctcAmount = d.revisedCtc || d.ctc || 0;
    const ctcFormatted = fmt2(ctcAmount);
    const ctcWords = numToWords2(ctcAmount) || "Zero";
    const ctcBold = `**INR ${ctcFormatted} (${ctcWords} Only)**`;

    const stipendAmount = d.revisedCtcOffer || d.revisedCtc || d.ctc || 0;
    const stipendFormatted = fmt2(stipendAmount);
    const stipendWords = numToWords2(stipendAmount) || "Zero";
    const stipendBold = `**INR ${stipendFormatted} (${stipendWords} Only)**`;

    const designationTitled = toTitleCase(stripAsterisks(d.designation || d.position || "________"));

    return {
        FULL_NAME: `**${cleanFullName}**`, "FULL NAME": `**${cleanFullName}**`,
        FIRST_NAME: `**${cleanFirstName}**`, "FIRST NAME": `**${cleanFirstName}**`,
        NAME: `**${cleanFullName}**`,
        EMPLOYEE_FIRST_NAME: `**${cleanFirstName}**`, EMPLOYEE_LAST_NAME: `**${cleanLastName}**`,
        ADDRESS1: d.address1 || "________", ADDRESS2: d.address2 || "",
        DESIGNATION: `**${designationTitled}**`,
        DEPARTMENT: safe2(d.department || "________"),
        COMPANY_NAME: `**${cleanCoName}**`, "COMPANY NAME": `**${cleanCoName}**`,
        COMPANY_EMAIL: "lokesh.vasu@fingrow.in", "COMPANY EMAIL": "lokesh.vasu@fingrow.in",
        DATE: today,
        OFFER_DATE: formatDate(d.offerDate || d.date || todayRaw) || today,
        VALID_TILL: formatDate(d.offerExpiry || d.validTill || d.validTillOffer) || today,
        OFFER_VALID_TILL: formatDate(d.offerExpiry || d.validTill || d.validTillOffer) || today,
        VALID_DATE: formatDate(d.offerExpiry || d.validTill || d.validTillOffer) || today,
        EXPIRY_DATE: formatDate(d.offerExpiry || d.validTill || d.validTillOffer) || today,
        JOINING_DATE: bold2(formatDate(d.joiningDate || d.joinDate || d.joining_date || d.date)),
        CTC: ctcBold,
        STIPEND: stipendBold,
        CTC_WORDS: `**(${ctcWords} Only)**`,
        "CTC WORDS": `**(${ctcWords} Only)**`,
        BASIC: bold2(fmt2(d.basic || d.annual?.basic || 0)),
        HRA: bold2(fmt2(d.hra || d.annual?.hra || 0)),
        LOCATION: bold2(d.workLocation || d.location || "________"),
        COMPANY_ADDRESS: (co.address || "").replace(/\n/g, ", "),
        STATE: d.state || "Andhra Pradesh",
        COMPANY_STATE: d.state || "Andhra Pradesh",
        SIGNATORY_NAME: stripAsterisks(d.sigName || co.signatoryName || "Authorized Signatory"),
        SIGNATORY_DESIGNATION: stripAsterisks(d.sigDesignation || co.signatoryDesignation || "HR Manager"),
        DURATION: bold2(d.duration || "________"),
        STIPEND_STR: bold2(`INR ${fmt2(d.revisedCtc || d.ctc || 0)}`),
        EFFECTIVE_FROM: bold2(formatDate(d.internshipStart || d.joiningDate || d.joinDate || d.date)),
        EFFECTIVE_TO: bold2(formatDate(d.internshipEnd || d.probationEnd || d.offerExpiry)),
        CONTRACT_EFFECTIVE_TO: bold2(formatDate(d.internshipEnd || d.probationEnd || d.offerExpiry)),
        CONFIRMATION_DATE: bold2(formatDate(d.confirmationDate || d.date || today)),
        PROBATION_END_DATE: bold2(formatDate(d.probationEndDate || d.date)),
        PROBATION_DECISION: bold2(d.probationDecision || "CONFIRMED"),
        REVIEWER_NAME: bold2(d.reviewerName || "________"),
        HR_NAME: stripAsterisks(d.sigName || co.signatoryName || "Authorized Signatory"),
        NOTICEC: d.noticePeriod || "30",
        LAST_WORKING_DAY: bold2(formatDate(d.lastWorkingDay || d.relievingDate)),
        EXIT_DATE: bold2(formatDate(d.lastWorkingDay || d.relievingDate)),
    };
}

function getFallbackBody(type, data, today) {
    const d = data;
    const cleanCoName = cleanCompanyName(DEFAULT_CO.name);
    const validVal = d.offerExpiry || d.validTill || d.validTillOffer || d.valid_till || d.validDate || d.validUntil;
    const joinVal = d.joiningDate || d.joinDate;
    const ctcAmount = d.revisedCtc || d.ctc || 0;
    const ctcWords = numToWords2(ctcAmount) || "Zero";
    const designationTitled = toTitleCase(stripAsterisks(d.designation || "________"));

    if (type === "OFFER") {
        return [
            `We are pleased to appoint you as **${designationTitled}** with **${cleanCoName}**, as per the terms and conditions stated below:`,
            `1. Your offer letter is valid till **${formatDate(validVal) || "________"}** and you are required to confirm acceptance and join on **${formatDate(joinVal) || "________"}**.`,
            `2. Your annual Cost to Company (CTC) will be **INR ${fmt2(ctcAmount)} (${ctcWords} Only)**.`,
            "We look forward to welcoming you to our team.",
        ].join("\n\n");
    }

    if (type === "PROBATION") {
        const ctcAmountP = d.revisedCtc || d.ctc || 0;
        const ctcWordsP = numToWords2(ctcAmountP) || "Zero";
        const confirmDate = formatDate(d.confirmationDate || d.date || today) || today;
        return [
            `We are delighted to formally confirm your employment for the role of **${designationTitled}**, which will commence on **${confirmDate}**.`,
            `Your current CTC is **INR ${fmt2(ctcAmountP)} (${ctcWordsP} Only)**.`,
            "Enclosed herewith, you will find a comprehensive breakdown of your salary details. It is important to note that your salary will be subject to periodic reviews in accordance with the company's policies related to your role. Any adjustments will be based on your satisfactory performance. The remaining terms and conditions of your employment will remain unchanged.",
            "Congratulations on this significant step in your career! We eagerly anticipate the valuable contributions you will bring, and we extend our best wishes for success in this new endeavour.",
        ].join("\n\n");
    }

    if (type === "INCREMENT") {
        return `In recognition of your hard work and commitment, we are pleased to inform you that your annual remuneration has been revised to {{CTC}} Effective from {{EFFECTIVE_FROM}}, your salary will be subject to periodic reviews in accordance with the company's policies.

For a detailed breakdown of your revised compensation package, please refer to Annexure III. It is important to note that all other terms and conditions of your employment contract remain unchanged.

Congratulations on your well-deserved success! We appreciate your continued dedication and contributions to the company.`;
    }

    return `This is a letter regarding your ${type} status issued on ${today}.`;
}

// ─── ATTENDANCE REPORT GENERATOR ─────────────────────────────────────────────
export async function generateAttendanceReportPDF(data, employee, company) {
    const fileName = `attendance_${employee.employeeId}_${data.month}_${data.year}.pdf`;
    const folder = "documents";
    const filePath = path.join(__dirname, "../../uploads", folder, fileName);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 30 }, size: "A4" });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            drawPageHeader(doc, company);

            doc.font(F.bold).fontSize(14).fillColor(C.black).text("ATTENDANCE REPORT", MARGIN, doc.y, { align: "center", width: CONTENT_WIDTH });
            doc.font(F.reg).fontSize(10).fillColor(C.muted).text(`${data.monthString} ${data.year}`, MARGIN, doc.y + 16, { align: "center", width: CONTENT_WIDTH });
            doc.y += 35;
            doc.font(F.bold).fontSize(11).text(employee.name, MARGIN, doc.y);
            doc.font(F.reg).fontSize(10).text(`${toTitleCase(employee.designation)} | ${employee.department}`, MARGIN, doc.y + 14);
            doc.y += 30;

            const COL = { date: MARGIN, status: MARGIN + 120, in: MARGIN + 220, out: MARGIN + 320 };
            const startY = doc.y;
            doc.rect(MARGIN, startY, CONTENT_WIDTH, 20).fill(C.black);
            doc.font(F.bold).fontSize(9).fillColor(C.white);
            doc.text("Date", COL.date + 5, startY + 6, { lineBreak: false });
            doc.text("Status", COL.status, startY + 6, { lineBreak: false });
            doc.text("In", COL.in, startY + 6, { lineBreak: false });
            doc.text("Out", COL.out, startY + 6, { lineBreak: false });
            doc.y = startY + 20;

            data.records.forEach((r, i) => {
                if (doc.y > 750) {
                    doc.addPage(); drawPageHeader(doc, company);
                    const hh = doc.y;
                    doc.rect(MARGIN, hh, CONTENT_WIDTH, 20).fill(C.black);
                    doc.font(F.bold).fontSize(9).fillColor(C.white);
                    doc.text("Date", COL.date + 5, hh + 6, { lineBreak: false });
                    doc.text("Status", COL.status, hh + 6, { lineBreak: false });
                    doc.text("In", COL.in, hh + 6, { lineBreak: false });
                    doc.text("Out", COL.out, hh + 6, { lineBreak: false });
                    doc.y = hh + 20;
                }
                const rowY = doc.y;
                doc.rect(MARGIN, rowY, CONTENT_WIDTH, 18).fill(i % 2 === 0 ? C.white : C.rowAlt);
                doc.font(F.reg).fontSize(8.5).fillColor(C.black);
                doc.text(new Date(r.date).toLocaleDateString("en-IN"), COL.date + 5, rowY + 5, { lineBreak: false });
                doc.text(r.status, COL.status, rowY + 5, { lineBreak: false });
                doc.text(r.checkIn || "—", COL.in, rowY + 5, { lineBreak: false });
                doc.text(r.checkOut || "—", COL.out, rowY + 5, { lineBreak: false });
                doc.y = rowY + 18;
            });

            doc.end();
            doc.on("end", async () => {
                try {
                    const pdfBuffer = Buffer.concat(chunks);
                    const dbFile = await prisma.fileStorage.create({
                        data: { filename: fileName, mimeType: "application/pdf", data: pdfBuffer }
                    });
                    resolve(`/api/upload/file/${dbFile.id}`);
                } catch (err) { reject(err); }
            });
        } catch (err) { reject(err); }
    });
}