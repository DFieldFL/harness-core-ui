/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { TerraformConfigStepOne, TerraformConfigStepTwo } from '../Editview/TerraformConfigForm'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ data: {} }))
}))

const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
const renderStepOneComponent = (data: any): void => {
  render(
    <TestWrapper>
      <TerraformConfigStepOne
        data={data}
        isReadonly={false}
        isEditMode={false}
        allowableTypes={allowableTypes}
        setConnectorView={jest.fn()}
        setSelectedConnector={jest.fn()}
        selectedConnector={'Git'}
      />
    </TestWrapper>
  )
}

const testData = {
  spec: {
    configuration: {
      configFiles: {
        store: {
          type: 'Git',
          spec: {
            skipResourceVersioning: false,
            store: {
              type: 'Git',
              spec: {
                connectorRef: 'Git',
                gitFetchType: 'Branch',
                branch: 'master',
                repoName: 'repoName',
                commidId: undefined
              }
            }
          }
        }
      }
    }
  }
}

describe('TerraformConfigForm StepOne tests', () => {
  test(`renders without crashing with no initial data`, async () => {
    renderStepOneComponent({})
    // all connector options displayed
    const gitConnector = await screen.findByTestId('varStore-Git')
    expect(gitConnector).toBeInTheDocument()

    const gitlabConnector = await screen.findByTestId('varStore-GitLab')
    expect(gitlabConnector).toBeInTheDocument()

    const githubbConnector = await screen.findByTestId('varStore-Github')
    expect(githubbConnector).toBeInTheDocument()

    const bitBucketConnector = await screen.findByTestId('varStore-Bitbucket')
    expect(bitBucketConnector).toBeInTheDocument()
  })

  test(`new connector view works correctly`, async () => {
    renderStepOneComponent({})
    const gitConnector = await screen.findByTestId('varStore-Git')
    fireEvent.click(gitConnector)

    const newConnectorLabel = await screen.findByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeInTheDocument()
    fireEvent.click(newConnectorLabel)

    const nextStepButton = await screen.findByText('continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)

    expect(screen).toMatchSnapshot()
  })

  test(`new connector view works correctly with previously selected connector`, () => {
    renderStepOneComponent(testData)

    expect(screen).toMatchSnapshot()
  })
})

const renderStepTwoComponent = (data?: any): void => {
  render(
    <TestWrapper>
      <TerraformConfigStepTwo
        isTerraformPlan
        prevStepData={data}
        isReadonly={false}
        allowableTypes={allowableTypes}
        onSubmitCallBack={jest.fn()}
      />
    </TestWrapper>
  )
}

describe('TerraformConfigForm StepTwo tests', () => {
  test(`renders without crashing with no initial data`, async () => {
    renderStepTwoComponent()
    // all inputs are displayed
    const fetchType = await screen.findByPlaceholderText('- pipeline.manifestType.gitFetchTypeLabel -')
    expect(fetchType).toBeInTheDocument()

    const folderPath = await screen.findByPlaceholderText('pipeline.manifestType.pathPlaceholder')
    expect(folderPath).toBeInTheDocument()
  })

  test(`loads data in edit mode`, async () => {
    const prevStepData = {
      spec: {
        configuration: {
          configFiles: {
            store: {
              spec: {
                repoName: 'git name',
                gitFetchType: 'pipelineSteps.commitIdValue',
                commitId: 'test-commit',
                folderPath: 'test-folder',
                connectorRef: {
                  connector: {
                    spec: {
                      connectionType: 'Account'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const testRepoName = await screen.getByDisplayValue('git name')
    expect(testRepoName).toBeInTheDocument()

    const testFetchType = await screen.getByDisplayValue('gitFetchTypes.fromCommit')
    expect(testFetchType).toBeInTheDocument()

    const testCommitId = await screen.getByDisplayValue('test-commit')
    expect(testCommitId).toBeInTheDocument()

    const testFolderPath = await screen.getByDisplayValue('test-folder')
    expect(testFolderPath).toBeInTheDocument()
  })
})
