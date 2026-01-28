import https from 'https'
import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'

/**
 * Load CA certificates from the certificates directory
 * 
 * @returns https.Agent with loaded CAs or undefined
 */
function loadCAs() {
  const certPath = path.resolve(process.cwd(), 'certificates')

  try {
    // Check if certificates directory exists
    if (!fs.existsSync(certPath)) {
      logger.info('certHelper', 'Certificates directory not found, skipping CA configuration', {})
      return undefined
    }

    const stats = fs.statSync(certPath)
    
    if (!stats.isDirectory()) {
      logger.warn('certHelper', 'Certificates path exists but is not a directory', {})
      return undefined
    }

    // Load all certificate files from directory
    logger.info('certHelper', `Loading CA certificates from: ${certPath}`, {})
    const files = fs.readdirSync(certPath)
      .filter(file => /\.(crt|pem|cer)$/i.test(file))
      .map(file => path.join(certPath, file))
    
    if (files.length === 0) {
      logger.info('certHelper', 'No certificate files found in certificates directory', {})
      return undefined
    }

    const cas = files.map(file => {
      logger.info('certHelper', `Loading certificate: ${path.basename(file)}`, {})
      return fs.readFileSync(file)
    })
    
    logger.info('certHelper', `Loaded ${cas.length} CA certificate(s)`, {})
    return new https.Agent({ ca: cas })
  } catch (error) {
    logger.error('certHelper', `Failed to load CA certificates: ${error}`, {})
    return undefined
  }
}

export const httpsAgent = loadCAs()
