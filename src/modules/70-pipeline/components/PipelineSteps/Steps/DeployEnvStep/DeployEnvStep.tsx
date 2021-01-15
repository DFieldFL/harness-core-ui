import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  useModalHook,
  Text,
  CardSelect
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { get, isEmpty, isNil, noop, omit, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Classes, Dialog, FormGroup, Intent } from '@blueprintjs/core'
import { PipelineInfrastructure, useGetEnvironmentListForProject, EnvironmentYaml } from 'services/cd-ng'
import { StepViewType } from '@pipeline/exports'
import { useStrings, UseStringsReturn } from 'framework/exports'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { errorCheck } from '@common/utils/formikHelpers'
import { StepType } from '../../PipelineStepInterface'
import css from './DeployEnvStep.module.scss'

export interface DeployEnvData extends Omit<PipelineInfrastructure, 'environmentRef'> {
  environmentRef?: string
}

interface NewEditEnvironmentModalProps {
  isEdit: boolean
  data: EnvironmentYaml
  envIdentifier?: string
  onCreateOrUpdate(data: EnvironmentYaml): void
}

export const NewEditEnvironmentModal: React.FC<NewEditEnvironmentModalProps> = ({
  isEdit,
  data,
  onCreateOrUpdate
}): JSX.Element => {
  const { getString } = useStrings()
  const typeList: { text: string; value: EnvironmentYaml['type'] }[] = [
    {
      text: getString('production'),
      value: 'Production'
    },
    {
      text: getString('nonProduction'),
      value: 'PreProduction'
    }
  ]
  return (
    <Layout.Vertical>
      <Formik<EnvironmentYaml>
        initialValues={data}
        onSubmit={values => {
          onCreateOrUpdate(values)
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .required(getString?.('fieldRequired', { field: 'Environment' })),
          type: Yup.string().required(getString?.('fieldRequired', { field: 'Type' }))
        })}
      >
        {formikProps => (
          <Layout.Vertical spacing="medium" padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}>
            <AddDescriptionAndKVTagsWithIdentifier
              formikProps={formikProps}
              identifierProps={{
                inputLabel: getString('name'),
                isIdentifierEditable: !isEdit
              }}
            />
            <FormGroup
              helperText={errorCheck('type', formikProps) ? get(formikProps?.errors, 'type') : null}
              intent={errorCheck('type', formikProps) ? Intent.DANGER : Intent.NONE}
              label={getString('envType')}
              labelFor="type"
            >
              <CardSelect
                cornerSelected={true}
                data={typeList}
                className={css.grid}
                onChange={item => {
                  formikProps.setFieldValue('type', item.value)
                }}
                renderItem={(item, _) => (
                  <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
                    <Text font={{ align: 'center' }} style={{ fontSize: 12 }}>
                      {item.text}
                    </Text>
                  </Layout.Vertical>
                )}
                selected={typeList[typeList.findIndex(card => card.value == formikProps.values.type)]}
              >
                {}
              </CardSelect>
            </FormGroup>
            <div>
              <Button onClick={() => formikProps.submitForm()} intent="primary" text={getString('save')} />
            </div>
          </Layout.Vertical>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

interface DeployEnvironmentProps {
  initialValues: DeployEnvData
  onUpdate?: (data: DeployEnvData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: DeployEnvData
    path?: string
    readonly?: boolean
  }
}

interface DeployEnvironmentState {
  isEdit: boolean
  data: EnvironmentYaml
}

function isEditEnvironment(data: DeployEnvData): boolean {
  if (getMultiTypeFromValue(data.environmentRef) !== MultiTypeInputType.RUNTIME && !isEmpty(data.environmentRef)) {
    return true
  } else if (data.environment && !isEmpty(data.environment.identifier)) {
    return true
  }
  return false
}

const DeployEnvironmentWidget: React.FC<DeployEnvironmentProps> = ({ initialValues, onUpdate }): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { showError } = useToaster()
  const { data: environmentsResponse, error } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const [environments, setEnvironments] = React.useState<SelectOption[]>([])
  const [state, setState] = React.useState<DeployEnvironmentState>({
    isEdit: false,
    data: { name: '', identifier: '', type: 'PreProduction' }
  })
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => {
          setState({ isEdit: false, data: { name: '', identifier: '', type: 'PreProduction' } })
          hideModal()
        }}
        isCloseButtonShown
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
        className={Classes.DIALOG}
      >
        <NewEditEnvironmentModal
          data={state.data}
          isEdit={state.isEdit}
          onCreateOrUpdate={values => {
            onUpdate?.({
              ...omit(initialValues, 'environmentRef'),
              environment: pick(values, ['name', 'identifier', 'description', 'tags', 'type'])
            })
            const item = environments.filter(env => env.value === values.identifier)[0]
            if (item) {
              item.label = values.name || ''
              setEnvironments(environments)
            }
            setState({ isEdit: false, data: { name: '', identifier: '', type: 'PreProduction' } })
            hideModal()
          }}
        />
      </Dialog>
    ),
    [state.isEdit, state.data]
  )

  React.useEffect(() => {
    const identifier = initialValues.environment?.identifier
    const isExist = environments.filter(env => env.value === identifier).length > 0
    if (initialValues.environment && identifier && !isExist) {
      const value = { label: initialValues.environment.name || '', value: initialValues.environment.identifier || '' }
      environments.push(value)
      setEnvironments([...environments])
    }
  }, [initialValues.environment, initialValues.environment?.identifier, environments])

  React.useEffect(() => {
    if (environmentsResponse?.data?.content?.length && !isNil(initialValues.environmentRef)) {
      setEnvironments(
        environmentsResponse.data.content.map(env => ({
          label: env.name || env.identifier || '',
          value: env.identifier || ''
        }))
      )
    }
  }, [environmentsResponse, environmentsResponse?.data?.content?.length, initialValues.environmentRef])

  if (error?.message) {
    showError(error.message)
  }
  return (
    <>
      <Formik<DeployEnvData>
        onSubmit={noop}
        validate={values => {
          const selectedValue = ((values.environmentRef as unknown) as SelectOption).value as string
          if (selectedValue && !values.environment) {
            onUpdate?.({ ...omit(initialValues, 'environment'), environmentRef: selectedValue })
          } else {
            if (isEmpty(values.environmentRef)) {
              onUpdate?.({ ...omit(initialValues, 'environmentRef') })
            } else {
              onUpdate?.({ ...omit(initialValues, 'environment'), environmentRef: values.environmentRef })
            }
          }
        }}
        initialValues={{
          ...initialValues,
          ...(initialValues.environment && !isEmpty(initialValues.environment?.identifier)
            ? {
                environmentRef: {
                  label: initialValues.environment.name || '',
                  value: initialValues.environment.identifier || ''
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any
              }
            : initialValues.environmentRef &&
              getMultiTypeFromValue(initialValues.environmentRef) === MultiTypeInputType.FIXED
            ? {
                environmentRef: environments.filter(env => env.value === initialValues.environmentRef)[0]
              }
            : {})
        }}
        enableReinitialize
        validationSchema={Yup.object().shape({
          environmentRef: Yup.string().required(getString('pipelineSteps.environmentTab.environmentIsRequired'))
        })}
      >
        {({ values, setFieldValue }) => {
          return (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <FormInput.MultiTypeInput
                label={getString('pipelineSteps.environmentTab.specifyYourEnvironment')}
                name="environmentRef"
                placeholder={getString('pipelineSteps.environmentTab.selectEnvironment')}
                multiTypeInputProps={{
                  width: 300,
                  onChange: value => {
                    if (isEmpty(value)) {
                      setFieldValue('environmentRef', '')
                    }
                    setFieldValue('environment', undefined)
                  },
                  selectProps: {
                    addClearBtn: true,
                    items: environments
                  }
                }}
                selectItems={environments}
              />
              {getMultiTypeFromValue(values?.environmentRef) === MultiTypeInputType.FIXED && (
                <Button
                  minimal
                  intent="primary"
                  onClick={() => {
                    const isEdit = isEditEnvironment(values)
                    if (isEdit) {
                      if (values.environment) {
                        setState({
                          isEdit,
                          data: values.environment
                        })
                      } else {
                        setState({
                          isEdit,
                          data: ((environmentsResponse?.data?.content?.filter(
                            env => env.identifier === ((values.environmentRef as unknown) as SelectOption).value
                          )?.[0] as unknown) as EnvironmentYaml) || { name: '', identifier: '', type: 'PreProduction' }
                        })
                      }
                    }
                    showModal()
                  }}
                  text={
                    isEditEnvironment(values)
                      ? getString('editEnvironment')
                      : getString('pipelineSteps.environmentTab.newEnvironment')
                  }
                />
              )}
            </Layout.Horizontal>
          )
        }}
      </Formik>
    </>
  )
}

