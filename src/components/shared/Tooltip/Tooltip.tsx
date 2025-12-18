'use client'

import React, { useState, useRef } from 'react'
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
}

/**
 * Custom tooltip component that displays a message on hover
 */
export function Tooltip({
  children,
  message,
  position = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={triggerRef}
      className={`${styles.tooltipWrapper} ${className || ''}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && message && (
        <div 
          className={`${styles.tooltip} ${styles[position.replace(' ', '-')]}`} 
          role="tooltip"
        >
          <div className={styles.tooltipContent}>{message}</div>
        </div>
      )}
    </div>
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
}: TooltipIconProps) {
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

