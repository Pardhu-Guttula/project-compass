import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserStory } from '@/types/epics';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Filter,
  X,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Priority color mapping
const priorityColors: Record<string, string> = {
  High: 'bg-gray-100 text-gray-800 border-gray-200',
  Medium: 'bg-gray-100 text-gray-800 border-gray-200',
  Low: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Status color mapping
const statusColors: Record<string, string> = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
  'In Progress': 'bg-gray-100 text-gray-800 border-gray-200',
  Done: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PRIORITIES = ['High', 'Medium', 'Low'] as const;
const STATUSES = ['To Do', 'In Progress', 'Done'] as const;

interface EpicsTableProps {
  userStories: UserStory[];
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order: Order, orderBy: keyof UserStory) {
  return order === 'desc'
    ? (a: UserStory, b: UserStory) => descendingComparator(a, b, orderBy)
    : (a: UserStory, b: UserStory) => -descendingComparator(a, b, orderBy);
}

export function EpicsTable({ userStories }: EpicsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof UserStory>('id');
  const [order, setOrder] = useState<Order>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [dense, setDense] = useState(false);

  // ── Filter state ──
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleRequestSort = (property: keyof UserStory) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleSelectAllClick = (checked: boolean) => {
    if (checked) {
      setSelected(userStories.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowClick = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    console.log('Delete selected:', selected);
  };

  // ── Toggle filter chips ──
  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
    setPage(0);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(0);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setPage(0);
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) + selectedPriorities.length + selectedStatuses.length;

  // ── Filter + sort + paginate ──
  const filteredStories = useMemo(() => {
    return userStories.filter((story) => {
      const matchesSearch =
        !searchQuery ||
        story.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        selectedPriorities.length === 0 || selectedPriorities.includes(story.priority);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(story.status);

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [userStories, searchQuery, selectedPriorities, selectedStatuses]);

  const visibleRows = useMemo(
    () =>
      [...filteredStories]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredStories, order, orderBy, page, rowsPerPage]
  );

  const totalPages = Math.ceil(filteredStories.length / rowsPerPage);
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredStories.length) : 0;

  const SortIcon = ({ column }: { column: keyof UserStory }) => {
    if (orderBy !== column) return null;
    return order === 'asc' ? (
      <ChevronUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 inline" />
    );
  };

  const isAllSelected =
    filteredStories.length > 0 && selected.length === filteredStories.length;
  const isIndeterminate =
    selected.length > 0 && selected.length < filteredStories.length;

  return (
    <div className="w-full">
      <div className="border rounded-md overflow-hidden bg-white shadow-sm">

        {/* ── Toolbar ── */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2',
            selected.length > 0 && 'bg-blue-50'
          )}
        >
          {selected.length > 0 ? (
            <span className="text-sm font-medium text-blue-700">
              {selected.length} selected
            </span>
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              User Stories
              {activeFilterCount > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({filteredStories.length} of {userStories.length} shown)
                </span>
              )}
            </span>
          )}

          <div className="flex items-center gap-1">
            {selected.length > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:text-red-600"
                onClick={handleDelete}
                title="Delete selected"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 relative',
                  filterOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                )}
                title="Filter list"
                onClick={() => setFilterOpen((v) => !v)}
              >
                <Filter className="h-4 w-4" />
                {/* Blue dot when filters are active */}
                {activeFilterCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* ── Filter Panel (slides in below toolbar) ── */}
        {filterOpen && (
          <div className="border-t bg-gray-50 px-4 py-3 space-y-3">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search by ID, title, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="pl-8 h-8 text-sm bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setPage(0); }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Priority chips */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Priority
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all',
                      selectedPriorities.includes(priority)
                        ? priorityColors[priority] + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    )}
                  >
                    {selectedPriorities.includes(priority) && (
                      <span className="mr-1">✓</span>
                    )}
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Status chips */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all',
                      selectedStatuses.includes(status)
                        ? statusColors[status] + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    )}
                  >
                    {selectedStatuses.includes(status) && (
                      <span className="mr-1">✓</span>
                    )}
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter chips + clear all */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-200">
                <span className="text-xs text-gray-400">Active:</span>

                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="text-xs gap-1 pr-1 cursor-pointer"
                    onClick={() => { setSearchQuery(''); setPage(0); }}
                  >
                    "{searchQuery.length > 12 ? searchQuery.slice(0, 12) + '…' : searchQuery}"
                    <X className="h-2.5 w-2.5" />
                  </Badge>
                )}

                {selectedPriorities.map((p) => (
                  <Badge
                    key={p}
                    variant="secondary"
                    className="text-xs gap-1 pr-1 cursor-pointer"
                    onClick={() => togglePriority(p)}
                  >
                    {p} <X className="h-2.5 w-2.5" />
                  </Badge>
                ))}

                {selectedStatuses.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-xs gap-1 pr-1 cursor-pointer"
                    onClick={() => toggleStatus(s)}
                  >
                    {s} <X className="h-2.5 w-2.5" />
                  </Badge>
                ))}

                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:text-red-700 ml-1 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-10 border-b-2 border-gray-200">
                  <Checkbox
                    checked={isAllSelected}
                    data-indeterminate={isIndeterminate}
                    onCheckedChange={handleSelectAllClick}
                    aria-label="Select all"
                    className={cn(isIndeterminate && 'opacity-70')}
                  />
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer select-none border-b-2 border-gray-200 text-xs uppercase tracking-wide"
                  onClick={() => handleRequestSort('id')}
                >
                  ID <SortIcon column="id" />
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer select-none border-b-2 border-gray-200 text-xs uppercase tracking-wide"
                  onClick={() => handleRequestSort('title')}
                >
                  Title <SortIcon column="title" />
                </TableHead>
                <TableHead className="font-semibold border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                  Description
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer select-none border-b-2 border-gray-200 text-center text-xs uppercase tracking-wide"
                  onClick={() => handleRequestSort('priority')}
                >
                  Priority <SortIcon column="priority" />
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer select-none border-b-2 border-gray-200 text-center text-xs uppercase tracking-wide"
                  onClick={() => handleRequestSort('status')}
                >
                  Status <SortIcon column="status" />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRows.map((story) => {
                const isSelected = selected.includes(story.id);
                return (
                  <TableRow
                    key={story.id}
                    onClick={() => handleRowClick(story.id)}
                    aria-checked={isSelected}
                    className={cn(
                      'cursor-pointer transition-colors',
                      dense ? 'h-8' : 'h-12',
                      isSelected
                        ? 'bg-blue-50 hover:bg-blue-100'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <TableCell className={cn('w-10', dense ? 'py-1' : 'py-2')}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleRowClick(story.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${story.id}`}
                      />
                    </TableCell>
                    <TableCell
                      className={cn('font-medium text-black', dense ? 'py-1' : 'py-2')}
                    >
                      {story.id}
                    </TableCell>
                    <TableCell className={cn('font-medium', dense ? 'py-1' : 'py-2')}>
                      {story.title}
                    </TableCell>
                    <TableCell
                      className={cn('text-gray-500 text-sm', dense ? 'py-1' : 'py-2')}
                    >
                      {story.description}
                    </TableCell>
                    <TableCell className={cn('text-center', dense ? 'py-1' : 'py-2')}>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          priorityColors[story.priority]
                        )}
                      >
                        {story.priority}
                      </span>
                    </TableCell>
                    <TableCell className={cn('text-center', dense ? 'py-1' : 'py-2')}>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          statusColors[story.status]
                        )}
                      >
                        {story.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}

              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}

              {visibleRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    {activeFilterCount > 0
                      ? 'No stories match your filters.'
                      : 'No user stories found.'}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="ml-2 text-blue-500 hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        {filteredStories.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-xs text-gray-500">
              {page * rowsPerPage + 1}–
              {Math.min((page + 1) * rowsPerPage, filteredStories.length)} of{' '}
              {filteredStories.length}
              {activeFilterCount > 0 && (
                <span className="text-gray-400"> (filtered)</span>
              )}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 0 && setPage(page - 1)}
                    className={
                      page === 0 ? 'pointer-events-none opacity-40' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink onClick={() => setPage(i)} isActive={page === i}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages - 1 && setPage(page + 1)}
                    className={
                      page >= totalPages - 1
                        ? 'pointer-events-none opacity-40'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ── Dense toggle ── */}
      <div className="flex items-center gap-2 mt-3 ml-1">
        <Switch id="dense-toggle" checked={dense} onCheckedChange={setDense} />
        <Label htmlFor="dense-toggle" className="text-sm text-gray-600 cursor-pointer">
          Dense padding
        </Label>
      </div>
    </div>
  );
}