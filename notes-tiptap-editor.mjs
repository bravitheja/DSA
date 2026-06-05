/**
 * TipTap rich notes (colors, sizes, lists, links, code blocks).
 * All @tiptap/* imports share pinned versions + deps so esm.sh does not duplicate @tiptap/pm.
 */
/**
 * Pin one TipTap release for every import. Mixed versions break StarterKit’s
 * horizontal-rule (`canInsertNode` must exist on `@tiptap/core`).
 */
import { Extension, Editor } from "https://esm.sh/@tiptap/core@2.27.2?deps=@tiptap/pm@2.27.2&target=es2022";
import { TextSelection } from "https://esm.sh/@tiptap/pm@2.27.2/state?target=es2022";
import StarterKit from "https://esm.sh/@tiptap/starter-kit@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import CodeBlockLowlight from "https://esm.sh/@tiptap/extension-code-block-lowlight@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2,lowlight@3.1.0&target=es2022";
import TextStyle from "https://esm.sh/@tiptap/extension-text-style@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Color from "https://esm.sh/@tiptap/extension-color@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2,@tiptap/extension-text-style@2.27.2&target=es2022";
import Underline from "https://esm.sh/@tiptap/extension-underline@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Link from "https://esm.sh/@tiptap/extension-link@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Highlight from "https://esm.sh/@tiptap/extension-highlight@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Placeholder from "https://esm.sh/@tiptap/extension-placeholder@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import BubbleMenu from "https://esm.sh/@tiptap/extension-bubble-menu@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import TaskList from "https://esm.sh/@tiptap/extension-task-list@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import TaskItem from "https://esm.sh/@tiptap/extension-task-item@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Table from "https://esm.sh/@tiptap/extension-table@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2,@tiptap/extension-table-row@2.27.2,@tiptap/extension-table-cell@2.27.2,@tiptap/extension-table-header@2.27.2&target=es2022";
import TableRow from "https://esm.sh/@tiptap/extension-table-row@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import TableHeader from "https://esm.sh/@tiptap/extension-table-header@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import TableCell from "https://esm.sh/@tiptap/extension-table-cell@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import { createLowlight } from "https://esm.sh/lowlight@3.1.0?target=es2022";
import pythonLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/python?target=es2022";
import javascriptLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/javascript?target=es2022";
import typescriptLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/typescript?target=es2022";
import bashLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/bash?target=es2022";
import jsonLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/json?target=es2022";
import sqlLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/sql?target=es2022";
import xmlLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/xml?target=es2022";
import cssLang from "https://esm.sh/highlight.js@11.11.1/lib/languages/css?target=es2022";

