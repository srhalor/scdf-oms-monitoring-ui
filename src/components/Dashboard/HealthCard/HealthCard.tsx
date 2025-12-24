'use client'

import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faTriangleExclamation, faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { logger } from '@/lib/logger'
import type { HealthStatus } from '@/types/health'
import styles from './HealthCard.module.css'

interface HealthCardProps {
  onRefresh?: () => void
}

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

export const HealthCard = ({ onRefresh }: HealthCardProps) => {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchHealth = useCallback(async () => {
    logger.debug('HealthCard', 'Fetching health status')
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      setStatus(data.status)
      setLastChecked(new Date())
      logger.debug('HealthCard', 'Health status received', { status: data.status })
    } catch (error) {
      logger.error('HealthCard', 'Failed to fetch health status', error)
      setStatus('DOWN')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const handleRefresh = useCallback(() => {
    fetchHealth()
    onRefresh?.()
  }, [fetchHealth, onRefresh])

  // Initial fetch
  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealth()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchHealth])

  const getStatusIcon = () => {
    switch (status) {
      case 'UP':
        return faCircleCheck
      case 'DOWN':
        return faCircleXmark
      case 'DEGRADED':
        return faTriangleExclamation
      default:
        return faCircleXmark
    }
  }

  const getStatusClass = () => {
    switch (status) {
      case 'UP':
        return styles.statusUp
      case 'DOWN':
        return styles.statusDown
      case 'DEGRADED':
        return styles.statusDegraded
      default:
        return styles.statusDown
    }
  }

  const formatLastChecked = () => {
    if (!lastChecked) return 'Never'
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return lastChecked.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Service Health</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Service Health</h3>
        <button
          className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh health status"
        >
          <FontAwesomeIcon icon={faArrowsRotate} />
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={`${styles.status} ${getStatusClass()}`}>
          <FontAwesomeIcon icon={getStatusIcon()} className={styles.statusIcon} />
          <span className={styles.statusText}>{status || 'UNKNOWN'}</span>
        </div>
        
        <div className={styles.lastChecked}>
          Last checked: {formatLastChecked()}
        </div>
      </div>
    </div>
  )
}
