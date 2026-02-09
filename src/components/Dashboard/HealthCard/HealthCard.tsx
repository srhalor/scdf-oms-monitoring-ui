'use client'

import { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faTriangleExclamation, faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { Card } from '@/components/ui/Card'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { HealthStatus } from '@/types/health'
import styles from './HealthCard.module.css'

interface HealthCardProps {
  readonly onRefresh?: () => void
}

interface HealthResponse {
  status: HealthStatus
}

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

export const HealthCard = ({ onRefresh }: HealthCardProps) => {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''

  const { data, loading, error, refetch, isFetching } = useApiQuery<HealthResponse>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/health`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    refetchInterval: REFRESH_INTERVAL,
  })

  const handleRefresh = useCallback(() => {
    refetch()
    onRefresh?.()
  }, [refetch, onRefresh])

  const status = error ? 'DOWN' : data?.status || null
  const isRefreshing = isFetching && !loading

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

  const getStatusMessage = () => {
    if (loading) return 'Checking status...'
    if (isRefreshing) return 'Refreshing...'
    if (error) return 'Check failed'
    return 'Status up to date'
  }

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Service Health</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className={styles.loading}>Loading...</div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Service Health</Card.Title>
        <button
          className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh health status"
        >
          <FontAwesomeIcon icon={faArrowsRotate} />
        </button>
      </Card.Header>
      
      <Card.Body>
        <div className={`${styles.status} ${getStatusClass()}`}>
          <FontAwesomeIcon icon={getStatusIcon()} className={styles.statusIcon} />
          <span className={styles.statusText}>{status || 'UNKNOWN'}</span>
        </div>
        
        <div className={styles.lastChecked}>
          {getStatusMessage()}
        </div>
      </Card.Body>
    </Card>
  )
}
