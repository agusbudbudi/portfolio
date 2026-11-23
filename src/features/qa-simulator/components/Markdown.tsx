import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MARKDOWN_COMPONENTS } from '../../../lib/markdownComponents';

interface MarkdownProps {
  children: string;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ children, className = '' }) => (
  <div className={`markdown-body text-ld-graphite text-sm leading-relaxed ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>{children}</ReactMarkdown>
  </div>
);

export default Markdown;
