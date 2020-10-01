import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import ConnectorStats from '../ConnectorStats'

jest.mock('moment', () => {
  return {
    unix: () => {
      return {
        format: () => 'dummy date'
      }
    },
    fn: {}
  }
})
describe('Connectors Stats', () => {
  test('render when only created', async () => {
    const { container } = render(
      <ConnectorStats
        status="SUCCESS"
        createdAt={1601199008081}
        lastTested={1601199008081}
        lastConnected={1601199008081}
      />
    )
    await waitFor(() => queryByText(container, 'Connector created'))
    expect(container).toMatchSnapshot()
  })

  test('render when also updated', async () => {
    const { container } = render(
      <ConnectorStats
        status="SUCCESS"
        createdAt={1601199008081}
        lastTested={1601199008081}
        lastConnected={1601199008081}
        lastUpdated={1601199008190}
      />
    )
    await waitFor(() => queryByText(container, 'Last updated'))
    expect(container).toMatchSnapshot()
  })
  test('render when status is failure', async () => {
    const { container } = render(
      <ConnectorStats
        status="FAILURE"
        createdAt={1601199008081}
        lastTested={1601199008081}
        lastConnected={1601199008081}
        lastUpdated={1601199008190}
      />
    )
    await waitFor(() => queryByText(container, 'Last updated'))
    expect(container).toMatchSnapshot()
  })
})
