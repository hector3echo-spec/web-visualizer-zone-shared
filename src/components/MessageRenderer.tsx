import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  // Custom components for markdown rendering
  const components: Components = {
    // Render links as clickable hyperlinks with proper styling
    a: ({ node, ...props }) => (
      <a
        {...props}
        className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    // Render paragraphs with proper spacing
    p: ({ node, ...props }) => (
      <p {...props} className="text-sm whitespace-pre-wrap mb-2 last:mb-0" />
    ),
    // Render bold text
    strong: ({ node, ...props }) => (
      <strong {...props} className="font-semibold" />
    ),
    // Render lists with proper styling
    ul: ({ node, ...props }) => (
      <ul {...props} className="list-disc list-inside text-sm mb-2" />
    ),
    ol: ({ node, ...props }) => (
      <ol {...props} className="list-decimal list-inside text-sm mb-2" />
    ),
    li: ({ node, ...props }) => (
      <li {...props} className="text-sm" />
    ),
    // Render code blocks
    code: ({ node, inline, ...props }) => (
      inline ? (
        <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" />
      ) : (
        <code {...props} className="block bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto" />
      )
    ),
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