const FontSize = Extension.create({
    name: "fontSize",
    addGlobalAttributes() {
        return [
            {
                types: ["textStyle"],
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => {
                            const fs = element.style?.fontSize;
                            return fs ? String(fs).replace(/['"]+/g, "") : null;
                        },
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
});

const FONT_SIZES = ["12px", "14px", "16px", "18px", "22px"];
const CODE_LANGS = [
    { value: "plaintext", label: "plain" },
    { value: "python", label: "python" },
    { value: "javascript", label: "javascript" },
    { value: "typescript", label: "typescript" },
    { value: "bash", label: "bash" },
    { value: "json", label: "json" },
    { value: "sql", label: "sql" },
    { value: "html", label: "html" },
    { value: "css", label: "css" },
];

const lowlight = createLowlight();
lowlight.register("python", pythonLang);
lowlight.register("javascript", javascriptLang);
lowlight.register("typescript", typescriptLang);
lowlight.register("bash", bashLang);
lowlight.register("json", jsonLang);
lowlight.register("sql", sqlLang);
lowlight.register("html", xmlLang);
lowlight.register("css", cssLang);

/** Fixed text colors (Notion-like restraint vs free-form picker). */
const DOC_TEXT_COLORS = ["#111827", "#b91c1c", "#c2410c", "#15803d", "#1d4ed8", "#7c3aed"];

/** Fixed highlight fills (stored as inline style; palette stays consistent). */
const DOC_HIGHLIGHTS = [
    { color: "#fef08a", label: "Yellow" },
    { color: "#bfdbfe", label: "Blue" },
    { color: "#fecaca", label: "Red" },
    { color: "#d9f99d", label: "Green" },
    { color: "#e9d5ff", label: "Purple" },
];

function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
}

function mkToolbarBtn(editor, label, title, run) {
    const b = el("button", "notes-rich-toolbar__pill", label);
    b.type = "button";
    b.title = title;
    b.addEventListener("click", () => {
        run();
        editor.commands.focus();
    });
    return b;
}

function mkBubbleBtn(editor, label, title, run, extraClass, activeKind) {
    const b = el("button", `notes-rich-bubble__btn${extraClass ? ` ${extraClass}` : ""}`, label);
    b.type = "button";
    b.title = title;
    if (activeKind) b.dataset.bubbleActive = activeKind;
    b.addEventListener("click", () => {
        run();
        editor.commands.focus();
    });
    return b;
}

function insertDefaultTable(editor) {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
}

function applyCodeLanguage(editor, language) {
    const lang = String(language || "plaintext");
    const chain = editor.chain().focus();
    if (!editor.isActive("codeBlock")) {
        chain.toggleCodeBlock();
    }
    chain.updateAttributes("codeBlock", { language: lang }).run();
}

function bubbleVsep() {
    const n = el("span", "notes-rich-bubble__vsep");
    n.setAttribute("aria-hidden", "true");
    return n;
}

function bubbleBtnActive(editor, kind) {
    switch (kind) {
        case "bold":
            return editor.isActive("bold");
        case "italic":
            return editor.isActive("italic");
        case "underline":
            return editor.isActive("underline");
        case "strike":
            return editor.isActive("strike");
        case "code":
            return editor.isActive("code");
        case "codeBlock":
            return editor.isActive("codeBlock");
        case "blockquote":
            return editor.isActive("blockquote");
        case "bulletList":
            return editor.isActive("bulletList");
        case "orderedList":
            return editor.isActive("orderedList");
        case "taskList":
            return editor.isActive("taskList");
        case "h1":
            return editor.isActive("heading", { level: 1 });
        case "h2":
            return editor.isActive("heading", { level: 2 });
        case "paragraph":
            return editor.isActive("paragraph");
        case "link":
            return editor.isActive("link");
        case "table":
            return editor.isActive("table");
        default:
            return false;
    }
}

/** Toggle `.notes-rich-bubble__btn--active` from `data-bubble-active` marks. */
function wireBubbleToolbarState(editor, panel) {
    const refresh = () => {
        for (const btn of panel.querySelectorAll("[data-bubble-active]")) {
            if (!(btn instanceof HTMLElement)) continue;
            const k = btn.dataset.bubbleActive;
            if (!k) continue;
            btn.classList.toggle("notes-rich-bubble__btn--active", bubbleBtnActive(editor, k));
        }
    };
    refresh();
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
        editor.off("selectionUpdate", refresh);
        editor.off("transaction", refresh);
    };
}

/** Full strip for problem-notes sheet (legacy layout). */
function buildToolbar(editor) {
    const bar = el("div", "notes-rich-toolbar");

    bar.appendChild(mkToolbarBtn(editor, "B", "Bold", () => editor.chain().focus().toggleBold().run()));
    bar.appendChild(mkToolbarBtn(editor, "I", "Italic", () => editor.chain().focus().toggleItalic().run()));
    bar.appendChild(mkToolbarBtn(editor, "U", "Underline", () => editor.chain().focus().toggleUnderline().run()));
    bar.appendChild(mkToolbarBtn(editor, "S", "Strike", () => editor.chain().focus().toggleStrike().run()));
    bar.appendChild(mkToolbarBtn(editor, "•", "Bullet list", () => editor.chain().focus().toggleBulletList().run()));
    bar.appendChild(mkToolbarBtn(editor, "1.", "Ordered list", () => editor.chain().focus().toggleOrderedList().run()));
    bar.appendChild(mkToolbarBtn(editor, "☐", "Task list", () => editor.chain().focus().toggleTaskList().run()));
    bar.appendChild(mkToolbarBtn(editor, "</>", "Code", () => editor.chain().focus().toggleCode().run()));
    bar.appendChild(mkToolbarBtn(editor, "{ }", "Code block", () => editor.chain().focus().toggleCodeBlock().run()));
    bar.appendChild(mkToolbarBtn(editor, "❝", "Quote", () => editor.chain().focus().toggleBlockquote().run()));
    bar.appendChild(mkToolbarBtn(editor, "H1", "Heading 1", () => editor.chain().focus().toggleHeading({ level: 1 }).run()));
    bar.appendChild(mkToolbarBtn(editor, "H2", "Heading 2", () => editor.chain().focus().toggleHeading({ level: 2 }).run()));
    bar.appendChild(mkToolbarBtn(editor, "¶", "Paragraph", () => editor.chain().focus().setParagraph().run()));
    bar.appendChild(mkToolbarBtn(editor, "Tbl", "Insert 3x3 table", () => insertDefaultTable(editor)));
    bar.appendChild(mkToolbarBtn(editor, "+R", "Add row after", () => editor.chain().focus().addRowAfter().run()));
    bar.appendChild(mkToolbarBtn(editor, "-R", "Delete current row", () => editor.chain().focus().deleteRow().run()));
    bar.appendChild(mkToolbarBtn(editor, "+C", "Add column after", () => editor.chain().focus().addColumnAfter().run()));
    bar.appendChild(mkToolbarBtn(editor, "-C", "Delete current column", () => editor.chain().focus().deleteColumn().run()));
    bar.appendChild(mkToolbarBtn(editor, "DelTbl", "Delete table", () => editor.chain().focus().deleteTable().run()));

    const colorWrap = el("label", "notes-rich-toolbar__color");
    const colorLab = el("span", null, "A");
    colorLab.title = "Text color";
    const colorIn = document.createElement("input");
    colorIn.type = "color";
    colorIn.className = "notes-rich-toolbar__color-input";
    colorIn.value = "#111827";
    colorIn.title = "Text color";
    colorIn.addEventListener("input", () => {
        editor.chain().focus().setColor(colorIn.value).run();
    });
    colorWrap.appendChild(colorLab);
    colorWrap.appendChild(colorIn);

    const hiWrap = el("label", "notes-rich-toolbar__color");
    const hiLab = el("span", null, "Hi");
    hiLab.title = "Highlight";
    const hiIn = document.createElement("input");
    hiIn.type = "color";
    hiIn.className = "notes-rich-toolbar__color-input";
    hiIn.value = "#fef08a";
    hiIn.title = "Highlight";
    hiIn.addEventListener("input", () => {
        editor.chain().focus().toggleHighlight({ color: hiIn.value }).run();
    });
    hiWrap.appendChild(hiLab);
    hiWrap.appendChild(hiIn);

    const sizeSel = el("select", "notes-rich-toolbar__select");
    sizeSel.title = "Font size";
    for (const fs of FONT_SIZES) {
        const o = document.createElement("option");
        o.value = fs;
        o.textContent = fs;
        sizeSel.appendChild(o);
    }
    sizeSel.value = "16px";
    sizeSel.addEventListener("change", () => {
        const v = sizeSel.value || "16px";
        const cur = editor.getAttributes("textStyle") || {};
        editor.chain().focus().setMark("textStyle", { ...cur, fontSize: v }).run();
    });

    const codeSel = el("select", "notes-rich-toolbar__select");
    codeSel.title = "Code language";
    for (const lang of CODE_LANGS) {
        const o = document.createElement("option");
        o.value = lang.value;
        o.textContent = lang.label;
        codeSel.appendChild(o);
    }
    codeSel.value = "plaintext";
    codeSel.addEventListener("change", () => {
        applyCodeLanguage(editor, codeSel.value);
    });

    bar.appendChild(colorWrap);
    bar.appendChild(hiWrap);
    bar.appendChild(sizeSel);
    bar.appendChild(codeSel);

    bar.appendChild(
        mkToolbarBtn(editor, "🔗", "Add link", () => {
            const prev = window.prompt("Link URL", "https://");
            if (prev == null || prev === "") return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: prev }).run();
        })
    );
    bar.appendChild(mkToolbarBtn(editor, "⌫ link", "Remove link", () => editor.chain().focus().unsetLink().run()));

    return bar;
}

/**
 * General-notes floating bar: compact Notion-style rows. Opaque shell is on
 * `.notes-rich-bubble`; drag applies `translate` there so the card never slides off its fill.
 */
function buildBubbleToolbar(editor) {
    const panel = el("div", "notes-rich-bubble__panel notes-rich-bubble__panel--notion");

    const grip = el("div", "notes-rich-bubble__grip");
    const drag = el("div", "notes-rich-bubble__drag");
    drag.title = "Drag to move";
    drag.appendChild(el("span", "notes-rich-bubble__drag-grip", "⋮⋮"));
    drag.appendChild(el("span", "notes-rich-bubble__drag-hint", "Move"));
    grip.appendChild(drag);
    panel.appendChild(grip);

    const body = el("div", "notes-rich-bubble__notion-body");

    const rowMain = el("div", "notes-rich-bubble__row notes-rich-bubble__row--notion-main");
    rowMain.appendChild(mkBubbleBtn(editor, "B", "Bold", () => editor.chain().focus().toggleBold().run(), undefined, "bold"));
    rowMain.appendChild(mkBubbleBtn(editor, "I", "Italic", () => editor.chain().focus().toggleItalic().run(), undefined, "italic"));
    rowMain.appendChild(mkBubbleBtn(editor, "U", "Underline", () => editor.chain().focus().toggleUnderline().run(), undefined, "underline"));
    rowMain.appendChild(mkBubbleBtn(editor, "S", "Strike", () => editor.chain().focus().toggleStrike().run(), undefined, "strike"));
    rowMain.appendChild(bubbleVsep());
    rowMain.appendChild(mkBubbleBtn(editor, "•", "Bullet list", () => editor.chain().focus().toggleBulletList().run(), undefined, "bulletList"));
    rowMain.appendChild(mkBubbleBtn(editor, "1.", "Ordered list", () => editor.chain().focus().toggleOrderedList().run(), undefined, "orderedList"));
    rowMain.appendChild(mkBubbleBtn(editor, "☐", "Task list", () => editor.chain().focus().toggleTaskList().run(), undefined, "taskList"));
    rowMain.appendChild(mkBubbleBtn(editor, "</>", "Inline code", () => editor.chain().focus().toggleCode().run(), undefined, "code"));
    rowMain.appendChild(mkBubbleBtn(editor, "{ }", "Code block", () => editor.chain().focus().toggleCodeBlock().run(), undefined, "codeBlock"));
    rowMain.appendChild(mkBubbleBtn(editor, "❝", "Quote", () => editor.chain().focus().toggleBlockquote().run(), undefined, "blockquote"));
    rowMain.appendChild(bubbleVsep());
    rowMain.appendChild(mkBubbleBtn(editor, "H1", "Heading 1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), undefined, "h1"));
    rowMain.appendChild(mkBubbleBtn(editor, "H2", "Heading 2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), undefined, "h2"));
    rowMain.appendChild(mkBubbleBtn(editor, "¶", "Paragraph", () => editor.chain().focus().setParagraph().run(), undefined, "paragraph"));
    rowMain.appendChild(bubbleVsep());
    const sizeSel = document.createElement("select");
    sizeSel.className = "notes-rich-bubble__select notes-rich-bubble__select--notion";
    sizeSel.dataset.role = "font-size";
    sizeSel.title = "Font size";
    for (const fs of FONT_SIZES) {
        const o = document.createElement("option");
        o.value = fs;
        o.textContent = fs;
        sizeSel.appendChild(o);
    }
    sizeSel.value = "16px";
    sizeSel.addEventListener("change", () => {
        const v = sizeSel.value || "16px";
        const cur = editor.getAttributes("textStyle") || {};
        editor.chain().focus().setMark("textStyle", { ...cur, fontSize: v }).run();
    });
    rowMain.appendChild(sizeSel);
    const codeSel = document.createElement("select");
    codeSel.className = "notes-rich-bubble__select notes-rich-bubble__select--notion";
    codeSel.dataset.role = "code-lang";
    codeSel.title = "Code language";
    for (const lang of CODE_LANGS) {
        const o = document.createElement("option");
        o.value = lang.value;
        o.textContent = lang.label;
        codeSel.appendChild(o);
    }
    codeSel.value = "plaintext";
    codeSel.addEventListener("change", () => {
        applyCodeLanguage(editor, codeSel.value);
    });
    rowMain.appendChild(codeSel);
    body.appendChild(rowMain);

    body.appendChild(el("div", "notes-rich-bubble__sep"));

    const rowText = el("div", "notes-rich-bubble__row notes-rich-bubble__row--swatches notes-rich-bubble__row--swatches-tight");
    for (const c of DOC_TEXT_COLORS) {
        const sw = el("button", "notes-rich-bubble__swatch notes-rich-bubble__swatch--text");
        sw.type = "button";
        sw.title = `Text ${c}`;
        sw.style.setProperty("--swatch", c);
        sw.addEventListener("click", () => {
            editor.chain().focus().setColor(c).run();
        });
        rowText.appendChild(sw);
    }
    body.appendChild(rowText);

    const rowHi = el("div", "notes-rich-bubble__row notes-rich-bubble__row--swatches notes-rich-bubble__row--swatches-tight");
    for (const { color, label } of DOC_HIGHLIGHTS) {
        const sw = el("button", "notes-rich-bubble__swatch notes-rich-bubble__swatch--hi");
        sw.type = "button";
        sw.title = `Highlight: ${label}`;
        sw.style.setProperty("--swatch", color);
        sw.addEventListener("click", () => {
            editor.chain().focus().toggleHighlight({ color }).run();
        });
        rowHi.appendChild(sw);
    }
    rowHi.appendChild(
        mkBubbleBtn(editor, "Clear", "Remove highlight", () => editor.chain().focus().unsetHighlight().run(), "notes-rich-bubble__btn--compact")
    );
    body.appendChild(rowHi);

    body.appendChild(el("div", "notes-rich-bubble__sep"));

    const rowLink = el("div", "notes-rich-bubble__row notes-rich-bubble__row--notion-link");
    rowLink.appendChild(
        mkBubbleBtn(
            editor,
            "🔗",
            "Add link",
            () => {
                const prev = window.prompt("Link URL", "https://");
                if (prev == null || prev === "") return;
                editor.chain().focus().extendMarkRange("link").setLink({ href: prev }).run();
            },
            undefined,
            "link"
        )
    );
    rowLink.appendChild(mkBubbleBtn(editor, "⌫", "Remove link", () => editor.chain().focus().unsetLink().run()));
    body.appendChild(rowLink);

    const rowTable = el("div", "notes-rich-bubble__row notes-rich-bubble__row--notion-link");
    rowTable.appendChild(
        mkBubbleBtn(editor, "Tbl", "Insert 3x3 table", () => insertDefaultTable(editor), "notes-rich-bubble__btn--compact", "table")
    );
    rowTable.appendChild(
        mkBubbleBtn(editor, "+R", "Add row after", () => editor.chain().focus().addRowAfter().run(), "notes-rich-bubble__btn--compact")
    );
    rowTable.appendChild(
        mkBubbleBtn(editor, "-R", "Delete current row", () => editor.chain().focus().deleteRow().run(), "notes-rich-bubble__btn--compact")
    );
    rowTable.appendChild(
        mkBubbleBtn(editor, "+C", "Add column after", () => editor.chain().focus().addColumnAfter().run(), "notes-rich-bubble__btn--compact")
    );
    rowTable.appendChild(
        mkBubbleBtn(editor, "-C", "Delete current column", () => editor.chain().focus().deleteColumn().run(), "notes-rich-bubble__btn--compact")
    );
    rowTable.appendChild(
        mkBubbleBtn(editor, "DelTbl", "Delete table", () => editor.chain().focus().deleteTable().run(), "notes-rich-bubble__btn--compact")
    );
    body.appendChild(rowTable);

    panel.appendChild(body);
    return panel;
}

/** Drag-reposition the whole bubble root (offset from Tippy anchor). Cleans up on return. */
function attachBubbleDrag(editor, bubbleRoot) {
    const drag = bubbleRoot.querySelector(".notes-rich-bubble__drag");
    if (!drag || !(drag instanceof HTMLElement)) {
        return () => {};
    }
    const dragWin = bubbleRoot.ownerDocument.defaultView;
    if (!dragWin) {
        return () => {};
    }

    let dragX = 0;
    let dragY = 0;
    let dragging = false;
    let startClient = { x: 0, y: 0 };
    let startOffset = { x: 0, y: 0 };
    let lastRangeKey = "";

    const applyTransform = () => {
        if (dragX === 0 && dragY === 0) {
            bubbleRoot.style.transform = "";
        } else {
            bubbleRoot.style.transform = `translate(${dragX}px, ${dragY}px)`;
        }
    };

    const onPointerDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        startClient = { x: e.clientX, y: e.clientY };
        startOffset = { x: dragX, y: dragY };
        drag.classList.add("notes-rich-bubble__drag--dragging");
        try {
            drag.setPointerCapture(e.pointerId);
        } catch (_) {
            /* ignore */
        }
    };

    const onPointerMove = (e) => {
        if (!dragging) return;
        dragX = startOffset.x + (e.clientX - startClient.x);
        dragY = startOffset.y + (e.clientY - startClient.y);
        applyTransform();
    };

    const onPointerUp = (e) => {
        if (!dragging) return;
        dragging = false;
        drag.classList.remove("notes-rich-bubble__drag--dragging");
        try {
            drag.releasePointerCapture(e.pointerId);
        } catch (_) {
            /* ignore */
        }
    };

    const onSelectionUpdate = () => {
        const { from, to } = editor.state.selection;
        const key = `${from}-${to}`;
        if (from === to) {
            dragX = 0;
            dragY = 0;
            applyTransform();
            lastRangeKey = key;
            return;
        }
        if (key !== lastRangeKey) {
            dragX = 0;
            dragY = 0;
            applyTransform();
            lastRangeKey = key;
        }
    };

    drag.addEventListener("pointerdown", onPointerDown);
    dragWin.addEventListener("pointermove", onPointerMove);
    dragWin.addEventListener("pointerup", onPointerUp);
    dragWin.addEventListener("pointercancel", onPointerUp);
    editor.on("selectionUpdate", onSelectionUpdate);

    return () => {
        drag.removeEventListener("pointerdown", onPointerDown);
        dragWin.removeEventListener("pointermove", onPointerMove);
        dragWin.removeEventListener("pointerup", onPointerUp);
        dragWin.removeEventListener("pointercancel", onPointerUp);
        editor.off("selectionUpdate", onSelectionUpdate);
        bubbleRoot.style.transform = "";
    };
}

/**
 * @param {HTMLElement | null} toolbarHost — toolbar pills (sibling of editor is typical)
 * @param {HTMLElement} editorHost — TipTap / ProseMirror mount target (replaced on destroy)
 * @param {{
 *   initialHtml: string;
 *   isDark: boolean;
 *   placeholder?: string;
 *   onChange?: () => void;
 *   documentSurface?: boolean;
 * }} opts — when true (e.g. session sticky / compact surface), floating bubble only (no bottom strip)
 */
export function mountRichNotesEditor(toolbarHost, editorHost, opts) {
    if (toolbarHost) toolbarHost.replaceChildren();
    editorHost.replaceChildren();
    editorHost.classList.add("notes-rich-prose-host");
    if (opts.isDark) editorHost.classList.add("notes-rich-editor--dark");

    const docSurface = !!opts.documentSurface;
    const surfaceDoc = editorHost.ownerDocument;
    /** @type {HTMLElement | null} */
    let bubbleRoot = null;
    /** @type {null | (() => void)} */
    let bubbleDragDispose = null;
    if (docSurface) {
        bubbleRoot = el("div", "notes-rich-bubble");
        editorHost.parentNode?.insertBefore(bubbleRoot, editorHost);
    }

    const extensions = [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
            codeBlock: false,
        }),
        CodeBlockLowlight.configure({
            lowlight,
            defaultLanguage: "plaintext",
            languageClassPrefix: "language-",
            HTMLAttributes: { class: "notes-rich-codeblock" },
        }),
        TaskList,
        TaskItem,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        TextStyle,
        FontSize,
        Color,
        Highlight.configure({ multicolor: true }),
        Underline,
        Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
        Placeholder.configure({
            placeholder: opts.placeholder ?? "Write notes… Use the toolbar for colors, lists, code blocks, and tables.",
        }),
    ];

    if (docSurface && bubbleRoot) {
        extensions.push(
            BubbleMenu.configure({
                element: bubbleRoot,
                shouldShow: ({ editor: ed, state }) => {
                    const { from, to } = state.selection;
                    return from !== to && ed.isEditable;
                },
                tippyOptions: {
                    theme: "dsa-gn-bubble",
                    arrow: false,
                    placement: "top-start",
                    flip: true,
                    /** Tighter gap so the chip feels anchored to the selection */
                    offset: [0, 6],
                    moveTransition: "transform 0.1s ease-out",
                    sticky: true,
                    /** Popper targets the same document as the editor (main app vs Document PiP). */
                    appendTo: () => surfaceDoc.body,
                    zIndex: 110050,
                    maxWidth: "none",
                },
            })
        );
    }

    const editor = new Editor({
        element: editorHost,
        editable: true,
        extensions,
        content: opts.initialHtml || "<p></p>",
        editorProps: {
            attributes: {
                class: "notes-rich-prosemirror",
                spellcheck: "true",
                tabindex: "0",
            },
        },
        onUpdate: () => opts.onChange?.(),
    });

    if (docSurface && bubbleRoot) {
        const bubblePanel = buildBubbleToolbar(editor);
        bubbleRoot.appendChild(bubblePanel);
        const dragClean = attachBubbleDrag(editor, bubbleRoot);
        const stateClean = wireBubbleToolbarState(editor, bubblePanel);
        const sizeSel = bubblePanel.querySelector('select.notes-rich-bubble__select[data-role="font-size"]');
        const codeSel = bubblePanel.querySelector('select.notes-rich-bubble__select[data-role="code-lang"]');
        const syncBubbleFontSize = () => {
            if (!(sizeSel instanceof HTMLSelectElement)) return;
            const a = editor.getAttributes("textStyle");
            const fs = (a && a.fontSize) || "16px";
            sizeSel.value = FONT_SIZES.includes(fs) ? fs : "16px";
        };
        const syncBubbleCodeLang = () => {
            if (!(codeSel instanceof HTMLSelectElement)) return;
            const attrs = editor.getAttributes("codeBlock") || {};
            const lang = String(attrs.language || "plaintext");
            const known = CODE_LANGS.some((x) => x.value === lang);
            codeSel.value = known ? lang : "plaintext";
        };
        if (sizeSel instanceof HTMLSelectElement) {
            syncBubbleFontSize();
            editor.on("selectionUpdate", syncBubbleFontSize);
            editor.on("transaction", syncBubbleFontSize);
        }
        if (codeSel instanceof HTMLSelectElement) {
            syncBubbleCodeLang();
            editor.on("selectionUpdate", syncBubbleCodeLang);
            editor.on("transaction", syncBubbleCodeLang);
        }
        bubbleDragDispose = () => {
            dragClean();
            stateClean();
            if (sizeSel instanceof HTMLSelectElement) {
                editor.off("selectionUpdate", syncBubbleFontSize);
                editor.off("transaction", syncBubbleFontSize);
            }
            if (codeSel instanceof HTMLSelectElement) {
                editor.off("selectionUpdate", syncBubbleCodeLang);
                editor.off("transaction", syncBubbleCodeLang);
            }
        };
    }

    /** Move caret to document end and ensure the contenteditable receives real focus. */
    const focusAtDocEnd = () => {
        const view = editor.view;
        if (!view.dom.isConnected) return;
        view.focus({ preventScroll: true });
        view.dispatch(view.state.tr.setSelection(TextSelection.atEnd(view.state.doc)).scrollIntoView());
        view.focus({ preventScroll: true });
    };

    const toolbar = docSurface ? null : buildToolbar(editor);
    if (toolbar) {
        if (toolbarHost) {
            toolbarHost.appendChild(toolbar);
        } else {
            editorHost.parentNode?.insertBefore(toolbar, editorHost);
        }
    } else if (toolbarHost) {
        toolbarHost.replaceChildren();
    }

    return {
        getHtml: () => editor.getHTML(),
        setHtml: (html) => {
            const h = html && String(html).trim() ? String(html) : "<p></p>";
            editor.commands.setContent(h, false);
        },
        focus: () => focusAtDocEnd(),
        /** Called from title field: Enter = caret at end; Shift+Enter = caret + hard break (line inside body). */
        focusFromTitle: (selOpts) => {
            focusAtDocEnd();
            if (selOpts && selOpts.shiftKey) {
                editor.chain().focus().setHardBreak().run();
            }
        },
        setDark: (dark) => {
            editorHost.classList.toggle("notes-rich-editor--dark", !!dark);
            if (toolbarHost) toolbarHost.classList.toggle("notes-rich-toolbar-host--dark", !!dark);
            bubbleRoot?.classList.toggle("notes-rich-bubble--dark", !!dark);
        },
        destroy: () => {
            bubbleDragDispose?.();
            bubbleDragDispose = null;
            editor.destroy();
            bubbleRoot?.remove();
            bubbleRoot = null;
            editorHost.replaceChildren();
            editorHost.classList.remove("notes-rich-prose-host", "notes-rich-editor--dark");
            if (toolbarHost) toolbarHost.replaceChildren();
            else toolbar?.remove();
        },
    };
}
