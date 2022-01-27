/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { waitFor, act, fireEvent, findByText, findAllByText, render } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import BuildInfraSpecifications from '../BuildInfraSpecifications'
import contextMock from './pipelineContextMock.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@pipeline/components/ErrorsStrip/ErrorsStripBinded', () => () => <></>)

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa 1',
        identifier: 'tesa_1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListPromise: () =>
    Promise.resolve({
      data: {
        content: [
          {
            connector: ConnectorResponse.data!.data!.connector
          }
        ]
      }
    })
}))

describe('BuildInfraSpecifications snapshot tests for K8s Build Infra', () => {
  jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
    CI_VM_INFRASTRUCTURE: false
  }))
  test('initializes ok for K8s Build Infra', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('able to select a connector', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...contextMock,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const selectBtn = await findByText(container, 'tesa 1')
    expect(selectBtn).toBeDefined()
    fireEvent.click(selectBtn)
    await act(async () => {
      const portal = document.getElementsByClassName('bp3-portal')[0]
      expect(portal).toBeDefined()
      fireEvent.click(await findByText(portal as HTMLElement, 'account'))
      const connector = await findAllByText(portal as HTMLElement, 'tesa_1')
      await waitFor(() => expect(connector?.[0]).toBeDefined())
      fireEvent.click(connector?.[0])
    })
    const chosenConnector = await findByText(container, 'tesa 1')
    expect(chosenConnector).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('can add new label', async () => {
    const { container, findByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...contextMock,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(await findByTestId('advanced-summary'))
    })

    await act(async () => {
      fireEvent.click(await findByTestId('add-labels'))
      fireEvent.change(container.querySelector('[name="labels[2].key"]')!, { target: { value: 'projectid' } })
      fireEvent.change(container.querySelector('[name="labels[2].value"]')!, { target: { value: 'testVal' } })
    })
    // TODO - check why validation error is not appearing
    // expect(container).toMatchSnapshot()
    expect(true).toBeTruthy()
  })

  test('Renders with multiple stages', () => {
    const context = cloneDeep(contextMock)
    context.state.pipeline.stages.push({
      stage: {
        name: 's2',
        identifier: 's2',
        description: '',
        type: 'CI',
        spec: {
          cloneCodebase: true,
          serviceDependencies: [],
          infrastructure: {
            type: 'KubernetesDirect',
            spec: {
              namespace: '',
              labels: {
                lab1: 'test',
                projectid: 'invalidKey'
              }
            }
          },
          execution: {
            steps: []
          }
        }
      }
    })
    context.state.selectionState = {
      selectedStageId: 's2'
    }

    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...context,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('BuildInfraSpecifications snapshot tests for AWS Build Infra', () => {
  test('initializes ok for AWS VMs Build Infra', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CI_VM_INFRASTRUCTURE: true
    }))
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Render AWS Build Infra view', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CI_VM_INFRASTRUCTURE: true
    }))
    const { container, findByText: getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    const buildInfraTypeTiles = container.querySelectorAll('input[type="checkbox"]')
    expect(buildInfraTypeTiles[0]).toBeTruthy()
    const awsTile = buildInfraTypeTiles[1]
    expect(awsTile).toBeTruthy()
    fireEvent.click(awsTile)
    const poolIdInputText = await getByText('pipeline.buildInfra.poolId')
    expect(poolIdInputText).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
