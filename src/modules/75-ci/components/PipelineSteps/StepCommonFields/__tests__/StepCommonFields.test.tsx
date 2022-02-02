/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType } from '@wings-software/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import StepCommonFields from '../StepCommonFields'

interface TestProps {
  initialValues?: any
}

const TestComponent = ({ initialValues }: TestProps): React.ReactElement => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={initialValues} onSubmit={() => {}} formName="stepCommonFieldsForm">
      <FormikForm>
        <StepCommonFields
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
          buildInfrastructureType={'KubernetesDirect'}
        />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

describe('<StepCommonFields /> tests', () => {
  test('Should render properly with no data', () => {
    const { container } = render(<TestComponent />)
    expect(container).toMatchSnapshot()
  })
  test('Should render properly with passed initial values', () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          spec: {
            limitMemory: '128Mi',
            limitCPU: '0.1',
            timeout: '120s'
          }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
