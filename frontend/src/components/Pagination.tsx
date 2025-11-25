interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '20px' }}>
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ padding: '8px 12px' }}
      >
        ←
      </button>

      {startPage > 1 && (
        <>
          <button
            className="btn btn-secondary"
            onClick={() => onPageChange(1)}
            style={{ padding: '8px 12px' }}
          >
            1
          </button>
          {startPage > 2 && <span>...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={currentPage === page ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => onPageChange(page)}
          style={{ padding: '8px 12px' }}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span>...</span>}
          <button
            className="btn btn-secondary"
            onClick={() => onPageChange(totalPages)}
            style={{ padding: '8px 12px' }}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ padding: '8px 12px' }}
      >
        →
      </button>
    </div>
  )
}





