'use client'

import { useCallback, useState } from 'react'
import styles from './Tabs.module.css'

/**
 * Tab item definition
 */
export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}

/**
 * Tabs component props
 */
export interface TabsProps {
  /** Array of tab definitions */
  tabs: TabItem[]
  /** Initially active tab ID */
  defaultActiveTab?: string
  /** Controlled active tab ID */
  activeTab?: string
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void
  /** Tab variant style */
  variant?: 'underline' | 'segmented' | 'outline'
  /** Children render function receives active tab ID */
  children: (activeTabId: string) => React.ReactNode
  /** Additional class for tabs container */
  className?: string
}

/**
 * Tabs Component
 *
 * A flexible tabs component supporting multiple visual variants.
 * Supports both controlled and uncontrolled modes.
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1' },
 *     { id: 'tab2', label: 'Tab 2' },
 *   ]}
 *   defaultActiveTab="tab1"
 * >
 *   {(activeTab) => (
 *     <div>Active: {activeTab}</div>
 *   )}
 * </Tabs>
 * ```
 */
export function Tabs({
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'underline',
  children,
  className,
}: Readonly<TabsProps>) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || tabs[0]?.id || ''
  )

  // Use controlled value if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (controlledActiveTab === undefined) {
        setInternalActiveTab(tabId)
      }
      onTabChange?.(tabId)
    },
    [controlledActiveTab, onTabChange]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = tabs.filter(tab => !tab.disabled)
      const currentEnabledIndex = enabledTabs.findIndex(tab => tab.id === tabs[currentIndex].id)

      let newIndex: number | null = null

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          newIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1
          break
        case 'ArrowRight':
          event.preventDefault()
          newIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0
          break
        case 'Home':
          event.preventDefault()
          newIndex = 0
          break
        case 'End':
          event.preventDefault()
          newIndex = enabledTabs.length - 1
          break
      }

      if (newIndex !== null) {
        const newTab = enabledTabs[newIndex]
        handleTabClick(newTab.id)
        // Focus the new tab button
        const tabElement = document.querySelector(`[data-tab-id="${newTab.id}"]`) as HTMLButtonElement
        tabElement?.focus()
      }
    },
    [tabs, handleTabClick]
  )

  const tabListClasses = [
    styles.tabList,
    variant === 'underline' ? '' : styles[variant],
  ].filter(Boolean).join(' ')

  const containerClasses = [styles.tabsContainer, className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <div
        className={tabListClasses}
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={e => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabPanels}>
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={activeTab}
          className={`${styles.tabPanel} ${styles.active}`}
        >
          {children(activeTab)}
        </div>
      </div>
    </div>
  )
}
