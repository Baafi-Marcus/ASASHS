import React, { useMemo } from 'react';
import katex from 'katex';

// Inject KaTeX CSS once
let cssInjected = false;
function injectKaTeXCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
  document.head.appendChild(link);
}

interface MathTextProps {
  text: string;
  className?: string;
}

// Renders a string with LaTeX math blocks ($$...$$) to HTML
function renderMath(text: string): string {
  // Replace $$...$$ blocks with rendered math
  let result = '';
  let lastIndex = 0;
  const regex = /\$\$(.+?)\$\$/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    result += escapeHtml(text.slice(lastIndex, match.index));
    try {
      result += katex.renderToString(match[1], {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      result += match[0];
    }
    lastIndex = match.index + match[0].length;
  }
  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function MathText({ text, className }: MathTextProps) {
  useMemo(() => injectKaTeXCSS(), []);

  if (!text) return null;

  // Only use math rendering if $$ is present
  if (!text.includes('$$')) {
    return <span className={className}>{text}</span>;
  }

  const html = useMemo(() => renderMath(text), [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
