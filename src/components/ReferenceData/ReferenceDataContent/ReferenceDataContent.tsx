'use client'

import { useState } from 'react'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { ReferenceDataTypesTab } from '@/components/ReferenceData/ReferenceDataTypesTab'
import { ReferenceDataValuesTab } from '@/components/ReferenceData/ReferenceDataValuesTab'
import { DocumentConfigurationsTab } from '@/components/ReferenceData/DocumentConfigurationsTab'

/**
 * Tab configuration for Reference Data page
 */
const TAB_IDS = {
  TYPES: 'reference-data-types',
  VALUES: 'reference-data-values',
  CONFIGURATIONS: 'document-configurations',
} as const

const TABS: TabItem[] = [
  { id: TAB_IDS.TYPES, label: 'Reference Data Types' },
  { id: TAB_IDS.VALUES, label: 'Reference Data Values' },
  { id: TAB_IDS.CONFIGURATIONS, label: 'Document Configurations' },
]

/**
 * Reference Data Page Content (Refactored)
 *
 * Simplified orchestrator that only handles tab switching.
 * Each tab is now self-contained with its own data fetching,
 * CRUD operations, and modal management.
 *
 * Reduced from 549 lines to ~50 lines!
 */
export function ReferenceDataContent() {
  const [activeTab, setActiveTab] = useState<string>(TAB_IDS.CONFIGURATIONS)

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case TAB_IDS.TYPES:
        return <ReferenceDataTypesTab />
      case TAB_IDS.VALUES:
        return <ReferenceDataValuesTab />
      case TAB_IDS.CONFIGURATIONS:
        return <DocumentConfigurationsTab />
      default:
        return null
    }
  }

  return (
    <Tabs
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      variant="underline"
    >
      {(tabId) => renderTabContent(tabId)}
    </Tabs>
  )
}
