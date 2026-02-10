# PaginatedDataTable Component

**Generic, reusable table component with opt-in features.**

All features (filter, sort, pagination, row actions, selection) are **DISABLED by default**. Enable only what you need by adding the corresponding configuration prop.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Opt-In Features](#opt-in-features)
5. [Operating Modes](#operating-modes)
6. [Examples](#examples)
7. [API Reference](#api-reference)
8. [Type Definitions](#type-definitions)

---

## Philosophy

### Opt-In Design

PaginatedDataTable follows an **opt-in philosophy**:
- **No features enabled by default** - keeps the component lightweight
- **Add only what you need** - filtering, sorting, pagination, actions, selection
- **Flexible configuration** - client-side or server-side mode for each feature
- **Composable** - combine features as needed

### Separation of Concerns

- **PaginatedDataTable** (this component) - Pure presentation, no business logic
- **Domain Templates** (e.g., RefDataTabTemplate) - Business logic, CRUD operations
- **Clear layering** - Generic → Domain-Specific

---

## Installation

PaginatedDataTable is available in `src/components/ui/PaginatedDataTable`.

```tsx
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import type { TableColumn } from '@/components/ui/DataTable/types'
```

---

## Basic Usage

### Simplest Table (No Features)

```tsx
interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
]

const columns: TableColumn<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
]

// Just data + columns - no filter, sort, or pagination
<PaginatedDataTable data={users} columns={columns} />
```

**Result:** Simple table displaying data. No filtering, no sorting, no pagination.

---

## Opt-In Features

### 1. Enable Filtering

Add `filter={{...}}` to enable search functionality:

```tsx
const [filterValue, setFilterValue] = useState('')

<PaginatedDataTable
  data={users}
  columns={columns}
  filter={{
    value: filterValue,
    onChange: setFilterValue,
    placeholder: 'Search users...',
    debounceMs: 300,
  }}
/>
```

**Features Added:**
- ✅ Search input with debouncing
- ✅ Clear button
- ✅ Result count display
- ✅ Client-side filtering (searches all column values)

---

### 2. Enable Sorting (Single-Column)

Add `sort={{...}}` to enable column sorting:

```tsx
const [sortColumn, setSortColumn] = useState<string | null>(null)
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)

const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
  setSortColumn(column)
  setSortDirection(direction)
}

<PaginatedDataTable
  data={users}
  columns={columns.map(col => ({ ...col, sortable: true }))} // Make columns sortable
  sort={{
    type: 'single',
    column: sortColumn,
    direction: sortDirection,
    onSort: handleSort,
    mode: 'client', // Client-side sorting
  }}
/>
```

**Features Added:**
- ✅ Clickable column headers
- ✅ Sort indicators (↑ ↓)
- ✅ Toggle sort direction (asc → desc → none)
- ✅ Client-side sorting

---

### 3. Enable Sorting (Multi-Column)

For complex tables that need multiple sort columns:

```tsx
import type { MultiSortState } from '@/components/ui/PaginatedDataTable'

const [sorts, setSorts] = useState<MultiSortState[]>([])

<PaginatedDataTable
  data={documents}
  columns={columns}
  sort={{
    type: 'multi',
    sorts: sorts,
    onSort: setSorts,
    maxSorts: 3, // Maximum 3 sort columns
    mode: 'client',
  }}
/>
```

**Features Added:**
- ✅ Click columns to add to sort sequence
- ✅ Priority-based sorting (1st, 2nd, 3rd sort column)
- ✅ Maximum sort column limit

---

### 4. Enable Pagination

Add `pagination={{...}}` to split data across pages:

```tsx
const [currentPage, setCurrentPage] = useState(1)
const [pageSize, setPageSize] = useState(10)

<PaginatedDataTable
  data={users}
  columns={columns}
  pagination={{
    currentPage,
    totalItems: users.length,
    pageSize,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: [10, 25, 50, 100],
    showPageSizeSelector: true,
    showInfo: true,
    mode: 'client', // Client-side pagination
  }}
/>
```

**Features Added:**
- ✅ Page navigation buttons
- ✅ Page size selector
- ✅ Item count info
- ✅ Client-side data slicing

---

### 5. Enable Row Actions

Add `rowActions={{...}}` to show actions per row:

```tsx
<PaginatedDataTable
  data={users}
  columns={columns}
  rowActions={{
    header: 'Actions',
    width: '120px',
    render: (user) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button onClick={() => handleEdit(user)} size="sm">
          Edit
        </Button>
        <Button onClick={() => handleDelete(user)} size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    ),
  }}
/>
```

**Features Added:**
- ✅ Actions column at the end of table
- ✅ Custom render function per row
- ✅ Configurable width

---

### 6. Enable Row Selection

Add `selection={{...}}` to allow row selection with checkboxes:

```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([])

<PaginatedDataTable
  data={users}
  columns={columns}
  selection={{
    selectedIds,
    onSelectionChange: setSelectedIds,
    getRowId: (user) => user.id,
    renderBulkActions: (selectedIds) => (
      <div>
        <Button onClick={() => handleBulkDelete(selectedIds)}>
          Delete {selectedIds.length} items
        </Button>
      </div>
    ),
  }}
/>
```

**Features Added:**
- ✅ Checkbox column at the start of table
- ✅ Select all / Deselect all
- ✅ Bulk actions bar (optional)

---

## Operating Modes

### Client-Side Mode (Default)

Component manages state internally. Best for **small datasets** (< 1000 rows).

```tsx
<PaginatedDataTable
  data={users} // All data provided upfront
  columns={columns}
  filter={{ value, onChange, mode: 'client' }} // Component filters
  sort={{ type: 'single', column, direction, onSort, mode: 'client' }} // Component sorts
  pagination={{ currentPage, totalItems: users.length, pageSize, onPageChange, mode: 'client' }} // Component paginates
/>
```

**How it works:**
1. Component receives all data
2. Component filters data based on search value
3. Component sorts filtered data
4. Component slices sorted data for current page
5. Component displays paginated results

**Note:** Each feature has independent mode control. Mix client and server modes as needed.

---

### Server-Side Mode

Parent controls state, component emits events. Best for **large datasets** or **API-backed data**.

```tsx
const handleFilterChange = async (value: string) => {
  setFilter(value)
  // Reset to page 1 when filter changes
  setPage(1)
}

const handlePageChange = async (page: number) => {
  setPage(page)
}

const handleSort = async (column: string, direction: 'asc' | 'desc' | null) => {
  setSortColumn(column)
  setSortDirection(direction)
  // Reset to page 1 when sorting changes
  setPage(1)
}

// Fetch data when state changes
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    const result = await fetchUsers({
      page,
      pageSize,
      sortColumn,
      sortDirection,
      filter,
    })
    setUsers(result.data)
    setTotalItems(result.total)
    setLoading(false)
  }
  fetchData()
}, [page, pageSize, sortColumn, sortDirection, filter])

<PaginatedDataTable
  data={users} // Current page data only
  columns={columns}
  filter={{
    value: filter,
    onChange: handleFilterChange, // Triggers state update -> useEffect -> API call
    mode: 'server',
  }}
  sort={{
    type: 'single',
    column: sortColumn,
    direction: sortDirection,
    onSort: handleSort, // Triggers state update -> useEffect -> API call
    mode: 'server',
  }}
  pagination={{
    currentPage: page,
    totalItems: totalItems, // From API response
    pageSize,
    onPageChange: handlePageChange, // Triggers state update -> useEffect -> API call
    mode: 'server',
  }}
  loading={loading}
/>
```

**How it works:**
1. Parent component manages sort/filter/page state
2. Parent fetches data from API based on state
3. Component displays current page data
4. User interaction (sort, page change) triggers parent handlers
5. Parent fetches new data and updates component

---

## Examples

### Example 1: Read-Only Table with Filter and Pagination

```tsx
'use client'

import { useState } from 'react'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import type { TableColumn } from '@/components/ui/DataTable/types'

interface BatchError {
  id: number
  batchId: string
  category: string
  message: string
  timestamp: string
}

export function BatchErrorsTable({ errors }: { errors: BatchError[] }) {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 25

  const columns: TableColumn<BatchError>[] = [
    { key: 'batchId', header: 'Batch ID', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'message', header: 'Error Message' },
    { key: 'timestamp', header: 'Timestamp', sortable: true },
  ]

  return (
    <PaginatedDataTable
      data={errors}
      columns={columns}
      filter={{
        value: filter,
        onChange: setFilter,
        placeholder: 'Search errors...',
      }}
      pagination={{
        currentPage: page,
        totalItems: errors.length,
        pageSize,
        onPageChange: setPage,
        showPageSizeSelector: false,
        mode: 'client',
      }}
    />
  )
}
```

---

### Example 2: Table with Row Actions (No CRUD Template)

```tsx
'use client'

import { useState } from 'react'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import { Button } from '@/components/ui/Button'

interface DocumentRequest {
  id: number
  documentName: string
  status: string
  createdAt: string
}

export function DocumentRequestsTable({ requests }: { requests: DocumentRequest[] }) {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)

  const handleView = (request: DocumentRequest) => {
    // Navigate to detail page
    window.location.href = `/document-request/${request.id}`
  }

  const handleReprocess = async (request: DocumentRequest) => {
    // API call to reprocess
    await fetch(`/api/document-requests/${request.id}/reprocess`, { method: 'POST' })
  }

  const columns: TableColumn<DocumentRequest>[] = [
    { key: 'documentName', header: 'Document', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true },
  ]

  return (
    <PaginatedDataTable
      data={requests}
      columns={columns}
      filter={{ value: filter, onChange: setFilter }}
      pagination={{
        currentPage: page,
        totalItems: requests.length,
        pageSize: 10,
        onPageChange: setPage,
        mode: 'client',
      }}
      rowActions={{
        width: '200px',
        render: (request) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" onClick={() => handleView(request)}>
              View
            </Button>
            {request.status === 'FAILED' && (
              <Button size="sm" onClick={() => handleReprocess(request)}>
                Reprocess
              </Button>
            )}
          </div>
        ),
      }}
    />
  )
}
```

---

### Example 3: Server-Side Table with Loading State

```tsx
'use client'

import { useState, useEffect } from 'react'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'

interface User {
  id: number
  name: string
  email: string
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(filter && { search: filter }),
        ...(sortColumn && { sortColumn }),
        ...(sortDirection && { sortDirection }),
      })

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      setUsers(data.users)
      setTotalItems(data.total)
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, pageSize, sortColumn, sortDirection, filter])

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPage(1) // Reset to first page when filter changes
  }

  const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(column)
    setSortDirection(direction)
    setPage(1) // Reset to first page when sorting changes
  }

  const columns: TableColumn<User>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
  ]

  return (
    <PaginatedDataTable
      data={users}
      columns={columns}
      filter={{
        value: filter,
        onChange: handleFilterChange,
        placeholder: 'Search users...',
        mode: 'server',
      }}
      sort={{
        type: 'single',
        column: sortColumn,
        direction: sortDirection,
        onSort: handleSort,
        mode: 'server',
      }}
      pagination={{
        currentPage: page,
        totalItems,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
        pageSizeOptions: [10, 25, 50, 100],
        showPageSizeSelector: true,
        mode: 'server',
      }}
      loading={loading}
      error={
        error
          ? {
              error: true,
              message: error,
              onRetry: fetchUsers,
            }
          : undefined
      }
    />
  )
}
```

---

### Example 4: Table with Bulk Selection and Actions

```tsx
'use client'

import { useState } from 'react'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import { Button } from '@/components/ui/Button'

interface Document {
  id: number
  name: string
  status: string
}

export function DocumentsTable({ documents }: { documents: Document[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleBulkDelete = async () => {
    await fetch('/api/documents/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: selectedIds }),
    })
    setSelectedIds([])
  }

  const handleBulkExport = () => {
    console.log('Exporting:', selectedIds)
  }

  const columns: TableColumn<Document>[] = [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
  ]

  return (
    <PaginatedDataTable
      data={documents}
      columns={columns}
      selection={{
        selectedIds,
        onSelectionChange: setSelectedIds,
        getRowId: (doc) => doc.id,
        renderBulkActions: (ids) => (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>{ids.length} items selected</span>
            <Button onClick={handleBulkExport}>Export</Button>
            <Button onClick={handleBulkDelete} variant="destructive">
              Delete
            </Button>
            <Button onClick={() => setSelectedIds([])} hierarchy="secondary">
              Clear Selection
            </Button>
          </div>
        ),
      }}
    />
  )
}
```

---

### Example 5: Combining All Features

```tsx
'use client'

import { useState } from 'react'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import { Button } from '@/components/ui/Button'

export function FullFeaturedTable({ data }: { data: any[] }) {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(column)
    setSortDirection(direction)
  }

  return (
    <PaginatedDataTable
      data={data}
      columns={columns}
      // Filter enabled
      filter={{
        value: filter,
        onChange: setFilter,
        placeholder: 'Search...',
      }}
      // Sort enabled (single-column)
      sort={{
        type: 'single',
        column: sortColumn,
        direction: sortDirection,
        onSort: handleSort,
        mode: 'client',
      }}
      // Pagination enabled
      pagination={{
        currentPage: page,
        totalItems: data.length,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
        pageSizeOptions: [10, 25, 50],
        showPageSizeSelector: true,
        mode: 'client',
      }}
      // Row actions enabled
      rowActions={{
        render: (row) => (
          <Button size="sm" onClick={() => console.log('View', row)}>
            View
          </Button>
        ),
      }}
      // Selection enabled
      selection={{
        selectedIds,
        onSelectionChange: setSelectedIds,
        getRowId: (row) => row.id,
        renderBulkActions: (ids) => (
          <div>
            {ids.length} selected
            <Button onClick={() => console.log('Bulk action', ids)}>
              Process Selected
            </Button>
          </div>
        ),
      }}
    />
  )
}
```

---

## API Reference

### PaginatedDataTableProps<T>

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `T[]` | Yes | - | Array of data to display |
| `columns` | `TableColumn<T>[]` | Yes | - | Column definitions |
| `rowKey` | `keyof T \| ((row: T) => string \| number)` | No | `'id'` | Unique key for each row |
| `filter` | `FilterConfig` | No | - | Filter configuration (opt-in) |
| `sort` | `SortConfig` | No | - | Sort configuration (opt-in) |
| `pagination` | `PaginationConfig` | No | - | Pagination configuration (opt-in) |
| `rowActions` | `RowActionsConfig<T>` | No | - | Row actions configuration (opt-in) |
| `selection` | `SelectionConfig<T>` | No | - | Selection configuration (opt-in) |
| `loading` | `boolean \| LoadingState` | No | `false` | Loading state |
| `error` | `ErrorState` | No | - | Error state |
| `emptyState` | `EmptyStateConfig` | No | - | Empty state customization |
| `variant` | `'default' \| 'bordered' \| 'striped'` | No | `'default'` | Table visual variant |
| `compact` | `boolean` | No | `false` | Compact row spacing |
| `stickyHeader` | `boolean` | No | `false` | Sticky table header |
| `className` | `string` | No | `''` | Additional container class |
| `tableClassName` | `string` | No | `''` | Additional table class |

---

### FilterConfig

```typescript
interface FilterConfig {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
  debounceMs?: number
  loading?: boolean
  disabled?: boolean
  mode?: 'client' | 'server' // Default: 'client'
}
```

---

### SortConfig

#### Single-Column Sort

```typescript
interface SingleSortConfig {
  type: 'single'
  column: string | null
  direction: 'asc' | 'desc' | null
  onSort: (column: string, direction: 'asc' | 'desc' | null) => void
  mode?: 'client' | 'server'
}
```

#### Multi-Column Sort

```typescript
interface MultiSortConfig {
  type: 'multi'
  sorts: MultiSortState[]
  onSort: (sorts: MultiSortState[]) => void
  mode?: 'client' | 'server'
  maxSorts?: number // default: 3
}

interface MultiSortState {
  column: string
  direction: 'asc' | 'desc'
  priority: number // 0 = primary, 1 = secondary, etc.
}
```

---

### PaginationConfig

```typescript
interface PaginationConfig {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showInfo?: boolean
  maxPageButtons?: number
  mode?: 'client' | 'server'
}
```

---

### RowActionsConfig<T>

```typescript
interface RowActionsConfig<T> {
  render: (row: T) => React.ReactNode
  width?: string
  header?: string
}
```

---

### SelectionConfig<T>

```typescript
interface SelectionConfig<T> {
  selectedIds: (string | number)[]
  onSelectionChange: (selectedIds: (string | number)[]) => void
  getRowId: (row: T) => string | number
  renderBulkActions?: (selectedIds: (string | number)[]) => React.ReactNode
}
```

---

## Type Definitions

All types are exported from `@/components/ui/PaginatedDataTable`:

```tsx
import type {
  PaginatedDataTableProps,
  FilterConfig,
  SortConfig,
  SingleSortConfig,
  MultiSortConfig,
  MultiSortState,
  PaginationConfig,
  LoadingState,
  ErrorState,
  EmptyStateConfig,
  RowActionsConfig,
  SelectionConfig,
  OperatingMode,
} from '@/components/ui/PaginatedDataTable'
```

---

## Best Practices

### Server-Side Mode

**1. Reset to Page 1 on Filter/Sort Changes**

Always reset to page 1 when filter or sort changes to avoid confusion:

```tsx
const handleFilterChange = (value: string) => {
  setFilter(value)
  setPage(1) // User expects to see first page of filtered results
}

const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
  setSortColumn(column)
  setSortDirection(direction)
  setPage(1) // User expects to see first page of sorted results
}
```

**2. Use useEffect for Data Fetching**

Keep handlers lightweight - update state only, fetch in useEffect:

```tsx
// Handlers only update state
const handleFilterChange = (value: string) => setFilter(value)
const handlePageChange = (page: number) => setPage(page)

// useEffect handles API calls when state changes
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    const result = await fetchUsers({ page, pageSize, filter, sortColumn, sortDirection })
    setUsers(result.data)
    setTotalItems(result.total)
    setLoading(false)
  }
  fetchData()
}, [page, pageSize, filter, sortColumn, sortDirection])
```

**3. Show Loading States**

Always provide loading feedback during server operations:

```tsx
<PaginatedDataTable
  data={users}
  columns={columns}
  loading={loading} // Shows loading overlay
  filter={{
    value: filter,
    onChange: handleFilterChange,
    loading: loading, // Shows spinner in search input
    mode: 'server',
  }}
/>
```

**4. Handle Errors Gracefully**

Provide retry capability for failed requests:

```tsx
<PaginatedDataTable
  data={users}
  columns={columns}
  error={
    error
      ? {
          error: true,
          message: error,
          onRetry: fetchData, // Let user retry
        }
      : undefined
  }
/>
```

### Client-Side Mode

**1. Avoid Large Datasets**

Use client mode only for small datasets (< 1000 rows):

```tsx
// ✅ Good - Small dataset
<PaginatedDataTable
  data={batchErrors} // 50 errors
  filter={{ value, onChange, mode: 'client' }}
/>

// ❌ Bad - Large dataset causing performance issues
<PaginatedDataTable
  data={allUsers} // 10,000 users - use server mode instead
  filter={{ value, onChange, mode: 'client' }}
/>
```

**2. Provide All Data Upfront**

In client mode, pass complete dataset - component will handle filtering/sorting/pagination:

```tsx
<PaginatedDataTable
  data={allBatches} // All 200 batches
  columns={columns}
  filter={{ value, onChange, mode: 'client' }}
  pagination={{
    currentPage: page,
    totalItems: allBatches.length, // Total of all data
    pageSize: 10,
    onPageChange: setPage,
    mode: 'client',
  }}
/>
```

---

## When to Use vs When NOT to Use

### ✅ Use PaginatedDataTable When:

- Displaying **read-only data** (batches, errors, logs, reports)
- Need **flexible features** (filter, sort, pagination)
- Different tables need **different feature combinations**
- Data can be **any domain** (not specific to CRUD)
- Want **client-side OR server-side** mode flexibility

### ❌ Don't Use PaginatedDataTable When:

- Building a **CRUD interface** (Create/Edit/Delete with forms)
  - Instead: Use or create a domain template (like RefDataTabTemplate)
  - Domain templates can use PaginatedDataTable internally
- Table has **highly custom rendering** that doesn't fit columns model
  - Consider using DataTable directly or building custom component

---

## Related Components

- **DataTable** - Low-level table component (used internally)
- **Pagination** - Pagination controls (used internally)
- **SearchInput** - Search input component (used internally)
- **EmptyState** - Empty/error state display (used internally)
- **RefDataTabTemplate** - CRUD-specific template that uses PaginatedDataTable

---

## Table Column Utilities

For standard column types (dates, status badges, booleans, numbers), use helper functions from `@/utils/tableUtils` to reduce boilerplate by 80%+:

```tsx
import {
  createTextColumn,
  createDateTimeColumn,
  createStatusColumn,
  createNumericColumn,
  createBooleanColumn,
} from '@/utils/tableUtils'

const columns: TableColumn<Batch>[] = [
  createTextColumn<Batch>('batchId', 'Batch ID', { width: '120px' }),
  createStatusColumn<Batch>({
    key: 'batchStatus',
    header: 'Status',
    type: 'batch',
    getStatus: (batch) => batch.batchStatus.refDataValue,
  }),
  createNumericColumn<Batch>('totalRecords', 'Records', { width: '100px' }),
  createDateTimeColumn<Batch>('createdDat', 'Created'),
]
```

**See:** [Table Utilities Guide](../../../utils/TABLE_UTILITIES_GUIDE.md) for comprehensive documentation, examples, and migration guide.

---

**Component Version:** 1.0  
**Created:** February 9, 2026  
**Phase:** 5.2a - PaginatedDataTable Foundation
