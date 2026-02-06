'use client'

import { useCallback, useMemo, useState } from 'react'
import { faDownload, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import { logger } from '@/lib/logger'
import styles from './ContentViewer.module.css'

export interface ContentViewerProps {
  /** Content to display */
  content: string
  /** Content type for formatting and download */
  contentType: 'JSON' | 'XML'
  /** Request ID for filename */
  requestId: number
  /** Additional CSS class */
  className?: string
}

/**
 * Format JSON content with proper indentation
 */
function formatJson(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // If parsing fails, return original content
    return content
  }
}

/**
 * Format XML content with proper indentation
 */
function formatXml(content: string): string {
  try {
    // Simple XML formatting - add newlines and indentation
    let formatted = ''
    let indent = 0
    const lines = content.replaceAll(/>\s*</g, '>\n<').split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1)
      }

      formatted += '  '.repeat(indent) + trimmed + '\n'

      // Increase indent for opening tags (not self-closing, not closing)
      if (
        trimmed.startsWith('<') &&
        !trimmed.startsWith('</') &&
        !trimmed.startsWith('<?') &&
        !trimmed.endsWith('/>') &&
        !trimmed.includes('</') // Not inline closing like <tag>content</tag>
      ) {
        indent++
      }
    }

    return formatted.trim()
  } catch {
    return content
  }
}

/**
 * ContentViewer component
 *
 * Displays formatted JSON or XML content with copy and download functionality.
 * Used for viewing document request content in detail pages.
 *
 * @example
 * <ContentViewer
 *   content='{"key": "value"}'
 *   contentType="JSON"
 *   requestId={101}
 * />
 */
export function ContentViewer({
  content,
  contentType,
  requestId,
  className,
}: Readonly<ContentViewerProps>) {
  const [copied, setCopied] = useState(false)

  // Format content based on type
  const formattedContent = useMemo(() => {
    if (contentType === 'JSON') {
      return formatJson(content)
    }
    return formatXml(content)
  }, [content, contentType])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      logger.error('ContentViewer', 'Failed to copy content', { error })
    }
  }, [formattedContent])

  // Download content as file
  const handleDownload = useCallback(() => {
    const extension = contentType === 'JSON' ? 'json' : 'xml'
    const mimeType = contentType === 'JSON' ? 'application/json' : 'application/xml'
    const filename = `document-request-${requestId}.${extension}`

    const blob = new Blob([formattedContent], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [formattedContent, contentType, requestId])

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>{contentType} Content</span>
        <div className={styles.actions}>
          <Button
            hierarchy="tertiary"
            size="sm"
            icon={copied ? faCheck : faCopy}
            label={copied ? 'Copied!' : 'Copy to clipboard'}
            onClick={handleCopy}
            tooltipPosition="bottom"
          />
          <Button
            hierarchy="tertiary"
            size="sm"
            icon={faDownload}
            label="Download"
            onClick={handleDownload}
            tooltipPosition="bottom"
          />
        </div>
      </div>

      <div className={styles.content}>
        <pre className={styles.code}>
          <code>{formattedContent}</code>
        </pre>
      </div>
    </div>
  )
}
