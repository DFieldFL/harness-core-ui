import React from 'react'
import { useParams } from 'react-router-dom'
import { IconName, Formik, Button, getMultiTypeFromValue, MultiTypeInputType, Accordion } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { useStrings, UseStringsReturn } from 'framework/exports'
import type { StepProps } from '@pipeline/exports'
import { StepViewType } from '@pipeline/exports'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { StepType } from '../../PipelineStepInterface'
import i18n from './ShellScriptStep.i18n'
import { PipelineStep } from '../../PipelineStep'
import BaseShellScript, { shellScriptType } from './BaseShellScript'
import ShellScriptInput from './ShellScriptInput'
import ExecutionTarget from './ExecutionTarget'
import ShellScriptOutput from './ShellScriptOutput'
import type { ShellScriptData, ShellScriptFormData } from './shellScriptTypes'
import ShellScriptInputSetStep from './ShellScriptInputSetStep'
import stepCss from '../Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1203634286/Shell+Script
 */

interface ShellScriptWidgetProps {
  initialValues: ShellScriptFormData
  onUpdate?: (data: ShellScriptFormData) => void
  stepViewType?: StepViewType
}

const ShellScriptWidget: React.FC<ShellScriptWidgetProps> = ({ initialValues, onUpdate }): JSX.Element => {
  const { getString } = useStrings()

  const defaultSSHSchema = Yup.object().shape({
    name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
    spec: Yup.object().shape({
      shell: Yup.string().required(getString('validation.scriptTypeRequired')),
      source: Yup.object().shape({
        spec: Yup.object().shape({
          script: Yup.string().required(getString('validation.scriptTypeRequired'))
        })
      })
    })
  })

  const shellscriptSchema = Yup.object().shape({
    name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
    spec: Yup.object().shape({
      shell: Yup.string().required(getString('validation.scriptTypeRequired')),
      source: Yup.object().shape({
        spec: Yup.object().shape({
          script: Yup.string().required(getString('validation.scriptTypeRequired'))
        })
      }),
      executionTarget: Yup.object().shape({
        host: Yup.string().required(getString('validation.targethostRequired')),
        connectorRef: Yup.string().required(getString('validation.sshConnectorRequired')),
        workingDirectory: Yup.string().required(getString('validation.workingDirRequired'))
      })
    })
  })

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const connectorRef = getIdentifierFromValue(initialValues.spec.executionTarget?.connectorRef || '')
  const initialScope = getScopeFromValue(initialValues.spec.executionTarget?.connectorRef || '')

  const { data: connector, loading, refetch: fetchConnector } = useGetConnector({
    identifier: connectorRef,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (
      !isEmpty(initialValues.spec.executionTarget?.connectorRef) &&
      getMultiTypeFromValue(initialValues.spec.executionTarget?.connectorRef || '') === MultiTypeInputType.FIXED
    ) {
      fetchConnector()
    }
  }, [initialValues.spec.executionTarget?.connectorRef])

  const values: any = {
    ...initialValues,
    spec: {
      ...initialValues.spec,
      executionTarget: {
        ...initialValues.spec.executionTarget,
        connectorRef: undefined
      }
    }
  }

  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(initialValues.spec.executionTarget?.connectorRef || '') === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)

    values.spec.executionTarget.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  } else {
    values.spec.executionTarget.connectorRef = initialValues.spec.executionTarget?.connectorRef
  }

  let validationSchema = defaultSSHSchema

  if (values.spec.onDelegate === 'targethost') {
    validationSchema = shellscriptSchema
  }

  return (
    <Formik<ShellScriptFormData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      initialValues={values}
      enableReinitialize
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptFormData>) => {
        return (
          <>
            <Accordion activeId="step-1" className={stepCss.accordion}>
              <Accordion.Panel id="step-1" summary="Shell Script" details={<BaseShellScript formik={formik} />} />
              <Accordion.Panel
                id="step-2"
                summary="Script Input Variables"
                details={<ShellScriptInput formik={formik} />}
              />
              <Accordion.Panel
                id="step-3"
                summary="Execution Target"
                details={<ExecutionTarget formik={formik} loading={loading} />}
              />
              <Accordion.Panel
                id="step-4"
                summary="Script Output Variables"
                details={<ShellScriptOutput formik={formik} />}
              />
            </Accordion>
            <Button intent="primary" text={getString('submit')} onClick={formik.submitForm} />
          </>
        )
      }}
    </Formik>
  )
}

export class ShellScriptStep extends PipelineStep<ShellScriptData> {
  renderStep(props: StepProps<ShellScriptData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ShellScriptInputSetStep
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    }
    return (
      <ShellScriptWidget
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        stepViewType={stepViewType}
      />
    )
  }

  validateInputSet(
    data: ShellScriptData,
    template: ShellScriptData,
    getString?: UseStringsReturn['getString']
  ): object {
    const errors = { spec: { executionTarget: {}, source: { spec: {} } } } as any

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.source?.spec?.script) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.source?.spec?.script)
    ) {
      errors.spec.source.spec.script = getString?.('fieldRequired', { field: 'Script' })
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.executionTarget?.host) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.executionTarget?.host)
    ) {
      errors.spec.executionTarget.host = getString?.('fieldRequired', { field: 'Target Host' })
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.executionTarget?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.executionTarget?.connectorRef)
    ) {
      errors.spec.executionTarget.connectorRef = getString?.('fieldRequired', { field: 'SSH Connection Attribute' })
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.executionTarget?.workingDirectory) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.executionTarget?.workingDirectory)
    ) {
      errors.spec.executionTarget.workingDirectory = getString?.('fieldRequired', { field: 'Working Directory' })
    }

    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  protected type = StepType.SHELLSCRIPT
  protected stepName = i18n.shellScriptStep
  protected stepIcon: IconName = 'command-shell-script'

  protected defaultValues: ShellScriptData = {
    identifier: '',
    spec: {
      shell: shellScriptType[0].value,
      onDelegate: 'targethost',
      source: {
        type: 'Inline',
        spec: {
          script: ''
        }
      }
    }
  }

  private getInitialValues(initialValues: ShellScriptData): ShellScriptFormData {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        shell: 'BASH',
        onDelegate: initialValues.spec?.onDelegate ? 'delegate' : 'targethost',

        environmentVariables: Array.isArray(initialValues.spec?.environmentVariables)
          ? initialValues.spec?.environmentVariables.map(variable => ({
              ...variable,
              id: uuid()
            }))
          : [{ name: '', type: 'String', value: '', id: uuid() }],

        outputVariables: Array.isArray(initialValues.spec?.outputVariables)
          ? initialValues.spec?.outputVariables.map(variable => ({
              ...variable,
              id: uuid()
            }))
          : [{ name: '', value: '', id: uuid() }]
      }
    }
  }

  private processFormData(data: ShellScriptFormData): ShellScriptData {
    return {
      ...data,
      spec: {
        ...data.spec,
        onDelegate: data.spec?.onDelegate === 'targethost' ? false : true,

        source: {
          ...data.spec?.source,
          spec: {
            ...data.spec?.source?.spec,
            script: data.spec?.source?.spec?.script
          }
        },

        executionTarget: {
          ...data.spec?.executionTarget,
          connectorRef:
            (data.spec?.executionTarget?.connectorRef?.value as string) ||
            data.spec?.executionTarget?.connectorRef?.toString()
        },

        environmentVariables: Array.isArray(data.spec?.environmentVariables)
          ? data.spec?.environmentVariables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
          : undefined,

        outputVariables: Array.isArray(data.spec?.outputVariables)
          ? data.spec?.outputVariables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
          : undefined
      }
    }
  }
}
