import React from 'react'
import { Formik, getMultiTypeFromValue, Layout, MultiTypeInputType, Button, StepProps } from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/exports'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import i18n from '../ArtifactsSelection.i18n'
import css from './DockerArtifact.module.scss'

interface ExampleStepProps {
  handleViewChange: () => void
  name?: string
  stepName: string
  newConnectorLabel: string
  initialValues: any
  connectorType: ConnectorInfoDTO['type']
}
const primarySchema = Yup.object().shape({
  connectorId: Yup.string().trim().required(i18n.validation.connectorId)
})

export const ExampleStep: React.FC<StepProps<any> & ExampleStepProps> = props => {
  const {
    handleViewChange,
    previousStep,
    nextStep,
    initialValues,
    stepName,
    name,
    connectorType,
    newConnectorLabel
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { getString } = useStrings()

  const submitFirstStep = async (formData: any): Promise<void> => {
    nextStep?.({ ...formData })
  }
  const { expressions } = useVariablesExpression()
  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep} data-id={name}>
      <div className={css.heading}>{stepName}</div>
      <Formik
        initialValues={initialValues}
        validationSchema={primarySchema}
        onSubmit={formData => {
          submitFirstStep(formData)
        }}
      >
        {formik => (
          <Form>
            <div className={css.connectorForm}>
              <div className={css.connectorContainer}>
                <FormMultiTypeConnectorField
                  name="connectorId"
                  label={getString('connectors.selectConnectorLabel')}
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={410}
                  multiTypeProps={{ expressions }}
                  isNewConnectorLabelVisible={false}
                  type={connectorType}
                  enableConfigureOptions={false}
                  selected={formik?.values?.connectorId}
                />
                {getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME ? (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={(formik.values.connectorId as unknown) as string}
                      type={connectorType}
                      variableName="dockerConnector"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('imagePath', value)
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    intent="primary"
                    minimal
                    text={newConnectorLabel}
                    icon="plus"
                    onClick={() => {
                      handleViewChange()
                      nextStep?.()
                    }}
                    className={css.addNewArtifact}
                  />
                )}
              </div>
            </div>
            <Layout.Horizontal spacing="xxlarge">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(props?.prevStepData)}
              />

              <Button intent="primary" type="submit" text={getString('continue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
