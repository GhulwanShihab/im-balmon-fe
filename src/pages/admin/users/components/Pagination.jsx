const Pagination = ({ page, setPage, totalPages }) => {
  return (
    <div className="flex justify-center gap-2 items-center mt-4">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-3 py-1 border rounded-lg disabled:opacity-50"
      >
        ← Prev
      </button>
      <span>
        Halaman {page} dari {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded-lg disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
