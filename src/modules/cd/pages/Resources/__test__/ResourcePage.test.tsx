import React from 'react'

import { render, queryByText } from '@testing-library/react'
import i18n from '../ResourcesPage.i18n'
import ResourcesPage from '../ResourcesPage'

jest.spyOn(Date, 'now').mockImplementation(() => 1588885751000)

describe('ResourcesPage Snapshot', () => {
  test('should render ResourcesPage', () => {
    const { container } = render(<ResourcesPage />)
    expect(queryByText(container, i18n.title)).toBeDefined()
    expect(queryByText(container, i18n.newConnectorButton)).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
