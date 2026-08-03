'use client';
import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  text: string;
}

function decodeHtmlEntities(str: string): string {
  if (!str || !str.includes('&')) return str || '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export default React.memo(function LatexRenderer({ text }: LatexRendererProps) {
  if (!text) return null;

  const parsed = React.useMemo(() => {
    // 1. Clean up unreadable dark color styles and normalize double backslashes in math markers
    const cleanedText = text
      .replace(/color:\s*rgb\([^)]*\);?/gi, '')
      .replace(/color:\s*#[a-f0-9]{3,8};?/gi, '')
      .replace(/color:\s*\w+;?/gi, '')
      .replace(/style="\s*"/gi, '')
      .replace(/\\\\([()\[\]])/g, '\\$1')
      .replace(/\\\\([a-zA-Z])/g, '\\$1');

    // 2. Decode HTML entities while keeping HTML tags intact
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
        return katex.renderToString(cleanMath, { 
          displayMode, 
          throwOnError: false,
          strict: false,
          trust: true
        });
      } catch (err) {
        return `<span class="text-danger-custom">${math}</span>`;
      }
    };

    return parts.map((part) => {
      if (!part) return '';
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return renderMath(part.slice(2, -2), true);
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return renderMath(part.slice(1, -1), false);
      } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
        return renderMath(part.slice(2, -2), true);
      } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
        return renderMath(part.slice(2, -2), false);
      }
      
      return part;
    }).join('');
  }, [text]);

  return (
    <span 
      dangerouslySetInnerHTML={{ __html: parsed }} 
      className="vertical-middle align-middle" 
    />
  );
});
