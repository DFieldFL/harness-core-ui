import React from 'react'
import { Formik } from '@wings-software/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SelectHealthSourceServices from '../SelectHealthSourceServices'
import { labelNamesResponse, metricPackResponse } from './SelectHealthSourceServices.mock'

describe('Validate SelectHealthSourceServices', () => {
  test('should render RiskProfile when continuousVerification and healthScore are false', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik
          initialValues={{ continuousVerification: true, healthScore: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <SelectHealthSourceServices
            formik={
              {
                values: { continuousVerification: true, healthScore: true }
              } as any
            }
            labelNamesResponse={labelNamesResponse as any}
            metricPackResponse={metricPackResponse as any}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="sli"')).not.toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).toBeChecked()
    expect(getByText('cv.monitoringSources.riskCategoryLabel')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
  test('should not render RiskProfile when continuousVerification and healthScore are false', () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          initialValues={{ continuousVerification: false, healthScore: false, sli: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <SelectHealthSourceServices
            formik={
              {
                values: { continuousVerification: false, healthScore: false, sli: true }
              } as any
            }
            labelNamesResponse={labelNamesResponse as any}
            metricPackResponse={metricPackResponse as any}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="sli"')).toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).not.toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).not.toBeChecked()
    expect(container.querySelector('label[for="riskCategory"]')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
