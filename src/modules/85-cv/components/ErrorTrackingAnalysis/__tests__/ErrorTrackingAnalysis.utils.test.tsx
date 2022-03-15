/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import { getClusterTypes, getErrorTrackingAnalysisTableData } from '../ErrorTrackingAnalysis.utils'
import { ErrorTrackingEvents } from '../ErrorTrackingAnalysis.types'
import {
  mockedLogsData,
  mockedLogsTableData,
  mockedLogsData2,
  mockedLogsTableData2
} from './ErrorTrackingAnalysis.mocks'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Unit tests for LogAnalysis utils', () => {
  test('Verify if getClusterTypes gives correct results', async () => {
    expect(getClusterTypes(getString)).toEqual([
      { label: 'pipeline.verification.logs.allEvents', value: '' },
      { label: 'pipeline.verification.logs.knownEvent', value: ErrorTrackingEvents.KNOWN },
      { label: 'pipeline.verification.logs.unknownEvent', value: ErrorTrackingEvents.UNKNOWN },
      { label: 'pipeline.verification.logs.unexpectedFrequency', value: ErrorTrackingEvents.UNEXPECTED }
    ])
  })

  test('Verify if getErrorTrackingAnalysisTableData method gives the correct logs analysis Table data', async () => {
    expect(getErrorTrackingAnalysisTableData(mockedLogsData)).toEqual(mockedLogsTableData)
  })

  test('Verify if getErroTrackingAnalysisTableData method gives the correct logs analysis Table data2', async () => {
    expect(getErrorTrackingAnalysisTableData(mockedLogsData2)).toEqual(mockedLogsTableData2)
  })
})
