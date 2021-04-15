import React from 'react'
import { render } from '@testing-library/react'

import { Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { Scope } from '@common/interfaces/SecretsInterface'
import TerraformInputStep from '../TerraformInputStep'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

const initialValues = {
  delegateSelectors: [],
  spec: {
    provisionerIdentifier: 'test',
    configuration: {
      type: 'Inherit from plan',
      spec: {
        workspace: 'test',
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: 'Branch',
              branch: 'test',
              folderPath: 'folder',
              connectorRef: {
                label: 'test',
                scope: Scope.ACCOUNT,
                value: 'test'
              }
            }
          }
        }
      }
    },
    timeout: '10m',
    targets: ['target-1', 'target-2']
  }
}

const template = {
  delegateSelectors: [],
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      type: 'Inherit from plan',
      spec: {
        workspace: RUNTIME_INPUT_VALUE,
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              folderPath: RUNTIME_INPUT_VALUE,
              connectorRef: {
                label: 'test',
                scope: Scope.ACCOUNT,
                value: 'test'
              }
            }
          }
        }
      }
    },
    timeout: RUNTIME_INPUT_VALUE,
    targets: RUNTIME_INPUT_VALUE
  }
}

describe('Test terraform input set', () => {
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => undefined}>
          <FormikForm>
            <TerraformInputStep
              initialValues={initialValues}
              stepType={StepType.TerraformDestroy}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
