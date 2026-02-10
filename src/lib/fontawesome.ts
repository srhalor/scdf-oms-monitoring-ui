/**
 * FontAwesome Library Configuration
 * 
 * This file registers FontAwesome icons with the library so they can be used
 * throughout the application without importing them in each component.
 * 
 * Usage:
 * 1. Import this file in App.tsx (or root component)
 * 2. Add icons to the library using library.add()
 * 3. Use icons in components with <FontAwesomeIcon icon={["fas", "icon-name"]} />
 * 
 * Icon reference: https://fontawesome.com/icons
 */

import { config, library } from '@fortawesome/fontawesome-svg-core'
import {
  faHouse,
  faChartLine,
  faBars,
  faXmark,
  faUser,
  faCircleInfo,
  faGear,
  faBell,
  faFileLines,
  faChartPie,
  faUsers,
  faServer,
  faDatabase,
  faRightFromBracket,
  faArrowUp,
  faInbox,
  faChevronLeft,
  faChevronRight,
  faPen,
  faTrash,
  faPlus,
  faSearch,
  faFilter,
  faRefresh,
  faTriangleExclamation,
  faCircleQuestion,
  faCalendar,
  faChevronDown,
  faCheck,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'

// Prevent FontAwesome from dynamically adding its CSS
config.autoAddCss = false

// Register icons with the library
library.add(
  faHouse,           // Home icon
  faChartLine,       // Dashboard/analytics icon
  faBars,            // Menu/hamburger icon
  faXmark,           // Close/X icon
  faUser,            // User icon
  faCircleInfo,      // Info circle icon
  faGear,            // Settings/gear icon
  faBell,            // Notification bell icon
  faFileLines,       // Document/file icon
  faChartPie,        // Chart/pie icon
  faUsers,           // Users icon
  faServer,          // Server icon
  faDatabase,        // Database icon
  faRightFromBracket, // Logout icon
  faArrowUp,         // Sort arrow icon
  faInbox,           // Empty state icon
  faChevronLeft,     // Pagination previous
  faChevronRight,    // Pagination next
  faPen,             // Edit icon
  faTrash,           // Delete icon
  faPlus,            // Add/Create icon
  faSearch,          // Search icon
  faFilter,          // Filter icon
  faRefresh,         // Refresh icon
  faTriangleExclamation, // Warning icon
  faCircleQuestion,  // Question/help icon
  faCalendar,        // Calendar/date icon
  faChevronDown,     // Dropdown arrow
  faCheck,           // Checkbox/success icon
  faEye,             // Show password
  faEyeSlash,        // Hide password
)

/**
 * To add more icons:
 * 1. Import from @fortawesome/free-solid-svg-icons (or other FA packages)
 * 2. Add to library.add() call above
 * 3. Use in components with the icon name (e.g., "house" for faHouse)
 * 
 * Example:
 * import { faNewIcon } from '@fortawesome/free-solid-svg-icons'
 * library.add(faNewIcon)
 * 
 * Then in component:
 * <FontAwesomeIcon icon={["fas", "new-icon"]} />
 */
