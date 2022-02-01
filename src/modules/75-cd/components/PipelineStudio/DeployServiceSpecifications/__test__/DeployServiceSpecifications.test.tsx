/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable jest/no-disabled-tests */
import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContextInterface,
  PipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import * as useValidationErrors from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import overridePipelineContext from './overrideSetPipeline.json'
import DeployServiceSpecifications from '../DeployServiceSpecifications'
import connectorListJSON from './connectorList.json'
import mockListSecrets from './mockListSecret.json'
import services, { servicesV2Mock } from './servicesMock'

const getOverrideContextValue = (): PipelineContextInterface => {
  return {
    ...overridePipelineContext,
    getStageFromPipeline: jest.fn().mockReturnValue({
      stage: {
        stage: {
          name: 'Stage 3',
          identifier: 's3',
          type: StageType.DEPLOY,
          description: '',
          spec: {}
        }
      }
    }),
    updateStage: jest.fn(),
    updatePipeline: jest.fn()
  } as any
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: () => Promise.resolve(connectorListJSON),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: connectorListJSON,
    mutate: jest.fn().mockImplementation(() => ({ loading: false, data: connectorListJSON })),
    refetch: jest.fn()
  })),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: servicesV2Mock, refetch: jest.fn() })),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockListSecrets)),
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  usePostSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetConnectorList: jest.fn(() => ({ data: null }))
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('Deploy service stage specifications', () => {
  test(`Propagate from option and dropdown to select previous stage and service should be present`, async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployServiceSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const propagateFromDropdownDiv = document.getElementsByClassName('stageSelectDropDown')[0]
    act(() => {
      fireEvent.click(propagateFromDropdownDiv)
    })
    const propagateFromDropdown = getByPlaceholderText('- pipeline.selectStagePlaceholder -')
    act(() => {
      userEvent.selectOptions(propagateFromDropdown, 'st1')
    })

    //  Service 1 Option
    const service1Option = getByText('Stage [Stage 1] - Service [Service 1]')
    expect(service1Option).toBeInTheDocument()
    act(() => {
      fireEvent.click(service1Option)
    })
    expect((propagateFromDropdown as HTMLInputElement).value).toBe('Stage [Stage 1] - Service [Service 1]')

    //  Other Service Option
    const service2Option = getByText('Stage [Stage 2] - Service [Other Service]')
    expect(service2Option).toBeInTheDocument()
    act(() => {
      fireEvent.click(service2Option)
    })
    expect((propagateFromDropdown as HTMLInputElement).value).toBe('Stage [Stage 2] - Service [Other Service]')
  })

  test(`Variables section is present`, async () => {
    const { queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployServiceSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('variablesText')).toBeTruthy())
  })

  test('Should Deployment Type section be present', async () => {
    const { findByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployServiceSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(await waitFor(() => findByText('deploymentTypeText'))).toBeInTheDocument()
  })

  test('Should call submitFormsForTab when errorMap is not empty', async () => {
    const errorContextProvider = {
      state: {} as any,
      checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
      subscribeForm: () => undefined,
      unSubscribeForm: () => undefined,
      submitFormsForTab: jest.fn()
    }

    jest.spyOn(useValidationErrors, 'useValidationErrors').mockReturnValue({ errorMap: new Map([['error', []]]) })

    render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <StageErrorContext.Provider value={errorContextProvider}>
            <DeployServiceSpecifications />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(errorContextProvider.submitFormsForTab).toBeCalled()
  })
})
