import React from 'react';

export const Pagination = React.memo(({ currentPage, totalCount, limit, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / limit);
    const pageNumbers = [];

    if (totalPages > 1) {
        pageNumbers.push(1); // Always show first page

        let startRange = Math.max(2, currentPage - 1);
        let endRange = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) {
            endRange = Math.min(totalPages - 1, 5); // Max 5 pages if near start
        } else if (currentPage >= totalPages - 2) {
            startRange = Math.max(2, totalPages - 4); // Max 5 pages if near end
        }

        if (startRange > 2) { // Ellipsis before
            pageNumbers.push('...');
        }

        for (let i = startRange; i <= endRange; i++) {
            if (i !== 1 && i !== totalPages) {
                pageNumbers.push(i);
            }
        }

        if (endRange < totalPages - 1) { // Ellipsis after
            pageNumbers.push('...');
        }

        if (!pageNumbers.includes(totalPages)) { // Always show last page
            pageNumbers.push(totalPages);
        }
    }

    if (totalPages <= 1) return null; // Don't show pagination if only one page or no pages

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4" aria-label="Pagination">
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="hidden sm:flex sm:items-center sm:space-x-2 ml-3">
                    {pageNumbers.map((page, index) => (
                        page === '...' ? (
                            <span key={`dots-${index}`} className="px-3 py-1 text-sm font-medium text-gray-500">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </nav>
    );
});
