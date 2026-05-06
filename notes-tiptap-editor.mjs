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
import TextStyle from "https://esm.sh/@tiptap/extension-text-style@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Color from "https://esm.sh/@tiptap/extension-color@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2,@tiptap/extension-text-style@2.27.2&target=es2022";
import Underline from "https://esm.sh/@tiptap/extension-underline@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Link from "https://esm.sh/@tiptap/extension-link@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Highlight from "https://esm.sh/@tiptap/extension-highlight@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";
import Placeholder from "https://esm.sh/@tiptap/extension-placeholder@2.27.2?deps=@tiptap/core@2.27.2,@tiptap/pm@2.27.2&target=es2022";

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

function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
}

function buildToolbar(editor) {
    const bar = el("div", "notes-rich-toolbar");

    const mkBtn = (label, title, run) => {
        const b = el("button", "notes-rich-toolbar__pill", label);
        b.type = "button";
        b.title = title;
        b.addEventListener("click", () => {
            run();
            editor.commands.focus();
        });
        return b;
    };

    bar.appendChild(
        mkBtn("B", "Bold", () => editor.chain().focus().toggleBold().run())
    );
    bar.appendChild(
        mkBtn("I", "Italic", () => editor.chain().focus().toggleItalic().run())
    );
    bar.appendChild(
        mkBtn("U", "Underline", () => editor.chain().focus().toggleUnderline().run())
    );
    bar.appendChild(
        mkBtn("S", "Strike", () => editor.chain().focus().toggleStrike().run())
    );
    bar.appendChild(
        mkBtn("•", "Bullet list", () => editor.chain().focus().toggleBulletList().run())
    );
    bar.appendChild(
        mkBtn("1.", "Ordered list", () => editor.chain().focus().toggleOrderedList().run())
    );
    bar.appendChild(
        mkBtn("</>", "Code", () => editor.chain().focus().toggleCode().run())
    );
    bar.appendChild(
        mkBtn("{ }", "Code block", () => editor.chain().focus().toggleCodeBlock().run())
    );
    bar.appendChild(
        mkBtn("❝", "Quote", () => editor.chain().focus().toggleBlockquote().run())
    );
    bar.appendChild(
        mkBtn("H1", "Heading 1", () => editor.chain().focus().toggleHeading({ level: 1 }).run())
    );
    bar.appendChild(
        mkBtn("H2", "Heading 2", () => editor.chain().focus().toggleHeading({ level: 2 }).run())
    );
    bar.appendChild(
        mkBtn("¶", "Paragraph", () => editor.chain().focus().setParagraph().run())
    );

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
        editor
            .chain()
            .focus()
            .setMark("textStyle", { ...cur, fontSize: v })
            .run();
    });

    bar.appendChild(colorWrap);
    bar.appendChild(hiWrap);
    bar.appendChild(sizeSel);

    bar.appendChild(
        mkBtn("🔗", "Add link", () => {
            const prev = window.prompt("Link URL", "https://");
            if (prev == null || prev === "") return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: prev }).run();
        })
    );
    bar.appendChild(
        mkBtn("⌫ link", "Remove link", () => editor.chain().focus().unsetLink().run())
    );

    return bar;
}

/**
 * @param {HTMLElement | null} toolbarHost — toolbar pills (sibling of editor is typical)
 * @param {HTMLElement} editorHost — TipTap / ProseMirror mount target (replaced on destroy)
 * @param {{ initialHtml: string; isDark: boolean; placeholder?: string; onChange?: () => void }} opts
 */
export function mountRichNotesEditor(toolbarHost, editorHost, opts) {
    if (toolbarHost) toolbarHost.replaceChildren();
    editorHost.replaceChildren();
    editorHost.classList.add("notes-rich-prose-host");
    if (opts.isDark) editorHost.classList.add("notes-rich-editor--dark");

    const extensions = [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
            codeBlock: { HTMLAttributes: { class: "notes-rich-codeblock" } },
        }),
        TextStyle,
        FontSize,
        Color,
        Highlight.configure({ multicolor: true }),
        Underline,
        Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
        Placeholder.configure({
            placeholder:
                opts.placeholder ??
                "Write notes… Use the toolbar for colors, lists, and code blocks.",
        }),
    ];

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

    /** Move caret to document end and ensure the contenteditable receives real focus. */
    const focusAtDocEnd = () => {
        const view = editor.view;
        if (!view.dom.isConnected) return;
        view.focus({ preventScroll: true });
        view.dispatch(view.state.tr.setSelection(TextSelection.atEnd(view.state.doc)).scrollIntoView());
        view.focus({ preventScroll: true });
    };

    const toolbar = buildToolbar(editor);
    if (toolbarHost) {
        toolbarHost.appendChild(toolbar);
    } else {
        editorHost.parentNode?.insertBefore(toolbar, editorHost);
    }

    return {
        getHtml: () => editor.getHTML(),
        setHtml: (html) => {
            const h = html && String(html).trim() ? String(html) : "<p></p>";
            editor.commands.setContent(h, false);
        },
        focus: () => focusAtDocEnd(),
        /** Called from title field: Enter = caret at end; Shift+Enter = caret + hard break (line inside body). */
        focusFromTitle: (opts) => {
            focusAtDocEnd();
            if (opts && opts.shiftKey) {
                editor.chain().focus().setHardBreak().run();
            }
        },
        setDark: (dark) => {
            editorHost.classList.toggle("notes-rich-editor--dark", !!dark);
            if (toolbarHost) toolbarHost.classList.toggle("notes-rich-toolbar-host--dark", !!dark);
        },
        destroy: () => {
            editor.destroy();
            editorHost.replaceChildren();
            editorHost.classList.remove("notes-rich-prose-host", "notes-rich-editor--dark");
            if (toolbarHost) toolbarHost.replaceChildren();
            else toolbar.remove();
        },
    };
}
