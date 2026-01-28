'use client'

import React, { useState, useId, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import styles from './Tooltip.module.css'

export type TooltipPosition = 
  | 'top' 
  | 'bottom' 
  | 'left' 
  | 'right' 
  | 'top left' 
  | 'top right' 
  | 'bottom left' 
  | 'bottom right'

export interface TooltipProps {
  children: React.ReactNode
  message: string | JSX.Element
  position?: TooltipPosition
  className?: string
  /** 
   * Whether the trigger element is already interactive (button, link, input).
   * If true, uses CSS-only hover (no JS events on wrapper).
   * If false, wraps content in a button for full keyboard accessibility.
   * @default false
   */
  hasInteractiveChild?: boolean
}

/**
 * Custom tooltip component that displays a message on hover, focus, and touch.
 * Fully accessible with keyboard support (Escape to close) and proper ARIA attributes.
 * 
 * For interactive children (buttons, links): Uses CSS-only hover approach.
 * For non-interactive content: Wraps in an accessible button element.
 */
export function Tooltip({
  children,
  message,
  position = 'top',
  className,
  hasInteractiveChild = false,
}: Readonly<TooltipProps>) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const tooltipId = useId()

  // Show tooltip if hovered OR focused (but not if just focused after click and mouse left)
  const isVisible = isHovered || isFocused

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    // Also clear focus state when mouse leaves to handle click-then-leave scenario
    setIsFocused(false)
  }, [])
  
  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      setIsHovered(false)
      setIsFocused(false)
    }
  }, [isVisible])

  // Touch support - toggle on touch for mobile devices
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    setIsHovered(prev => !prev)
  }, [])

  // Common tooltip element
  const tooltipElement = isVisible && message ? (
    <span 
      id={tooltipId}
      className={`${styles.tooltip} ${styles[position.replace(' ', '-')]}`} 
      role="tooltip"
    >
      <span className={styles.tooltipContent}>{message}</span>
    </span>
  ) : null

  // When wrapping interactive children (buttons, links), use span wrapper with JS events
  // The interactive child handles its own keyboard accessibility
  // For non-interactive children, wrap in a button for full accessibility
  return hasInteractiveChild ? (
    <span // NOSONAR - wrapper delegates keyboard accessibility to interactive child
      className={`${styles.tooltipWrapper} ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      {children}
      {tooltipElement}
    </span>
  ) : (
    <button
      type="button"
      className={`${styles.tooltipTrigger} ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      {tooltipElement}
    </button>
  )
}

export interface TooltipIconProps {
  tooltipText: string
  tooltipPosition?: TooltipPosition
  iconColour?: string
  className?: string
}

/**
 * Info icon with tooltip - useful for help text next to form fields or labels
 */
export function TooltipIcon({
  tooltipText,
  tooltipPosition = 'top',
  iconColour = 'var(--color-gray-400)',
  className,
}: Readonly<TooltipIconProps>) {
  return (
    <Tooltip message={tooltipText} position={tooltipPosition} className={className}>
      <span className={styles.tooltipIconWrapper}>
        <FontAwesomeIcon 
          icon={faCircleInfo} 
          className={styles.tooltipIcon}
          style={{ color: iconColour }}
        />
      </span>
    </Tooltip>
  )
}

