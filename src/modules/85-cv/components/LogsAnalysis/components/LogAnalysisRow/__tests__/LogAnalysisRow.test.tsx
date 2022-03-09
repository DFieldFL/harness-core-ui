/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { LogAnalysisRow } from '../LogAnalysisRow'
import { mockedLogAnalysisData } from './LogAnalysisRow.mocks'
import type { LogAnalysisRowData, LogAnalysisRowProps } from '../LogAnalysisRow.types'
import * as utils from '../LogAnalysisRow.utils'

const WrapperComponent = (props: LogAnalysisRowProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisRow {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for LogAnalysisRow', () => {
  const initialProps = {
    data: mockedLogAnalysisData.resource.content as LogAnalysisRowData[]
  }

  test('Verify if Logs Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...initialProps} />)
    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })

  test('Verify if clicking on the row opens the slider with complete details', async () => {
    const { getByText, queryByText } = render(<WrapperComponent {...initialProps} />)
    const firstRow = screen.getAllByTestId('logs-data-row')[0]
    expect(queryByText('back')).toBeNull()
    await waitFor(() => {
      fireEvent.click(firstRow.childNodes[0].childNodes[0])
    })
    expect(getByText('back')).toBeDefined()
    expect(getByText('pipeline.verification.logs.clusterType')).toBeDefined()
    expect(getByText('pipeline.verification.logs.risk')).toBeDefined()
    expect(getByText('pipeline.verification.logs.sampleMessage')).toBeDefined()
    expect(getByText('pipeline.verification.logs.messageCount')).toBeDefined()
    expect(getByText('pipeline.verification.logs.messageFrequency')).toBeDefined()
  })

  test('Verify if clicking on an error row that it calls onClickErrorTrackingRow', async () => {
    const clickErrorTrackingSpy = jest.spyOn(utils, 'onClickErrorTrackingRow').mockReturnValue()

    const { queryByText } = render(<WrapperComponent isErrorTracking={true} {...initialProps} />)
    const firstRowError = screen.getAllByTestId('logs-data-row')[0]
    await waitFor(() => {
      fireEvent.click(firstRowError.childNodes[0].childNodes[0])
    })
    expect(queryByText('back')).toBeNull()
    expect(clickErrorTrackingSpy).toHaveBeenCalled()
  })
})
