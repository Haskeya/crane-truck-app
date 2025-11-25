import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getBgColor = () => {
    switch (type) {
      case 'success': return '#d4edda'
      case 'error': return '#f8d7da'
      case 'warning': return '#fff3cd'
      case 'info': return '#d1ecf1'
      default: return '#d1ecf1'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success': return '#155724'
      case 'error': return '#721c24'
      case 'warning': return '#856404'
      case 'info': return '#0c5460'
      default: return '#0c5460'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓'
      case 'error': return '✗'
      case 'warning': return '⚠'
      case 'info': return 'ℹ'
      default: return 'ℹ'
    }
  }

  return (
    <div className={`toast ${type}`}>
      <div className="toast-icon" style={{ color: getTextColor(), backgroundColor: getBgColor() }}>
        {getIcon()}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Kapat">
        ×
      </button>
    </div>
  )
}


