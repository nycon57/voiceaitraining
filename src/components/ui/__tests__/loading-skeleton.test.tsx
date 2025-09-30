/**
 * Loading Skeleton Components - Basic Tests
 *
 * These tests verify that skeleton components render without errors
 * and accept their expected props.
 */

import { describe, it, expect } from '@jest/globals'
import { render } from '@testing-library/react'
import {
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonList,
  SkeletonText,
  SkeletonForm,
  SkeletonDashboard
} from '../loading-skeleton'

describe('Loading Skeleton Components', () => {
  describe('SkeletonCard', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonCard />)
      expect(container).toBeTruthy()
    })

    it('renders with icon when hasIcon is true', () => {
      const { container } = render(<SkeletonCard hasIcon />)
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(2)
    })

    it('renders correct number of lines', () => {
      const { container } = render(<SkeletonCard lines={3} />)
      expect(container).toBeTruthy()
    })

    it('accepts variant prop', () => {
      const { container } = render(<SkeletonCard variant="shimmer" />)
      expect(container).toBeTruthy()
    })
  })

  describe('SkeletonTable', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonTable />)
      expect(container.querySelector('table')).toBeTruthy()
    })

    it('renders correct number of rows', () => {
      const { container } = render(<SkeletonTable rows={3} columns={2} />)
      const rows = container.querySelectorAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('renders correct number of columns', () => {
      const { container } = render(<SkeletonTable rows={1} columns={4} />)
      const headerCells = container.querySelectorAll('thead th')
      expect(headerCells.length).toBe(4)
    })
  })

  describe('SkeletonChart', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonChart />)
      expect(container).toBeTruthy()
    })

    it('accepts type prop', () => {
      const { container: line } = render(<SkeletonChart type="line" />)
      const { container: bar } = render(<SkeletonChart type="bar" />)
      const { container: area } = render(<SkeletonChart type="area" />)

      expect(line).toBeTruthy()
      expect(bar).toBeTruthy()
      expect(area).toBeTruthy()
    })

    it('applies custom height class', () => {
      const { container } = render(<SkeletonChart height="h-[500px]" />)
      const element = container.querySelector('.h-\\[500px\\]')
      expect(element).toBeTruthy()
    })
  })

  describe('SkeletonList', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonList />)
      expect(container).toBeTruthy()
    })

    it('renders correct number of items', () => {
      const { container } = render(<SkeletonList items={5} />)
      const items = container.querySelectorAll('.space-y-3 > div')
      expect(items.length).toBe(5)
    })

    it('renders avatars when hasAvatar is true', () => {
      const { container } = render(<SkeletonList items={2} hasAvatar />)
      const avatars = container.querySelectorAll('.rounded-full')
      expect(avatars.length).toBeGreaterThan(0)
    })
  })

  describe('SkeletonText', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonText />)
      expect(container).toBeTruthy()
    })

    it('renders correct number of lines', () => {
      const { container } = render(<SkeletonText lines={4} />)
      const lines = container.querySelectorAll('.space-y-2 > div')
      expect(lines.length).toBe(4)
    })

    it('accepts width variants', () => {
      const widths = ['full', 'varied', 'short', 'medium', 'long'] as const
      widths.forEach(width => {
        const { container } = render(<SkeletonText width={width} />)
        expect(container).toBeTruthy()
      })
    })
  })

  describe('SkeletonForm', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonForm />)
      expect(container).toBeTruthy()
    })

    it('renders correct number of fields', () => {
      const { container } = render(<SkeletonForm fields={3} />)
      const fields = container.querySelectorAll('.space-y-4 > div:not(.pt-4)')
      expect(fields.length).toBe(3)
    })

    it('renders button when hasButton is true', () => {
      const { container } = render(<SkeletonForm hasButton />)
      expect(container.querySelector('.pt-4')).toBeTruthy()
    })

    it('does not render button when hasButton is false', () => {
      const { container } = render(<SkeletonForm hasButton={false} />)
      expect(container.querySelector('.pt-4')).toBeFalsy()
    })
  })

  describe('SkeletonDashboard', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonDashboard />)
      expect(container).toBeTruthy()
    })

    it('renders stat cards grid', () => {
      const { container } = render(<SkeletonDashboard />)
      const grid = container.querySelector('.lg\\:grid-cols-4')
      expect(grid).toBeTruthy()
    })

    it('renders main content area', () => {
      const { container } = render(<SkeletonDashboard />)
      const mainGrid = container.querySelector('.lg\\:grid-cols-12')
      expect(mainGrid).toBeTruthy()
    })
  })

  describe('Animation Variants', () => {
    const variants = ['default', 'shimmer', 'wave'] as const

    variants.forEach(variant => {
      it(`SkeletonCard accepts ${variant} variant`, () => {
        const { container } = render(<SkeletonCard variant={variant} />)
        expect(container).toBeTruthy()
      })

      it(`SkeletonTable accepts ${variant} variant`, () => {
        const { container } = render(<SkeletonTable variant={variant} />)
        expect(container).toBeTruthy()
      })

      it(`SkeletonChart accepts ${variant} variant`, () => {
        const { container } = render(<SkeletonChart variant={variant} />)
        expect(container).toBeTruthy()
      })
    })
  })

  describe('Custom ClassName', () => {
    it('SkeletonCard accepts custom className', () => {
      const { container } = render(<SkeletonCard className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeTruthy()
    })

    it('SkeletonTable accepts custom className', () => {
      const { container } = render(<SkeletonTable className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeTruthy()
    })

    it('SkeletonDashboard accepts custom className', () => {
      const { container } = render(<SkeletonDashboard className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeTruthy()
    })
  })
})