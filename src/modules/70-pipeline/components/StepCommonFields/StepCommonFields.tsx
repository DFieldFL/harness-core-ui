import React from 'react'
import { Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { connect } from 'formik'
import { useStrings } from 'framework/exports'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
// import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import type { PullOption } from '../PipelineSteps/Steps/StepsTypes'
import css from '../PipelineSteps/Steps/Steps.module.scss'

export type PullOptions = { label: string; value: PullOption }[]

export const usePullOptions: () => PullOptions = () => {
  const { getString } = useStrings()
  return [
    { label: getString('pipelineSteps.pullIfNotExistsLabel'), value: 'ifNotExists' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'never' },
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'always' }
  ]
}

const StepCommonFields: React.FC = () => {
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  const { getString } = useStrings()
  // const pullOptions = usePullOptions()
  return (
    <>
      {/* TODO: Right now we do not support Image Pull Policy but will do in the future */}
      {/* <MultiTypeSelectField
        name="spec.pull"
        label={
          <Text margin={{ top: 'small' }}>
            {getString('pipelineSteps.pullLabel')}
            <Button icon="question" minimal tooltip={getString('pipelineSteps.pullInfo')} iconProps={{ size: 14 }} />
          </Text>
        }
        multiTypeInputProps={{
          selectItems: pullOptions
        }}
      /> */}
      <Text margin={{ top: 'small' }}>
        {getString('pipelineSteps.setContainerResources')}
        <Button
          icon="question"
          minimal
          tooltip={getString('pipelineSteps.setContainerResourcesTooltip')}
          iconProps={{ size: 14 }}
        />
      </Text>
      <div
        className={cx(css.fieldsGroup, css.withoutSpacing, css.withoutAligning)}
        style={{ marginBottom: 'var(--spacing-small)' }}
      >
        <MultiTypeTextField
          name="spec.limitMemory"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.limitMemoryLabel')}</Text>}
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.limitMemoryPlaceholder')
          }}
          configureOptionsProps={{ variableName: 'spec.limit.memory' }}
          style={{ flexGrow: 1, flexBasis: '50%' }}
        />
        <MultiTypeTextField
          name="spec.limitCPU"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.limitCPULabel')}</Text>}
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.limitCPUPlaceholder')
          }}
          configureOptionsProps={{ variableName: 'spec.limit.cpu' }}
          style={{ flexGrow: 1, flexBasis: '50%' }}
        />
      </div>
      <FormMultiTypeDurationField
        className={css.removeBpLabelMargin}
        name="timeout"
        label={
          <Text style={{ display: 'flex', alignItems: 'center' }}>
            {getString('pipelineSteps.timeoutLabel')}
            <Button icon="question" minimal tooltip={getString('pipelineSteps.timeoutInfo')} iconProps={{ size: 14 }} />
          </Text>
        }
        style={{ marginBottom: 0 }}
      />
    </>
  )
}

export default connect(StepCommonFields)
