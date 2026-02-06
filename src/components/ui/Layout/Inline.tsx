import type { CSSProperties, ReactNode } from 'react'
import styles from './Inline.module.css'

interface InlineProps {
  readonly children: ReactNode
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  readonly align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  readonly justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  readonly wrap?: boolean
  readonly className?: string
  readonly fullWidth?: boolean
  readonly style?: CSSProperties
  readonly as?: 'div' | 'nav' | 'footer' | 'header'
}

/**
 * Inline - Horizontal layout component with consistent spacing
 * Perfect for button groups, breadcrumbs, navigation items
 * 
 * @example
 * <Inline gap="sm" justify="space-between">
 *   <Button>Cancel</Button>
 *   <Button hierarchy="primary">Save</Button>
 * </Inline>
 */
export const Inline = ({
  children,
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className = '',
  fullWidth = false,
  style,
  as: Component = 'div',
}: InlineProps) => {
  const classNames = [
    styles.inline,
    styles[`gap-${gap}`],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    wrap && styles.wrap,
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
