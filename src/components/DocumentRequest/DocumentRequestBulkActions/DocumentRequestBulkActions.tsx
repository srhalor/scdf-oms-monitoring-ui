'use client'

import { useState, useCallback } from 'react'
import { faRotate, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import styles from './DocumentRequestBulkActions.module.css'

export interface DocumentRequestBulkActionsProps {
  /** Number of selected items */
  selectedCount: number
  /** Selected request IDs */
  selectedIds: number[]
  /** Callback to reprocess selected requests */
  onReprocess: (ids: number[]) => Promise<void>
  /** Callback to clear selection */
  onClearSelection: () => void
  /** Whether a reprocess operation is in progress */
  isReprocessing?: boolean
}

/**
 * DocumentRequestBulkActions component
 *
 * Floating action bar for bulk operations on selected document requests.
 * Shows when items are selected, with reprocess and clear actions.
 *
 * @example
 * <DocumentRequestBulkActions
 *   selectedCount={selectedCount}
 *   selectedIds={getSelectedArray()}
 *   onReprocess={handleReprocess}
 *   onClearSelection={deselectAll}
 *   isReprocessing={isReprocessing}
 * />
 */
export function DocumentRequestBulkActions({
  selectedCount,
  selectedIds,
  onReprocess,
  onClearSelection,
  isReprocessing = false,
}: Readonly<DocumentRequestBulkActionsProps>) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleReprocessClick = useCallback(() => {
    setShowConfirmDialog(true)
  }, [])

  const handleConfirmReprocess = useCallback(async () => {
    setShowConfirmDialog(false)
    await onReprocess(selectedIds)
  }, [onReprocess, selectedIds])

  const handleCancelReprocess = useCallback(() => {
    setShowConfirmDialog(false)
  }, [])

  // Don't render if nothing selected
  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className={styles.bulkActionsBar}>
        <div className={styles.selectionInfo}>
          <span className={styles.selectedCount}>{selectedCount}</span>
          <span className={styles.selectedLabel}>
            {selectedCount === 1 ? 'request selected' : 'requests selected'}
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            hierarchy="primary"
            size="md"
            iconBefore={isReprocessing ? faSpinner : faRotate}
            onClick={handleReprocessClick}
            disabled={isReprocessing}
          >
            {isReprocessing ? 'Reprocessing...' : 'Reprocess'}
          </Button>
          <Button
            hierarchy="tertiary"
            size="md"
            onClick={onClearSelection}
            disabled={isReprocessing}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm Reprocess"
        message={`Are you sure you want to reprocess ${selectedCount} document ${selectedCount === 1 ? 'request' : 'requests'}? This will re-submit them for processing.`}
        confirmText="Reprocess"
        cancelText="Cancel"
        onConfirm={handleConfirmReprocess}
        onClose={handleCancelReprocess}
        variant="warning"
      />
    </>
  )
}
