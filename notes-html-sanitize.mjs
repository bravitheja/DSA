/**
 * Sanitize rich-notes HTML before persistence, sync, or preview innerHTML.
 * @see https://github.com/cure53/DOMPurify
 */
import DOMPurify from "https://esm.sh/dompurify@3.1.7?target=es2022";

const ALLOW_STYLE_PROPS = new Set(["color", "font-size", "background-color"]);

DOMPurify.addHook("uponSanitizeElement", (node) => {
    if (node.nodeType !== 1 || node.nodeName !== "INPUT") return;
    const t = (/** @type {Element} */ (node).getAttribute("type") || "").toLowerCase();
    if (t !== "checkbox") {
        node.parentNode?.removeChild(node);
    }
});

DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    if (data.attrName !== "style") return;
    const raw = data.attrValue || "";
    const parts = raw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
    const kept = [];
    for (const p of parts) {
        const colon = p.indexOf(":");
        if (colon === -1) continue;
        const prop = p.slice(0, colon).trim().toLowerCase();
        if (!ALLOW_STYLE_PROPS.has(prop)) continue;
        const val = p.slice(colon + 1).trim();
        if (/url\s*\(/i.test(val)) continue;
        if (/expression\s*\(/i.test(val)) continue;
        if (/javascript:/i.test(val)) continue;
        if (/[@/\\]import/i.test(val)) continue;
        kept.push(`${prop}: ${val}`);
    }
    if (kept.length) {
        data.attrValue = kept.join("; ");
    } else {
        data.keepAttr = false;
    }
});

const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "strike",
        "del",
        "span",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "div",
        "hr",
        "mark",
        "label",
        "input",
    ],
    ALLOWED_ATTR: [
        "href",
        "title",
        "target",
        "rel",
        "class",
        "style",
        "data-color",
        "data-type",
        "data-checked",
        "type",
        "checked",
    ],
    ALLOW_DATA_ATTR: false,
};

/**
 * @param {string} html
 * @returns {string}
 */
export function sanitizeNotesHtml(html) {
    if (!html || typeof html !== "string") return "";
    return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
