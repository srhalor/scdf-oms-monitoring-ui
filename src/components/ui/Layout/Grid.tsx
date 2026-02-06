import type { CSSProperties, ReactNode } from 'react'
import styles from './Grid.module.css'

interface GridProps {
  readonly children: ReactNode
  readonly columns?: 1 | 2 | 3 | 4 | 6 | 12 | 'auto-fit' | 'auto-fill'
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  readonly minColumnWidth?: string
  readonly className?: string
  readonly style?: CSSProperties
  readonly as?: 'div' | 'section' | 'ul'
}

/**
 * Grid - Responsive grid layout with consistent spacing
 * Supports fixed columns or auto-responsive layouts
 * 
 * @example
 * // Fixed 3 columns
 * <Grid columns={3} gap="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * 
 * @example
 * // Responsive auto-fit
 * <Grid columns="auto-fit" minColumnWidth="300px" gap="lg">
 *   <Card>Responsive Item</Card>
 * </Grid>
 */
export const Grid = ({
  children,
  columns = 'auto-fit',
  gap = 'md',
  minColumnWidth = '250px',
  className = '',
  style,
  as: Component = 'div',
}: GridProps) => {
  const classNames = [
    styles.grid,
    typeof columns === 'number' && styles[`columns-${columns}`],
    styles[`gap-${gap}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const gridStyle: CSSProperties = {
    ...style,
    ...(typeof columns === 'string' && {
      gridTemplateColumns: `repeat(${columns}, minmax(${minColumnWidth}, 1fr))`,
    }),
  }

  return (
    <Component className={classNames} style={gridStyle}>
      {children}
    </Component>
  )
}