const DeployEnvironmentInputStep: React.FC<DeployEnvironmentProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { showError } = useToaster()
  const { data: environmentsResponse, error, refetch } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })
  const [environments, setEnvironments] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      setEnvironments(
        environmentsResponse.data.content.map(env => ({
          label: env.name || env.identifier || '',
          value: env.identifier || ''
        }))
      )
    }
  }, [environmentsResponse, environmentsResponse?.data?.content?.length])

  if (error?.message) {
    showError(error.message)
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.environmentRef) === MultiTypeInputType.RUNTIME && (
        <FormInput.Select
          label={getString('pipelineSteps.environmentTab.specifyYourEnvironment')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}environmentRef`}
          placeholder={getString('pipelineSteps.environmentTab.selectEnvironment')}
          items={environments}
          disabled={inputSetData?.readonly}
        />
      )}
    </>
  )
}

export class DeployEnvironmentStep extends Step<DeployEnvData> {
  renderStep(props: StepProps<DeployEnvData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DeployEnvironmentInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    }
    return <DeployEnvironmentWidget initialValues={initialValues} onUpdate={onUpdate} stepViewType={stepViewType} />
  }
  validateInputSet(data: DeployEnvData, template: DeployEnvData, getString?: UseStringsReturn['getString']): object {
    const errors = {} as any
    if (
      isEmpty(data?.environmentRef) &&
      getMultiTypeFromValue(template?.environmentRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.environmentRef = getString?.('pipelineSteps.environmentTab.environmentIsRequired')
    }
    return errors
  }
  protected stepPaletteVisible = false
  protected type = StepType.DeployEnvironment
  protected stepName = 'Deploy Environment'
  protected stepIcon: IconName = 'main-environments'

  protected defaultValues: DeployEnvData = {}
}
