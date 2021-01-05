import React from 'react'
import { Layout, Text, SelectOption } from '@wings-software/uicore'
import { isArray } from 'lodash-es'
import { PipelineContext } from '@pipeline/exports'
import type { StageElementWrapper } from 'services/cd-ng'
import { OverrideSetsInputSelector } from '../../../75-cd/components/OverrideSetsInputSelector/OverrideSetsInputSelector'
import type { InputSetSelectorProps } from '../../../75-cd/components/OverrideSetsInputSelector/OverrideSetsInputSelector'

export const PredefinedOverrideSets: React.FC<{ currentStage: StageElementWrapper | undefined; context: string }> = ({
  currentStage,
  context
}): JSX.Element => {
  const {
    state: { pipeline },
    updatePipeline
  } = React.useContext(PipelineContext)

  const getCurrentSpec = () => {
    return currentStage?.stage.spec?.service?.stageOverrides
  }

  const getValuesByContext = (): StageElementWrapper | undefined => {
    const path = getCurrentSpec()
    if (path) {
      if (context == 'ARTIFACT') {
        return path.useArtifactOverrideSets
      }
      if (context == 'MANIFEST') {
        return path.useManifestOverrideSets
      }
      if (context == 'VARIABLES') {
        return path.useVariableOverrideSets
      }
    }
  }

  const setOverrideSetsValue = (overrideSet: InputSetSelectorProps['value']): void => {
    let _stageOverridesValues: {}[] = []

    if (!isArray(overrideSet) && overrideSet) {
      _stageOverridesValues = [overrideSet.value]
    } else if (overrideSet) {
      _stageOverridesValues = overrideSet.map(v => v.value)
    } else {
      _stageOverridesValues = []
    }
    const currentPath = getCurrentSpec()
    if (currentPath) {
      if (context == 'ARTIFACT') {
        currentPath.useArtifactOverrideSets = _stageOverridesValues
      }
      if (context == 'MANIFEST') {
        currentPath.useManifestOverrideSets = _stageOverridesValues
      }
      if (context == 'VARIABLES') {
        currentPath.useVariableOverrideSets = _stageOverridesValues
      }

      updatePipeline(pipeline)
    }
  }

  const getSelectedOverrideSetValues = (): InputSetSelectorProps['value'] => {
    const currentValues = getValuesByContext()

    if (currentValues) {
      if (currentValues.length > 1) {
        const _options: SelectOption[] = []
        if (_options) {
          currentValues.map((overrideSetName: string) => {
            _options.push({ label: overrideSetName, value: overrideSetName })
          })
        }

        return _options
      } else if (currentValues.length === 1) {
        return { label: currentValues[0], value: currentValues[0] }
      }
    }
  }

  return (
    <Layout.Horizontal
      flex={true}
      style={{ alignItems: 'center', justifyContent: 'end', marginBottom: 'var(--spacing-large)' }}
      spacing="medium"
    >
      <Text>Use Predefined Override Sets</Text>
      <OverrideSetsInputSelector
        context={context}
        value={getSelectedOverrideSetValues()}
        onChange={(value: InputSetSelectorProps['value']) => {
          setOverrideSetsValue(value)
        }}
      />
    </Layout.Horizontal>
  )
}
