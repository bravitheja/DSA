/**
 * CodeMirror 6 Markdown notes editor with syntax-colored fenced code blocks.
 * Every import shares the same `deps=@codemirror/state@…,view@…,language@…` so esm.sh
 * does not load multiple @codemirror/state copies (fixes "Unrecognized extension value").
 *
 * We avoid @codemirror/language-data — it pulls many packages and duplicates state.
 */

import {
    EditorView,
    lineNumbers,
    keymap,
    drawSelection,
    highlightActiveLineGutter,
    highlightActiveLine,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    placeholder,
} from "https://esm.sh/@codemirror/view@6.34.3?deps=@codemirror/state@6.5.0&target=es2022";
import { EditorState, Compartment } from "https://esm.sh/@codemirror/state@6.5.0?target=es2022";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "https://esm.sh/@codemirror/commands@6.6.2?deps=@codemirror/state@6.5.0,@codemirror/view@6.34.3&target=es2022";
import {
    indentOnInput,
    bracketMatching,
    foldGutter,
    foldKeymap,
    syntaxHighlighting,
    defaultHighlightStyle,
    LanguageDescription,
} from "https://esm.sh/@codemirror/language@6.10.3?deps=@codemirror/state@6.5.0,@codemirror/view@6.34.3&target=es2022";
import { markdown } from "https://esm.sh/@codemirror/lang-markdown@6.3.2?deps=@codemirror/state@6.5.0,@codemirror/view@6.34.3,@codemirror/language@6.10.3,@codemirror/commands@6.6.2&target=es2022";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark@6.1.2?deps=@codemirror/state@6.5.0,@codemirror/view@6.34.3,@codemirror/language@6.10.3&target=es2022";

/** Same peer chain as static imports so dynamic lang loads dedupe @codemirror/state. */
const LANG_LOAD =
    "https://esm.sh/@codemirror/lang-__PKG__@__VER__?deps=@codemirror/state@6.5.0,@codemirror/view@6.34.3,@codemirror/language@6.10.3&target=es2022";

function langUrl(pkg, ver) {
    return LANG_LOAD.replace("__PKG__", pkg).replace("__VER__", ver);
}

const codeLanguages = [
    LanguageDescription.of({
        name: "Python",
        alias: ["py"],
        extensions: ["py"],
        load: () => import(langUrl("python", "6.1.7")).then((m) => m.python()),
    }),
    LanguageDescription.of({
        name: "JavaScript",
        alias: ["js", "node", "mjs", "cjs"],
        extensions: ["js", "mjs", "cjs"],
        load: () => import(langUrl("javascript", "6.2.2")).then((m) => m.javascript()),
    }),
    LanguageDescription.of({
        name: "TypeScript",
        alias: ["ts", "tsx"],
        extensions: ["ts", "tsx"],
        load: () =>
            import(langUrl("javascript", "6.2.2")).then((m) =>
                m.javascript({ typescript: true })
            ),
    }),
    LanguageDescription.of({
        name: "Java",
        extensions: ["java"],
        load: () => import(langUrl("java", "6.0.1")).then((m) => m.java()),
    }),
    LanguageDescription.of({
        name: "C++",
        alias: ["cpp", "cxx", "hpp"],
        extensions: ["cpp", "cc", "cxx", "hpp", "hh", "hxx"],
        load: () => import(langUrl("cpp", "6.0.2")).then((m) => m.cpp()),
    }),
    LanguageDescription.of({
        name: "C",
        extensions: ["c", "h"],
        load: () => import(langUrl("cpp", "6.0.2")).then((m) => m.cpp()),
    }),
    LanguageDescription.of({
        name: "Go",
        extensions: ["go"],
        load: () => import(langUrl("go", "6.0.0")).then((m) => m.go()),
    }),
    LanguageDescription.of({
        name: "Rust",
        extensions: ["rs"],
        load: () => import(langUrl("rust", "6.0.1")).then((m) => m.rust()),
    }),
    LanguageDescription.of({
        name: "JSON",
        extensions: ["json"],
        load: () => import(langUrl("json", "6.0.1")).then((m) => m.json()),
    }),
];

const themeComp = new Compartment();

const lightChrome = EditorView.theme(
    {
        "&": {
            fontSize: "13px",
            backgroundColor: "var(--panel-soft)",
            color: "var(--text)",
        },
        ".cm-scroller": {
            fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
            overflow: "auto",
        },
        ".cm-content": { caretColor: "var(--text)", minHeight: "58vh" },
        ".cm-gutters": {
            backgroundColor: "var(--panel-soft)",
            color: "var(--muted)",
            borderRight: "1px solid var(--border)",
        },
        ".cm-activeLineGutter": { backgroundColor: "rgba(0,0,0,0.04)" },
        ".cm-lineNumbers .cm-gutterElement": {
            padding: "0 0.35rem 0 0.25rem",
            minWidth: "2.25rem",
        },
        "&.cm-focused .cm-selectionBackground, ::selection": {
            backgroundColor: "rgba(99, 102, 241, 0.25) !important",
        },
        "&.cm-focused .cm-cursor": { borderLeftColor: "var(--text)" },
    },
    { dark: false }
);

function themeBundle(isDark) {
    return isDark
        ? oneDark
        : [lightChrome, syntaxHighlighting(defaultHighlightStyle, { fallback: true })];
}

/**
 * @param {HTMLElement} host
 * @param {{ initial: string, onChange: () => void, isDark: boolean, placeholder?: string }} opts
 */
export function mountNotesEditor(host, opts) {
    const onDocChange = () => opts.onChange?.();
    const exts = [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        bracketMatching(),
        indentOnInput(),
        foldGutter(),
        markdown({ codeLanguages }),
        history(),
        EditorView.lineWrapping,
        EditorState.tabSize.of(4),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        placeholder(
            opts.placeholder ??
                "Capture intuition, pitfalls, or code snippets. Markdown supported — use fenced blocks (```python) for syntax colors."
        ),
        themeComp.of(themeBundle(opts.isDark)),
        EditorView.updateListener.of((u) => {
            if (u.docChanged) onDocChange();
        }),
    ];
    const view = new EditorView({
        parent: host,
        state: EditorState.create({
            doc: opts.initial ?? "",
            extensions: exts,
        }),
    });
    return {
        getText: () => view.state.doc.toString(),
        setText: (text) => {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: text },
            });
        },
        focus: () => view.focus(),
        setDark: (dark) => {
            view.dispatch({
                effects: themeComp.reconfigure(themeBundle(dark)),
            });
        },
        destroy: () => {
            view.destroy();
        },
    };
}
