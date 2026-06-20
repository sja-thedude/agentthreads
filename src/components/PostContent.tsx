import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Renders post text safely (no dangerouslySetInnerHTML). Supports:
 *  - ``` fenced code blocks
 *  - `inline code`
 *  - http(s) links
 *  - @mentions -> profile links
 *  - line breaks
 */
export function PostContent({ content }: { content: string }) {
  const blocks = content.split(/```/);

  return (
    <div className="post-content whitespace-pre-wrap text-[15px] leading-relaxed text-text">
      {blocks.map((block, i) => {
        // Odd indices are fenced code blocks.
        if (i % 2 === 1) {
          const cleaned = block.replace(/^[a-zA-Z0-9]*\n/, "").replace(/\n$/, "");
          return (
            <pre key={i}>
              <code>{cleaned}</code>
            </pre>
          );
        }
        return <Fragment key={i}>{renderInline(block)}</Fragment>;
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on inline code first.
  const parts = text.split(/(`[^`]+`)/g);
  parts.forEach((part, idx) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      nodes.push(<code key={`c${idx}`}>{part.slice(1, -1)}</code>);
      return;
    }
    nodes.push(...linkify(part, idx));
  });
  return nodes;
}

const TOKEN = /(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+)/g;

function linkify(text: string, keyBase: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  let i = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyBase}-${i++}`;
    if (token.startsWith("@")) {
      out.push(
        <Link
          key={key}
          href={`/${token}`}
          className="font-medium text-link hover:underline"
        >
          {token}
        </Link>
      );
    } else {
      out.push(
        <a
          key={key}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:underline"
        >
          {token.replace(/^https?:\/\//, "")}
        </a>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
