import { useState, useMemo } from 'react';
import { useAdminRefunds } from '@/hooks/useRefundQueries';
import { useDebounce } from '@/hooks/useDebounce';

export function useRefundList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError, refetch } = useAdminRefunds(
    page,
    limit,
    debouncedSearch,
    statusFilter
  );

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page,
    limit,
    totalPages,
    statusFilter,
    search,
    isLoading,
    isError,
    handleNextPage,
    handlePrevPage,
    handleStatusChange,
    handleSearchChange,
    refetch,
  };
}
