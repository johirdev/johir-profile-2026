import "server-only";
import { Marked, type TokenizerAndRendererExtension } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/common";
import sanitizeHtml from "sanitize-html";

/** ==text== → <mark>text</mark> */
const highlight: TokenizerAndRendererExtension = {
  name: "highlight",
  level: "inline",
  start: (src) => src.indexOf("=="),
  tokenizer(src) {
    const m = /^==(?!\s)([^=\n]+?)==/.exec(src);
    if (m) return { type: "highlight", raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
  },
  renderer(token) {
    return `<mark>${this.parser.parseInline(token.tokens ?? [])}</mark>`;
  },
};

/** {color:#ff6333}text{/color} → <span style="color:#ff6333">text</span> */
const color: TokenizerAndRendererExtension = {
  name: "color",
  level: "inline",
  start: (src) => src.indexOf("{color:"),
  tokenizer(src) {
    const m = /^\{color:(#[0-9a-fA-F]{6})\}([\s\S]+?)\{\/color\}/.exec(src);
    if (m) return { type: "color", raw: m[0], hex: m[1], tokens: this.lexer.inlineTokens(m[2]) };
  },
  renderer(token) {
    return `<span style="color:${token.hex}">${this.parser.parseInline(token.tokens ?? [])}</span>`;
  },
};

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
  { gfm: true, breaks: false, extensions: [highlight, color] },
);

export const headingId = (text: string) =>
  text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${headingId(inner)}">${inner}</h${depth}>\n`;
    },
  },
});

const CALLOUT = /<blockquote>\s*<p>\[!(TIP|NOTE|WARNING)\]\s*(?:<br\s*\/?>)?/gi;

/** Markdown → sanitised HTML. Raw HTML in the source is stripped to a safe subset. */
export function renderMarkdown(md: string): string {
  const html = (marked.parse(md ?? "", { async: false }) as string).replace(
    CALLOUT,
    (_m, kind: string) =>
      `<blockquote class="callout callout-${kind.toLowerCase()}"><p><strong>${kind[0]}${kind.slice(1).toLowerCase()}:</strong> `,
  );

  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "del", "s", "mark", "span", "a",
      "ul", "ol", "li", "blockquote", "code", "pre", "img", "table", "thead", "tbody", "tr", "th", "td",
      "sup", "sub", "kbd",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      span: ["style", "class"],
      code: ["class"],
      pre: ["class"],
      blockquote: ["class"],
      h2: ["id"],
      h3: ["id"],
      th: ["align"],
      td: ["align"],
    },
    allowedClasses: {
      code: ["hljs", /^language-[\w-]+$/],
      span: [/^hljs-[\w-]+$/, "language_", "function_", "class_"],
      blockquote: ["callout", "callout-tip", "callout-note", "callout-warning"],
    },
    allowedStyles: { span: { color: [/^#[0-9a-f]{6}$/i] } },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName: "a",
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" } : attribs,
        };
      },
      img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
    },
  });
}

/** Extracts h2/h3 headings for a table of contents. */
export function headings(md: string) {
  // Skip lines inside fenced code blocks (e.g. "## comment" in a shell snippet).
  const outside = (md ?? "").replace(/```[\s\S]*?```/g, "");
  return [...outside.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => {
    const text = m[2].replace(/[*_`=]|\{\/?color[^}]*\}/g, "").trim();
    return { depth: m[1].length, text, id: headingId(text) };
  });
}
