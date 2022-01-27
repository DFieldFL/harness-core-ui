/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
jest.mock('copy-to-clipboard')
import { StringsContext } from 'framework/strings'
import BuildCommits from '../BuildCommits'
import BuildMock from './mock/build.json'

jest.mock('@pipeline/utils/CIUtils', () => ({
  getTimeAgo: () => '1 day ago',
  getShortCommitId: () => 'abc'
}))

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => ({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: BuildMock
    }
  })
}))

describe('BuildCommits snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <StringsContext.Provider value={{ data: {} as any, getString: (key: string) => key as string }}>
        <BuildCommits />
      </StringsContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
})
