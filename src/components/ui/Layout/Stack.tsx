import type { CSSProperties, ReactNode } from 'react'
import styles from './Stack.module.css'

interface StackProps {
  readonly children: ReactNode
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  readonly align?: 'start' | 'center' | 'end' | 'stretch'
  readonly justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  readonly className?: string
  readonly fullWidth?: boolean
  readonly style?: CSSProperties
  readonly as?: 'div' | 'section' | 'article' | 'aside'
}

/**
 * Stack - Vertical layout component with consistent spacing
 * Replaces div soup with semantic, reusable layout pattern
 * 
 * @example
 * <Stack gap="md" align="stretch">
 *   <PageLayout.Header title="Dashboard" />
 *   <Card>Content</Card>
 * </Stack>
 */
export const Stack = ({
  children,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
  fullWidth = false,
  style,
  as: Component = 'div',
}: StackProps) => {
  const classNames = [
    styles.stack,
    styles[`gap-${gap}`],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    fullWidth && styles['full-width'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={classNames} style={style}>
      {children}
    </Component>
  )
}
