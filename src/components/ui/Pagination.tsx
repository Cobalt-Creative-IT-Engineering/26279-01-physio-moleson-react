interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="pagination-btn">←</button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`pagination-btn${p === page ? " pagination-btn--active" : ""}`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="pagination-btn">→</button>
    </nav>
  );
}
