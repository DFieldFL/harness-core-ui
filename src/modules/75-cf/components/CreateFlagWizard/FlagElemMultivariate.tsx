import React, { useState, Dispatch, SetStateAction, useCallback } from 'react'
import * as yup from 'yup'
import { isEqual } from 'lodash-es'
import { Classes } from '@blueprintjs/core'
import {
  Color,
  Formik,
  FormikForm as Form,
  FormInput,
  StepProps,
  Text,
  Layout,
  Select,
  SelectOption,
  Button,
  Container,
  ModalErrorHandler,
  FlexExpander
} from '@wings-software/uicore'
import { FieldArray } from 'formik'
import { FormikEffect, FormikEffectProps } from '@common/components/FormikEffect/FormikEffect'
import type { FeatureFlagRequestRequestBody, Variation } from 'services/cf'
import { useStrings } from 'framework/exports'
import { FlagTypeVariationsSelect } from '../CreateFlagDialog/FlagDialogUtils'
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

interface FlagMultivariateSelectOptions {
  id: string
  label: string
  value: string
}

// FIXME: Change any for StepProps
const FlagElemMultivariate: React.FC<StepProps<any> & FlagElemVariationsProps> = props => {
  const {
    toggleFlagType,
    flagTypeOptions,
    prevStepData,
    previousStep,
    // nextStep,
    onWizardStepSubmit,
    projectIdentifier,
    setModalErrorHandler,
    isLoadingCreateFeatureFlag
  } = props
  const { getString } = useStrings()

  const flagVariationOptions = [
    { label: getString('string'), value: FlagTypeVariationsSelect.string },
    { label: getString('cf.creationModal.jsonType'), value: FlagTypeVariationsSelect.json },
    { label: getString('number'), value: FlagTypeVariationsSelect.number }
  ]
  const [flagMultiRules, setFlagMultiRules] = useState<FlagMultivariateSelectOptions[]>([
    { id: 'variation1', label: 'Variation 1', value: 'variation1' },
    { id: 'variation2', label: 'Variation 2', value: 'variation2' }
  ])

  const handleNewFlagType = (newFlagTypeVal: string): void => {
    toggleFlagType(newFlagTypeVal)
  }

  /**
   * Since we are dynamically creating new fields, on top of the two that already exists
   * i.e. see 'flagMultiRules' length,
   * we are tracking each individual field with Formik name 'variations.<number>.identifier'
   * and it's label it based on the length of an array from 'flagMultiRules',
   * we are putting dummy values because of weird key render bug
   */
  const addNewFlagMultiRules = (): void => {
    const len = flagMultiRules.length + 1
    const newFlagMultivariateOption = {
      id: `variation${len}`,
      label: `Variation ${len}`,
      value: `variation${len}`
    }
    setFlagMultiRules(prevState => [...prevState, newFlagMultivariateOption])
  }

  const onClickBack = (): void => {
    previousStep?.({ ...prevStepData })
  }

  const kindToSelectValue = useCallback(kind => {
    switch (kind) {
      case FlagTypeVariationsSelect.number:
        return flagVariationOptions[2]
      case FlagTypeVariationsSelect.json:
        return flagVariationOptions[1]
      default:
        return flagVariationOptions[0]
    }
  }, [])

  const onFormikEffect: FormikEffectProps['onChange'] = ({ prevValues, nextValues }) => {
    const { variations } = nextValues

    if (!isEqual(variations, prevValues.variations)) {
      const selectItems = variations
        .filter(
          ({ identifier, name, value }: Variation) =>
            !!(identifier || '').trim() && !!(name || '').trim() && !!(value || '').trim()
        )
        .map(({ identifier, name }: Variation) => ({ id: identifier, label: name, value: identifier }))

      setFlagMultiRules(selectItems)
    }
  }

  return (
    <Formik
      initialValues={{
        kind: FlagTypeVariationsSelect.string,
        variations: [
          { identifier: '', name: '', value: '' },
          { identifier: '', name: '', value: '' }
        ],
        defaultOnVariation: '',
        defaultOffVariation: '',
        ...prevStepData
      }}
      validationSchema={yup.object().shape({
        variations: yup.array().of(
          yup.object().shape({
            name: yup.string().trim().required(getString('cf.creationModal.nameIsRequired')),
            value: yup.string().trim().required(getString('cf.creationModal.valueIsRequired')),
            identifier: yup.string().trim().required(getString('cf.creationModal.idIsRequired'))
          })
        ),
        defaultOnVariation: yup.string().trim().required(getString('cf.creationModal.defaultVariationIsRequired')),
        defaultOffVariation: yup.string().trim().required(getString('cf.creationModal.defaultVariationIsRequired'))
      })}
      onSubmit={vals => {
        const data: FeatureFlagRequestRequestBody = { ...prevStepData, ...vals, project: projectIdentifier }
        onWizardStepSubmit(data)
      }}
    >
      {formikProps => (
        <Form>
          <FormikEffect onChange={onFormikEffect} formik={formikProps} />
          <Container flex height="100%" style={{ flexDirection: 'column', alignItems: 'baseline' }}>
            <Container style={{ flexGrow: 1, overflow: 'auto' }} width="100%" padding={{ left: 'xsmall' }}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Text style={{ fontSize: '18px', color: Color.GREY_700 }} margin={{ bottom: 'xlarge' }}>
                {getString('cf.creationModal.variationSettingsHeading')}
              </Text>
              <Layout.Vertical>
                <Layout.Horizontal>
                  <Container className={Classes.FORM_GROUP} width={180}>
                    <FormInput.Select
                      name="kind"
                      label={getString('cf.creationModal.flagType')}
                      items={flagTypeOptions}
                      onChange={newFlagType => handleNewFlagType(newFlagType.value as string)}
                      style={{ width: '188px' }}
                    />
                  </Container>
                  <Container width={20} />
                  <Container className={Classes.FORM_GROUP} width={180}>
                    <label className={Classes.LABEL}>{getString('cf.creationModal.dataType')}</label>
                    <Container className={Classes.FORM_CONTENT}>
                      <Select
                        value={kindToSelectValue(formikProps.values.kind)}
                        items={flagVariationOptions}
                        className={css.spacingSelectVariation}
                        onChange={kindVariation => {
                          formikProps.setFieldValue('kind', kindVariation.value)
                        }}
                      />
                    </Container>
                  </Container>
                </Layout.Horizontal>

                <Container>
                  <FieldArray name="variations">
                    {arrayProps => {
                      return (
                        <>
                          {formikProps.values?.variations?.map((_: HTMLElement, index: number) => (
                            <Layout.Horizontal
                              key={`flagElem-${index}`}
                              style={{
                                background: '#FAFBFC',
                                boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                                borderRadius: '4px',
                                width: '570px',
                                marginBottom: 'var(--spacing-small)',
                                padding: 'var(--spacing-small) var(--spacing-small) 0 var(--spacing-medium)'
                              }}
                            >
                              <Container width={255}>
                                <FormInput.InputWithIdentifier
                                  inputName={`variations.${index}.name`}
                                  idName={`variations.${index}.identifier`}
                                  inputLabel={getString('name')}
                                  isIdentifierEditable={true}
                                  inputGroupProps={{ inputGroup: { autoFocus: index === 0 } }}
                                />
                              </Container>
                              <Container width={20} />
                              <Container width={255}>
                                <FormInput.Text name={`variations.${index}.value`} label={getString('valueLabel')} />
                              </Container>
                              <Container width={5} />
                              <Container flex={{ align: 'center-center' }} height={70}>
                                <Button
                                  minimal
                                  icon="trash"
                                  style={{
                                    visibility: formikProps.values?.variations.length === 2 ? 'hidden' : 'visible'
                                  }}
                                  onClick={() => {
                                    formikProps.values?.variations.splice(index, 1)
                                    formikProps.setFieldValue('variations', formikProps.values?.variations)
                                  }}
                                />
                              </Container>
                            </Layout.Horizontal>
                          ))}
                          <Button
                            minimal
                            intent="primary"
                            icon="small-plus"
                            text={getString('cf.shared.variation')}
                            margin={{ bottom: 'large' }}
                            style={{ paddingLeft: 0 }}
                            onClick={() => {
                              arrayProps.push({ identifier: '', name: '', value: '' })
                              addNewFlagMultiRules()
                            }}
                          />
                        </>
                      )
                    }}
                  </FieldArray>
                </Container>

                <Container margin={{ bottom: 'large' }}>
                  <Text
                    color={Color.BLACK}
                    inline
                    tooltip={getString('cf.creationModal.defaultRulesTooltip')}
                    rightIconProps={{ size: 10, color: Color.BLUE_500 }}
                    rightIcon="info-sign"
                  >
                    {getString('cf.creationModal.defaultRules')}
                  </Text>
                  <Layout.Vertical margin={{ top: 'medium' }}>
                    <Container>
                      <Layout.Horizontal>
                        <Text width="150px" className={css.serveTextAlign}>
                          {getString('cf.creationModal.flagOn')}
                        </Text>
                        <FormInput.Select name="defaultOnVariation" items={flagMultiRules} />
                      </Layout.Horizontal>
                    </Container>
                    <Container>
                      <Layout.Horizontal>
                        <Text width="150px" className={css.serveTextAlign}>
                          {getString('cf.creationModal.flagOff')}
                        </Text>
                        <FormInput.Select name="defaultOffVariation" items={flagMultiRules} />
                      </Layout.Horizontal>
                    </Container>
                  </Layout.Vertical>
                </Container>
              </Layout.Vertical>
            </Container>

            <Layout.Horizontal spacing="small" margin={{ top: 'large' }} width="100%">
              <Button text={getString('back')} onClick={onClickBack} />
              <Button
                type="submit"
                intent="primary"
                text={getString('cf.creationModal.saveAndClose')}
                disabled={isLoadingCreateFeatureFlag}
                loading={isLoadingCreateFeatureFlag}
              />
              <FlexExpander />
              {/* <Button
                type="submit"
                text={getString('cf.creationModal.testFlagOption')}
                onClick={() => {
                  nextStep?.({ ...prevStepData })
                }}
                rightIcon="chevron-right"
                minimal
                className={css.testFfBtn}
              /> */}
            </Layout.Horizontal>
          </Container>
        </Form>
      )}
    </Formik>
  )
}

export default FlagElemMultivariate
