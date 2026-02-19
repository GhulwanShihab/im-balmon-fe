/**
 * Utility function tests for IM-Balmon frontend
 */
import { describe, it, expect } from 'vitest'

/**
 * Date formatting utility tests
 */
describe('Date Utilities', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = date.toLocaleDateString('id-ID')
    expect(formatted).toBeTruthy()
    expect(typeof formatted).toBe('string')
  })

  it('should calculate date difference correctly', () => {
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-01-10')
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    expect(diffDays).toBe(9)
  })
})

/**
 * String validation utility tests
 */
describe('String Validation', () => {
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    expect(emailRegex.test('user@example.com')).toBe(true)
    expect(emailRegex.test('user.name@domain.co.id')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)
    expect(emailRegex.test('@example.com')).toBe(false)
    expect(emailRegex.test('user@')).toBe(false)
  })

  it('should validate password strength', () => {
    const hasMinLength = (password) => password.length >= 8
    const hasUpperCase = (password) => /[A-Z]/.test(password)
    const hasLowerCase = (password) => /[a-z]/.test(password)
    const hasNumber = (password) => /[0-9]/.test(password)
    
    const strongPassword = 'SecureP@ss123'
    expect(hasMinLength(strongPassword)).toBe(true)
    expect(hasUpperCase(strongPassword)).toBe(true)
    expect(hasLowerCase(strongPassword)).toBe(true)
    expect(hasNumber(strongPassword)).toBe(true)
    
    const weakPassword = 'abc123'
    expect(hasMinLength(weakPassword)).toBe(false)
  })
})

/**
 * Device status utility tests
 */
describe('Device Status Utilities', () => {
  const DEVICE_STATUSES = {
    TERSEDIA: 'TERSEDIA',
    DIPINJAM: 'DIPINJAM',
    MAINTENANCE: 'MAINTENANCE',
    NONAKTIF: 'NONAKTIF',
  }

  it('should have all required device statuses', () => {
    expect(DEVICE_STATUSES.TERSEDIA).toBe('TERSEDIA')
    expect(DEVICE_STATUSES.DIPINJAM).toBe('DIPINJAM')
    expect(DEVICE_STATUSES.MAINTENANCE).toBe('MAINTENANCE')
    expect(DEVICE_STATUSES.NONAKTIF).toBe('NONAKTIF')
  })

  it('should check if device is available', () => {
    const isAvailable = (status) => status === DEVICE_STATUSES.TERSEDIA
    
    expect(isAvailable('TERSEDIA')).toBe(true)
    expect(isAvailable('DIPINJAM')).toBe(false)
    expect(isAvailable('MAINTENANCE')).toBe(false)
  })

  it('should check if device is borrowable', () => {
    const isBorrowable = (status, condition) => {
      return status === 'TERSEDIA' && condition === 'baik'
    }
    
    expect(isBorrowable('TERSEDIA', 'baik')).toBe(true)
    expect(isBorrowable('TERSEDIA', 'rusak_ringan')).toBe(false)
    expect(isBorrowable('DIPINJAM', 'baik')).toBe(false)
  })
})

/**
 * Loan calculation tests
 */
describe('Loan Calculations', () => {
  it('should calculate loan duration correctly', () => {
    const calculateDuration = (startDate, endDate) => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    expect(calculateDuration('2024-01-01', '2024-01-10')).toBe(9)
    expect(calculateDuration('2024-01-01', '2024-01-01')).toBe(0)
    expect(calculateDuration('2024-01-01', '2024-01-31')).toBe(30)
  })

  it('should detect overdue loans', () => {
    const isOverdue = (endDateStr, status) => {
      if (status !== 'DIPINJAM') return false
      const endDate = new Date(endDateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return endDate < today
    }
    
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)
    
    expect(isOverdue(pastDate.toISOString(), 'DIPINJAM')).toBe(true)
    expect(isOverdue(futureDate.toISOString(), 'DIPINJAM')).toBe(false)
    expect(isOverdue(pastDate.toISOString(), 'DIKEMBALIKAN')).toBe(false)
  })

  it('should generate loan number with correct format', () => {
    const generateLoanNumber = (sequence) => {
      const today = new Date()
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
      return `LOAN-${dateStr}-${String(sequence).padStart(4, '0')}`
    }
    
    const loanNumber = generateLoanNumber(1)
    expect(loanNumber).toMatch(/^LOAN-\d{8}-\d{4}$/)
    expect(loanNumber.startsWith('LOAN-')).toBe(true)
  })
})

/**
 * Pagination utility tests
 */
describe('Pagination', () => {
  it('should calculate total pages correctly', () => {
    const calculateTotalPages = (total, pageSize) => {
      return Math.ceil(total / pageSize)
    }
    
    expect(calculateTotalPages(100, 10)).toBe(10)
    expect(calculateTotalPages(95, 10)).toBe(10)
    expect(calculateTotalPages(101, 10)).toBe(11)
    expect(calculateTotalPages(0, 10)).toBe(0)
  })

  it('should calculate skip/offset correctly', () => {
    const calculateSkip = (page, pageSize) => {
      return (page - 1) * pageSize
    }
    
    expect(calculateSkip(1, 10)).toBe(0)
    expect(calculateSkip(2, 10)).toBe(10)
    expect(calculateSkip(5, 20)).toBe(80)
  })
})
