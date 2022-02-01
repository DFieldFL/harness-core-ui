/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { TestWrapper, UseGetReturnData } from '@common/utils/testUtils'
import { getDummyPipelineContextValue } from '@ci/components/PipelineStudio/BuildStageSpecifications/__test__/BuildStageSpecificationsTestHelpers'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { EditStageView } from '../EditStageView'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse | any> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'test1',
        identifier: 'test1'
      }
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getStepData = () => {
  return {
    stage: {
      identifier: 'id1',
      name: 'name1',
      description: 'desc1',
      spec: {
        cloneCodebase: false
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderComponent = (stepData?: any, onSubmit?: () => void) => {
  const pipelineContextMockValue = getDummyPipelineContextValue()
  return render(
    <TestWrapper
      path="/dummy"
      pathParams={{
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        accountId: 'dummy'
      }}
    >
      <PipelineContext.Provider value={pipelineContextMockValue}>
        <EditStageView data={stepData} onSubmit={onSubmit} />
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

describe('EditStageView snapshot test', () => {
  test('should render properly', async () => {
    const { container } = renderComponent(getStepData())
    expect(container).toMatchSnapshot()
  })
  test('should render properly without data', async () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })
})

describe('EditStageView save', () => {
  test('should call save when data are valid', async () => {
    const submitFn = jest.fn()
    const { getByText } = renderComponent(getStepData(), submitFn)

    await act(async () => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })

    expect(submitFn).toBeCalled()
  })
  test('should not call save when data are not valid', async () => {
    const submitFn = jest.fn()
    const { getByText } = renderComponent(undefined, submitFn)

    await act(async () => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })

    expect(submitFn).not.toBeCalled()
  })
})
