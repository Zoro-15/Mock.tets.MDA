'use client';
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  text: string;
}

function decodeHtmlEntities(str: string): string {
  try {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  } catch (e) {
    return str;
  }
}

export default function LatexRenderer({ text }: LatexRendererProps) {
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

  return (
    <span 
      dangerouslySetInnerHTML={{ __html: parsed }} 
      className="vertical-middle align-middle" 
    />
  );
}
