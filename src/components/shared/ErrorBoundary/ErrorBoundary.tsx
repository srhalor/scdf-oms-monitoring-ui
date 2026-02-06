'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { logger } from '@/lib/logger'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void
  readonly resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Graceful error handling for React component trees
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI
 * 
 * @example
 * // Wrap entire page
 * <ErrorBoundary>
 *   <DocumentRequestContent />
 * </ErrorBoundary>
 * 
 * @example
 * // Custom fallback with reset capability
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error, errorInfo) => logToMonitoring(error, errorInfo)}
 *   resetKeys={[userId, pageId]}
 * >
 *   <ComplexFeature />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console and logging service
    logger.error('ErrorBoundary', 'Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || []
      const currentKeys = this.props.resetKeys

      const hasChanged =
        prevKeys.length !== currentKeys.length ||
        prevKeys.some((key, index) => key !== currentKeys[index])

      if (hasChanged) {
        this.setState({ hasError: false, error: null })
      }
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className={styles.container} role="alert">
          <div className={styles.content}>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              An unexpected error occurred. Please try refreshing the page or contact support if
              the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.details}>
                <summary className={styles.summary}>Error Details (Development Only)</summary>
                <pre className={styles.stack}>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button type="button" className={styles.resetButton} onClick={this.handleReset}>
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
