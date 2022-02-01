/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Icon,
  Layout,
  Text,
  Accordion
} from '@harness/uicore'
import * as yup from 'yup'
import { useStrings } from 'framework/strings'
import type { SLOErrorBudgetResetDTO } from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import ErrorBudgetResetHistory from '@cv/hooks/useErrorBudgetRestHook/views/ErrorBudgetResetHistory'
import {
  calculateErrorBudgetByIncrement,
  calculateRemainingErrorBudgetByIncrement
} from '../useErrorBudgetRestHook.utils'
import type { ErrorBudgetResetFormProps } from '../useErrorBudgetRestHook.types'

const ErrorBudgetResetForm: React.FC<ErrorBudgetResetFormProps> = ({ serviceLevelObjective, onSubmit, onCancel }) => {
  const { getString } = useStrings()

  return (
    <Container width={650}>
      <Text font={{ variation: FontVariation.BODY }} color={Color.BLACK}>
        {getString('cv.yourExistingErrorBudgetIs')}{' '}
        <Text tag="span" font={{ variation: FontVariation.BODY2 }}>
          {serviceLevelObjective.totalErrorBudget} {getString('cv.minutes')}
        </Text>
        , {getString('cv.andYouHave')}{' '}
        <Text
          tag="span"
          font={{ variation: FontVariation.BODY2 }}
          color={getRiskColorValue(serviceLevelObjective.errorBudgetRisk, false)}
        >
          {serviceLevelObjective.errorBudgetRemaining} {getString('cv.minutes')}
        </Text>{' '}
        {getString('cv.left')}.
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.BLACK}>
        {getString('cv.adjustTheErrorBudgetToContinueWithDeployments')}
      </Text>

      <Accordion>
        <Accordion.Panel
          id="error-budget-reset-history"
          summary={
            <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
              {getString('cv.previousErrorBudgetResetHistory')}
            </Text>
          }
          details={<ErrorBudgetResetHistory serviceLevelObjectiveIdentifier={serviceLevelObjective.sloIdentifier} />}
        />
      </Accordion>

      <Formik<SLOErrorBudgetResetDTO>
        formName="errorBudgetReset"
        initialValues={{}}
        validationSchema={yup.object().shape({
          errorBudgetIncrementPercentage: yup
            .number()
            .typeError(getString('cv.increaseErrorBudgetByIsRequired'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .max(100, getString('common.validation.valueMustBeLessThanOrEqualToN', { n: 100 }))
            .required(getString('cv.increaseErrorBudgetByIsRequired')),
          reason: yup.string().trim().required(getString('cv.reasonIsRequired'))
        })}
        onSubmit={values => {
          onSubmit({
            ...values,
            errorBudgetAtReset: serviceLevelObjective.totalErrorBudget,
            remainingErrorBudgetAtReset: serviceLevelObjective.errorBudgetRemaining
          })
        }}
      >
        {formik => (
          <FormikForm>
            <Layout.Horizontal>
              <Container width={300} padding={{ right: 'xxxlarge' }} border={{ right: true }}>
                <FormInput.Text
                  name="errorBudgetIncrementPercentage"
                  label={getString('cv.increaseErrorBudgetBy')}
                  inputGroup={{
                    type: 'number',
                    min: 1,
                    max: 100,
                    rightElement: <Icon name="percentage" padding="small" />
                  }}
                />
                <FormInput.TextArea name="reason" label={getString('reason')} />
              </Container>
              <Layout.Vertical spacing="xxxlarge">
                <div>
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('cv.updatedErrorBudget')}</Text>
                  <Heading inline level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
                    {calculateErrorBudgetByIncrement(
                      serviceLevelObjective.totalErrorBudget,
                      formik.values.errorBudgetIncrementPercentage
                    )}
                  </Heading>
                  <Text inline font={{ variation: FontVariation.FORM_HELP }}>
                    {' '}
                    {getString('cv.mins')}
                  </Text>
                </div>
                <div>
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('cv.remainingErrorBudget')}</Text>
                  <Heading inline level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
                    {calculateRemainingErrorBudgetByIncrement(
                      serviceLevelObjective.totalErrorBudget,
                      serviceLevelObjective.errorBudgetRemaining,
                      formik.values.errorBudgetIncrementPercentage
                    )}
                  </Heading>
                  <Text inline font={{ variation: FontVariation.FORM_HELP }}>
                    {' '}
                    {getString('cv.mins')}
                  </Text>
                </div>
              </Layout.Vertical>
            </Layout.Horizontal>

            <Layout.Horizontal spacing="small" margin={{ top: 'xxxlarge' }}>
              <Button type="submit" text={getString('save')} variation={ButtonVariation.PRIMARY} />
              <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default ErrorBudgetResetForm
