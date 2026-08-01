'use client';
import React, { useState, useEffect } from 'react';

interface LatexRendererProps {
  text: string;
}

export default function LatexRenderer({ text }: LatexRendererProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function loadKatex() {
      try {
        const katex = await import('katex');
        if (!active) return;

        // Split text by block math ($$) and inline math ($)
        // Regex matches $$...$$ or $...$
        const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
        const parsed = parts.map((part) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2);
            try {
              return katex.default.renderToString(math, { 
                displayMode: true, 
                throwOnError: false 
              });
            } catch (err) {
              return `<span class="text-[#EF4444]">${part}</span>`;
            }
          } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            try {
              return katex.default.renderToString(math, { 
                displayMode: false, 
                throwOnError: false 
              });
            } catch (err) {
              return `<span class="text-[#EF4444]">${part}</span>`;
            }
          }
          return part;
        }).join('');

        setHtml(parsed);
      } catch (err) {
        if (!active) return;
        // Simple fallback replacing common LaTeX terms
        let fallback = text
          .replace(/\\\(/g, '$')
          .replace(/\\\)/g, '$')
          .replace(/\\sin/g, 'sin')
          .replace(/\\cos/g, 'cos')
          .replace(/\\pi/g, 'π')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
          .replace(/\\lim_\{([^}]+)\}/g, 'lim ($1)')
          .replace(/\\to/g, '→')
          .replace(/\^/g, '');
        setHtml(fallback);
      }
    }

    loadKatex();
    return () => {
      active = false;
    };
  }, [text]);

  if (!html) {
    return <span>{text}</span>;
  }

  return <span dangerouslySetInnerHTML={{ __html: html }} className="inline-block max-w-full overflow-x-auto vertical-middle align-middle" />;
}
