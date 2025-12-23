import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GradeSelector, GradeSelectorCompact } from '@/components/storefront/grade-selector'

describe('GradeSelector', () => {
  it('renders all default grades', () => {
    render(<GradeSelector />)

    // Check that grade selector is rendered
    expect(screen.getByTestId('grade-selector')).toBeInTheDocument()

    // Check for Grade R (renders twice - mobile and desktop views)
    const gradeRElements = screen.getAllByTestId('grade-r')
    expect(gradeRElements.length).toBeGreaterThanOrEqual(1)

    // Check for Grade 12
    const grade12Elements = screen.getAllByTestId('grade-12')
    expect(grade12Elements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders with custom grades', () => {
    const customGrades = [
      { id: '1', name: 'Grade 1', slug: 'grade-1' },
      { id: '2', name: 'Grade 2', slug: 'grade-2' },
    ]

    render(<GradeSelector grades={customGrades} />)

    const grade1Elements = screen.getAllByTestId('grade-1')
    expect(grade1Elements.length).toBeGreaterThanOrEqual(1)

    const grade2Elements = screen.getAllByTestId('grade-2')
    expect(grade2Elements.length).toBeGreaterThanOrEqual(1)

    expect(screen.queryByTestId('grade-12')).not.toBeInTheDocument()
  })

  it('highlights selected grade', () => {
    render(<GradeSelector selectedGrade="grade-5" />)

    const grade5Elements = screen.getAllByTestId('grade-5')
    // At least one of the grade-5 elements should have the selected class
    expect(grade5Elements.some(el => el.classList.contains('border-primary'))).toBe(true)
  })

  it('shows product count when enabled', () => {
    const grades = [
      { id: '1', name: 'Grade 1', slug: 'grade-1', productCount: 25 },
    ]

    render(<GradeSelector grades={grades} showProductCount />)

    // May render multiple times
    const itemsTexts = screen.getAllByText('25 items')
    expect(itemsTexts.length).toBeGreaterThanOrEqual(1)
  })
})

describe('GradeSelectorCompact', () => {
  it('renders grade filter buttons', () => {
    render(<GradeSelectorCompact />)

    // Check that all grades are rendered as buttons
    expect(screen.getByTestId('grade-filter-r')).toBeInTheDocument()
    expect(screen.getByTestId('grade-filter-12')).toBeInTheDocument()
  })

  it('shows abbreviated grade names', () => {
    render(<GradeSelectorCompact />)

    // Grade 1 should show as "Gr 1"
    expect(screen.getByText('Gr 1')).toBeInTheDocument()
  })

  it('highlights selected grade', () => {
    render(<GradeSelectorCompact selectedGrade="grade-3" />)

    const grade3Button = screen.getByTestId('grade-filter-3')
    // Selected grades use gradient background instead of bg-primary
    expect(grade3Button).toHaveClass('bg-gradient-to-r')
  })
})
