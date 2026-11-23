import type { Components } from 'react-markdown';

// Shared react-markdown overrides for `.markdown-body` renderers.
// Tables sit in their own horizontal scroller so a wide table (many columns)
// scrolls inside the article instead of widening the whole page on phones.
// Cell sizing lives in index.css (.markdown-table-wrap).
export const MARKDOWN_COMPONENTS: Components = {
  // `node` (the hast node) is dropped so it isn't spread onto the DOM <table>.
  table: ({ node, ...props }) => {
    void node;
    return (
      <div className="markdown-table-wrap" tabIndex={0} role="region" aria-label="Tabel, geser untuk melihat semua kolom">
        <table {...props} />
      </div>
    );
  },
};
