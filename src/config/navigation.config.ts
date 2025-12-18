/**
 * Navigation configuration
 * Defines all navigation items for the sidebar
 */

import { faChartLine, faDatabase, faFileLines } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: IconDefinition
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: faChartLine,
  },
  {
    id: 'reference-data',
    label: 'Reference Data',
    path: '/reference-data',
    icon: faDatabase,
  },
  {
    id: 'document-request',
    label: 'Document Request',
    path: '/document-request',
    icon: faFileLines,
  },
] as const
