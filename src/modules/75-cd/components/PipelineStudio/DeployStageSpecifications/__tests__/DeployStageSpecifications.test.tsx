/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render } from '@testing-library/react'

import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface,
  PipelineContextType
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DrawerTypes, TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomVariables } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariables'
import { Scope } from '@common/interfaces/SecretsInterface'
import DeployStageSpecifications from '../DeployStageSpecifications'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

factory.registerStep(new CustomVariables())

const getPipelineContext = (): PipelineContextInterface => ({
  state: {
    pipeline: { name: '', identifier: '' },
    originalPipeline: { name: '', identifier: '' },
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      isYamlEditable: false,
      drawerData: { type: DrawerTypes.AddStep },
      splitViewData: {}
    },
    templateView: {
      isTemplateDrawerOpened: false,
      templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
    },
    schemaErrors: false,
    selectionState: {},
    pipelineIdentifier: '',
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isInitialized: true,
    isLoading: false,
    gitDetails: {},
    entityValidityDetails: {},
    isUpdated: true,
    templateTypes: {}
  },
  contextType: PipelineContextType.Pipeline,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  setSchemaErrorView: jest.fn(),
  stagesMap: {},
  updateGitDetails: jest.fn(),
  updateEntityValidityDetails: jest.fn(),
  isReadonly: false,
  renderPipelineStage: jest.fn(),
  fetchPipeline: jest.fn(),
  setYamlHandler: jest.fn(),
  updatePipeline: jest.fn(),
  updatePipelineView: jest.fn(),
  updateTemplateView: jest.fn(),
  updateStage: jest.fn(),
  getStageFromPipeline: jest.fn(() => ({ stage: undefined, parent: undefined })),
  deletePipelineCache: jest.fn(),
  runPipeline: jest.fn(),
  pipelineSaved: jest.fn(),
  view: 'ui',
  scope: Scope.PROJECT,
  setView: jest.fn(),
  stepsFactory: factory,
  setSelectedStageId: jest.fn(),
  setSelectedSectionId: jest.fn(),
  setSelectedStepId: jest.fn(),
  setSelection: jest.fn(),
  getStagePathFromPipeline: jest.fn(),
  setTemplateTypes: jest.fn()
})
describe('StepWidget tests', () => {
  test(`renders DeployStageSpecifications without crashing `, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getPipelineContext()}>
          <DeployStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`Updates DeployStageSpecifications form `, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getPipelineContext()}>
          <DeployStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    act(() => {
      const stageNameInput = container.querySelector('input[name="name"]')
      expect(stageNameInput).toBeDefined()
      fireEvent.change(stageNameInput!, { target: { value: 'Deploy' } })
      expect(container).toMatchSnapshot('Updated Form')
    })

    await act(async () => {
      const addVariableButton = await findByText(document.body, 'Add Variable')
      expect(addVariableButton).toBeDefined()
      fireEvent.click(addVariableButton)
      const variableNameInput = document.querySelector('input[placeholder="Variable Name"]')
      expect(variableNameInput).toBeDefined()
      fireEvent.change(variableNameInput!, { target: { value: 'Variable' } })
      const submitdVariableButton = await findByText(document.body, 'Save')
      expect(submitdVariableButton).toBeDefined()
      expect(document.getElementsByClassName('bp3-portal')[0]).toMatchSnapshot('Add Variable Form')
    })
    const variableTitle = await findByText(container, 'Variable')
    expect(variableTitle).toBeDefined()
    expect(document.getElementsByClassName('bp3-portal')[0]).toMatchSnapshot('Variables List')
  })
})
