import styles from './FormSection.module.css'
import type { ReactNode } from 'react'

interface FormSectionProps {
  readonly children: ReactNode
  readonly title?: string
  readonly description?: string
  readonly className?: string
  readonly divider?: boolean
}

/**
 * FormSection - Groups related form fields with optional title and description
 * Provides visual separation between form sections
 * 
 * @example
 * <FormSection
 *   title="Personal Information"
 *   description="Basic details about your account"
 *   divider
 * >
 *   <FormGroup label="First Name">
 *     <input type="text" />
 *   </FormGroup>
 *   <FormGroup label="Last Name">
 *     <input type="text" />
 *   </FormGroup>
 * </FormSection>
 */
export const FormSection = ({
  children,
  title,
  description,
  className = '',
  divider = false,
}: FormSectionProps) => {
  const sectionClassNames = [
    styles['form-section'],
    divider && styles.divider,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={sectionClassNames}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  )
}
