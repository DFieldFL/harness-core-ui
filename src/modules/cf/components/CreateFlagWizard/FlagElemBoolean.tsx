import React, { useState, Dispatch, SetStateAction } from 'react'
import {
  Color,
  Formik,
  FormikForm as Form,
  FormInput,
  StepProps,
  Text,
  Layout,
  SelectOption,
  Container,
  Button,
  ModalErrorHandler
} from '@wings-software/uicore'
import type { FeatureFlagRequestRequestBody } from 'services/cf'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import InputDescOptional from './common/InputDescOptional'
import i18n from './FlagWizard.i18n'
import css from './FlagElemVariations.module.scss'

interface FlagElemVariationsProps {
  toggleFlagType: (newFlag: string) => void
  flagTypeOptions: SelectOption[]
  onWizardStepSubmit: (data: FeatureFlagRequestRequestBody) => void
  projectIdentifier?: string | number | null | undefined
  // FIXME: Check for the right type
  setModalErrorHandler: Dispatch<SetStateAction<any>>
  isLoadingCreateFeatureFlag: boolean
}

// TODO: WIP
// interface FlagElemTypeVariation {
//   identifier: string
//   name: string
//   description: string
//   value: string | number | boolean | object
// }

// interface FlagElemTypeVariationError {
//   variations: string
// }

interface FeatureErrors {
  defaultOnVariation?: 'Required'
  defaultOffVariation?: 'Required'
}

// FIXME: Change any for StepProps
const FlagElemBoolean: React.FC<StepProps<any> & FlagElemVariationsProps> = props => {
  const {
    toggleFlagType,
    flagTypeOptions,
    prevStepData,
    previousStep,
    nextStep,
    onWizardStepSubmit,
    projectIdentifier,
    setModalErrorHandler,
    isLoadingCreateFeatureFlag
  } = props

  // TODO: Consider the possibility to put everthing related to Boolean flag
  // change state and prepopulate fields to be in a separate component,
  // because we have similar functionality also in Edit Variations modal
  const [trueFlagOption, setTrueFlagOption] = useState('true')
  const [falseFlagOption, setFalseFlagOption] = useState('false')

  const handleNewFlagType = (newFlagTypeVal: string): void => {
    toggleFlagType(newFlagTypeVal)
  }

  const onTrueFlagChange = (valInput: string): void => {
    setTrueFlagOption(valInput)
  }

  const onFalseFlagChange = (valInput: string): void => {
    setFalseFlagOption(valInput)
  }

  const flagBooleanRules = [
    { label: trueFlagOption, value: trueFlagOption },
    { label: falseFlagOption, value: falseFlagOption }
  ]

  const onClickBack = (): void => {
    previousStep?.({ ...prevStepData })
  }

  // TODO: WIP; possible solution is to use yup.addMethod
  const validateForm = (values: any): any => {
    const errors: FeatureErrors = {}

    if (values.defaultOnVariation.length === 0) {
      errors.defaultOnVariation = 'Required'
    }
    if (values.defaultOffVariation.length === 0) {
      errors.defaultOffVariation = 'Required'
    }

    return errors
  }

  return (
    <>
      <Formik
        initialValues={{
          kind: FlagTypeVariations.booleanFlag,
          variations: [
            { identifier: 'true', name: 'true', description: '', value: 'true' },
            { identifier: 'false', name: 'false', description: '', value: 'false' }
          ],
          defaultOnVariation: '',
          defaultOffVariation: '',
          ...prevStepData
        }}
        // TODO: WIP
        validate={validateForm}
        onSubmit={vals => {
          const data: FeatureFlagRequestRequestBody = { ...prevStepData, ...vals, project: projectIdentifier }
          onWizardStepSubmit(data)
        }}
      >
        {() => (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'medium' }}>
              {i18n.varSettingsFlag.variationSettingsHeading.toUpperCase()}
            </Text>
            <Layout.Vertical>
              <FormInput.Select
                name="kind"
                label={i18n.varSettingsFlag.flagType}
                items={flagTypeOptions}
                onChange={newFlagType => handleNewFlagType(newFlagType.value as string)}
                className={css.inputSelectFlagType}
              />
              <Container margin={{ bottom: 'large' }}>
                <Layout.Horizontal>
                  <Container width="35%" margin={{ right: 'medium' }}>
                    <FormInput.Text
                      name="variations[0].name"
                      label={i18n.trueFlag}
                      onChange={e => {
                        const element = e.currentTarget as HTMLInputElement
                        const elementValue = element.value
                        onTrueFlagChange(elementValue)
                      }}
                    />
                  </Container>
                  <Container width="65%" className={css.collapseContainer}>
                    <InputDescOptional
                      text={i18n.descOptional}
                      inputName="variations[0].description"
                      inputPlaceholder={''}
                    />
                  </Container>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Container width="35%" margin={{ right: 'medium' }}>
                    <FormInput.Text
                      name="variations[1].name"
                      label={i18n.falseFlag}
                      onChange={e => {
                        const element = e.currentTarget as HTMLInputElement
                        const elementValue = element.value
                        onFalseFlagChange(elementValue)
                      }}
                    />
                  </Container>
                  <Container width="65%" className={css.collapseContainer}>
                    <InputDescOptional
                      text={i18n.descOptional}
                      inputName="variations[1].description"
                      inputPlaceholder={''}
                    />
                  </Container>
                </Layout.Horizontal>
                {/* TODO: WIP */}
                {/* {formikProps.errors.variations ? <Text intent="danger">{formikProps.errors.variations}</Text> : null} */}
              </Container>

              <Container margin={{ bottom: 'xlarge' }}>
                <Text color={Color.BLACK} inline>
                  {i18n.varSettingsFlag.defaultRules}
                </Text>

                <Layout.Vertical margin={{ top: 'medium' }}>
                  <Container>
                    <Layout.Horizontal>
                      <Text width="25%" className={css.serveTextAlign}>
                        {i18n.varSettingsFlag.flagOn}
                      </Text>
                      <FormInput.Select name="defaultOnVariation" items={flagBooleanRules} />
                    </Layout.Horizontal>
                  </Container>
                  <Container>
                    <Layout.Horizontal>
                      <Text width="25%" className={css.serveTextAlign}>
                        {i18n.varSettingsFlag.flagOff}
                      </Text>
                      <FormInput.Select name="defaultOffVariation" items={flagBooleanRules} />
                    </Layout.Horizontal>
                  </Container>
                </Layout.Vertical>
              </Container>

              {/* TODO: Pull this out into separate component, look into FlagElemMultivariate.tsx as well */}
              <Layout.Horizontal className={css.btnsGroup}>
                <Button text={i18n.back} onClick={onClickBack} margin={{ right: 'small' }} />
                <Button
                  type="submit"
                  text={i18n.varSettingsFlag.saveAndClose}
                  disabled={isLoadingCreateFeatureFlag}
                  loading={isLoadingCreateFeatureFlag}
                />
                <Button
                  type="button"
                  text={i18n.varSettingsFlag.testFlagOption.toUpperCase()}
                  rightIcon="chevron-right"
                  minimal
                  className={css.testFfBtn}
                  onClick={() => {
                    nextStep?.({ ...prevStepData })
                  }}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default FlagElemBoolean
