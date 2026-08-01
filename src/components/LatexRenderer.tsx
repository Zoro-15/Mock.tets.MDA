'use client';
import React, { useState, useEffect } from 'react';

interface LatexRendererProps {
  text: string;
}

function decodeHtmlEntities(str: string): string {
  if (typeof window === 'undefined') return str;
  try {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  } catch (e) {
    return str;
  }
}

export default function LatexRenderer({ text }: LatexRendererProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function loadKatex() {
      try {
        const katex = await import('katex');
        if (!active) return;

        // 1. Clean up unreadable dark color styles and normalize double backslashes in math markers
        const cleanedText = text
          .replace(/color:\s*rgb\([^)]*\);?/gi, '')
          .replace(/color:\s*#[a-f0-9]{3,8};?/gi, '')
          .replace(/color:\s*\w+;?/gi, '')
          .replace(/style="\s*"/gi, '')
          .replace(/\\\\([()\[\]])/g, '\\$1')
          .replace(/\\\\([a-zA-Z])/g, '\\$1');

        // 2. Decode HTML entities (like &amp; -> &, &alpha; -> α) while keeping HTML tags
        const decodedText = decodeHtmlEntities(cleanedText);

        // 3. Split text by block math ($$, \[) and inline math ($, \()
        const parts = decodedText.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);
        
        const renderMath = (math: string, displayMode: boolean) => {
          try {
            const cleanMath = math
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&nbsp;/g, ' ')
              .replace(/&quot;/g, '"')
              .replace(/\*\{[0-9]+\}\{([a-zA-Z])\}/g, '$1$1$1$1');
            return katex.default.renderToString(cleanMath, { 
              displayMode, 
              throwOnError: false,
              strict: false,
              trust: true
            });
          } catch (err) {
            return `<span class="text-[#EF4444]">${math}</span>`;
          }
        };

        const parsed = parts.map((part) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            return renderMath(part.slice(2, -2), true);
          } else if (part.startsWith('$') && part.endsWith('$')) {
            return renderMath(part.slice(1, -1), false);
          } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
            return renderMath(part.slice(2, -2), true);
          } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
            return renderMath(part.slice(2, -2), false);
          }
          
          // For plain text parts, gracefully handle unformatted math like x^{2} or x_1
          let textPart = part;
          textPart = textPart.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
          textPart = textPart.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
          textPart = textPart.replace(/\^([a-zA-Z0-9\u0370-\u03FF])/g, '<sup>$1</sup>');
          textPart = textPart.replace(/_([a-zA-Z0-9\u0370-\u03FF])/g, '<sub>$1</sub>');
          
          return textPart;
        }).join('');

        setHtml(parsed);
      } catch (err) {
        if (!active) return;
        // Simple fallback
        let fallback = text
          .replace(/\\\(/g, '$')
          .replace(/\\\)/g, '$')
          .replace(/\\\[/g, '$$')
          .replace(/\\\]/g, '$$');
        setHtml(fallback);
      }
    }

    loadKatex();
    return () => {
      active = false;
    };
  }, [text]);

  if (!html) {
    // Return decoded text as string placeholder before client-side hydration
    return <span>{text}</span>;
  }

  return (
    <span 
      dangerouslySetInnerHTML={{ __html: html }} 
      className="vertical-middle align-middle" 
    />
  );
}
