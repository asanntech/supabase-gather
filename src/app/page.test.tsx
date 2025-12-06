import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from './page'

test('Page renders correctly', () => {
  render(<Page />)
  expect(screen.getByText('To get started, edit the page.tsx file.')).toBeInTheDocument()
})