import styles from './FormActions.module.css'
import type { ReactNode } from 'react'

interface FormActionsProps {
  readonly children: ReactNode
  readonly align?: 'left' | 'right' | 'center' | 'space-between'
  readonly sticky?: boolean
  readonly className?: string
}

/**
 * FormActions - Container for form action buttons (Submit, Cancel, etc.)
 * Provides consistent spacing and alignment
 * 
 * @example
 * <FormActions align="right">
 *   <Button hierarchy="secondary" onClick={handleCancel}>
 *     Cancel
 *   </Button>
 *   <Button hierarchy="primary" type="submit">
 *     Save Changes
 *   </Button>
 * </FormActions>
 * 
 * @example
 * // Sticky actions at bottom of modal/form
 * <FormActions align="space-between" sticky>
 *   <Button hierarchy="secondary" variant="destructive">
 *     Delete
 *   </Button>
 *   <div>
 *     <Button hierarchy="secondary">Cancel</Button>
 *     <Button hierarchy="primary">Save</Button>
 *   </div>
 * </FormActions>
 */
export const FormActions = ({
  children,
  align = 'right',
  sticky = false,
  className = '',
}: FormActionsProps) => {
  const actionsClassNames = [
    styles['form-actions'],
    styles[`align-${align}`],
    sticky && styles.sticky,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={actionsClassNames}>{children}</div>
}
