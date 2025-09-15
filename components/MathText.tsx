"use client";

import React from "react";
import katex from "katex";

interface MathTextProps {
  text: string | null | undefined;
  /**
   * When true, treat the whole `text` as a single display block
   * (useful if callers want a forced block rendering).
   */
  display?: boolean;
  /** Additional className applied to the wrapper */
  className?: string;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

function splitMath(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Handle block math $$...$$
    if (ch === "$" && input[i + 1] === "$") {
      // Push preceding text if any
      const before = input.slice(0, i);
      if (before) {
        segments.push({ type: "text", value: before });
      }

      // Find closing $$
      const start = i + 2;
      const end = input.indexOf("$$", start);
      if (end !== -1) {
        const expr = input.slice(start, end).trim();
        segments.push({ type: "math", value: expr, display: true });
        input = input.slice(end + 2);
        i = 0;
        continue;
      } else {
        // No closing, treat remaining as text
        segments.push({ type: "text", value: input });
        return segments;
      }
    }

    // Handle inline math $...$
    if (ch === "$") {
      // Ensure not a double $$ (already handled above)
      if (input[i + 1] !== "$") {
        const before = input.slice(0, i);
        if (before) {
          segments.push({ type: "text", value: before });
        }

        const start = i + 1;
        let j = start;
        let found = -1;
        while (j < input.length) {
          if (input[j] === "\\") {
            j += 2; // skip escaped char
            continue;
          }
          if (input[j] === "$") {
            found = j;
            break;
          }
          j += 1;
        }

        if (found !== -1) {
          const expr = input.slice(start, found).trim();
          segments.push({ type: "math", value: expr, display: false });
          input = input.slice(found + 1);
          i = 0;
          continue;
        } else {
          // No closing, treat remaining as text
          segments.push({ type: "text", value: input });
          return segments;
        }
      }
    }

    i += 1;
  }

  if (input) {
    segments.push({ type: "text", value: input });
  }

  return segments;
}

export function MathText({ text, display, className }: MathTextProps) {
  if (!text) return null;

  // If explicitly forced display for whole string
  if (display) {
    const __html = katex.renderToString(text, {
      displayMode: true,
      throwOnError: false,
      strict: "ignore",
    });
    return <div className={className} dangerouslySetInnerHTML={{ __html }} />;
  }

  const segments = splitMath(text);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === "text") {
          return <React.Fragment key={idx}>{seg.value}</React.Fragment>;
        }
        const __html = katex.renderToString(seg.value, {
          displayMode: seg.display,
          throwOnError: false,
          strict: "ignore",
        });
        // KaTeX block display renders with its own block element; wrap accordingly
        return seg.display ? (
          <div key={idx} dangerouslySetInnerHTML={{ __html }} />
        ) : (
          <span key={idx} dangerouslySetInnerHTML={{ __html }} />
        );
      })}
    </span>
  );
}

export default MathText;

