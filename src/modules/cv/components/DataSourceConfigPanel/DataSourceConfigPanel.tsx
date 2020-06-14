import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { CollapseListPanel, CollapseListPanelProps, Intent } from '@wings-software/uikit'
import DataSourcePanelStatusHeader from 'modules/cv/components/DataSourcePanelStatusHeader/DataSourcePanelStatusHeader'
import { CVNextGenCVConfigService } from 'modules/cv/services'
import type { DSConfig } from '@wings-software/swagger-ts/definitions'
import css from './DataSourceConfigPanel.module.scss'
import type { ListPanelInterface } from '@wings-software/uikit/dist/components/Collapse/CollapseListPanel'
import { useFormikContext } from 'formik'

async function removeDataSourceConfig(accountId: string, idToDelete?: string): Promise<string | undefined> {
  if (!idToDelete) {
    return
  }
  const { error } = await CVNextGenCVConfigService.deleteConfigs({
    accountId,
    group: 'XHR_DELETE_CONFIG_GROUP',
    configsToDelete: [idToDelete]
  })
  return error ? error : undefined
}

async function saveDSConfig(dsConfig: DSConfig, accountId: string): Promise<string | undefined> {
  if (!dsConfig) {
    return
  }

  const { error } = await CVNextGenCVConfigService.upsertDSConfig({
    accountId,
    group: 'XHR_SAVE_CONFIG_GROUP',
    config: dsConfig
  })

  return error
}

interface DataSourceConfigPanelProps extends ListPanelInterface {
  entityName: string
  onRemove: (index: number) => void
  transformToSavePayload?: (dsConfig: DSConfig) => DSConfig
  index: number
  validate?: (config: DSConfig) => { [fieldName: string]: string }
}

const DataSourceConfigPanel: React.FC<DataSourceConfigPanelProps> = (props): JSX.Element => {
  const { entityName, onRemove, children, transformToSavePayload, index, isOpen, onToggleOpen, validate } = props
  const [panelHeaderMsg, setPanelHeaderMsg] = useState<{ intent: Intent; msg: string } | undefined>()
  const [hasSaved, setSaved] = useState<boolean>()
  const { values, setFieldTouched, setFieldError } = useFormikContext<{
    dsConfigs: DSConfig[]
  }>()
  const configData = values?.dsConfigs?.[index] || {}

  const headingComp = useMemo(
    () => (
      <DataSourcePanelStatusHeader
        panelName={entityName}
        intent={panelHeaderMsg ? panelHeaderMsg.intent : undefined}
        message={panelHeaderMsg ? panelHeaderMsg.msg : undefined}
      />
    ),
    [entityName, panelHeaderMsg]
  )

  const validateCallback = useCallback(() => {
    if (!validate) {
      return true
    }

    const panelErrors = validate(configData) || {}
    Object.keys(panelErrors).forEach(field => {
      setFieldTouched(`dsConfigs[${index}].${field}`, true)
      setFieldError(`dsConfigs[${index}].${field}`, panelErrors[field])
    })
    if (Object.keys(panelErrors).length) {
      setPanelHeaderMsg({ intent: 'danger', msg: 'One or more fields are invalid.' })
      return false
    }
    return true
  }, [configData, setFieldError, setFieldTouched, index, validate])

  const onToggleOpenCallback = useCallback(
    (hasOpened?: boolean) => {
      if (!hasOpened && validateCallback() && !hasSaved && panelHeaderMsg && panelHeaderMsg.intent === 'primary') {
        setPanelHeaderMsg({ intent: 'none', msg: 'Unsaved Changes' })
      }
      onToggleOpen(hasOpened)
    },
    [hasSaved, onToggleOpen, panelHeaderMsg, validateCallback]
  )

  const onRemoveCallback = useCallback(() => {
    removeDataSourceConfig(configData.accountId || '').then(error => {
      if (!error) {
        setPanelHeaderMsg(undefined)
        onRemove(index)
      } else {
        setPanelHeaderMsg({ intent: 'danger', msg: error })
      }
    })
  }, [onRemove, configData, index])

  const collapseHeaderProps: CollapseListPanelProps['collapseHeaderProps'] = useMemo(
    () => ({
      heading: headingComp,
      isRemovable: true,
      onRemove: onRemoveCallback
      // onToggleOpen: () => null,
      // isOpen: isOpen || false
    }),
    [headingComp, isOpen, onRemoveCallback]
  )

  const onNextCallback = useCallback(() => {
    const config: DSConfig = transformToSavePayload?.(configData) || configData
    saveDSConfig(config, config.accountId || '').then(error => {
      if (!validateCallback()) {
        return
      }
      if (error) {
        setPanelHeaderMsg({ msg: error, intent: 'danger' })
      } else {
        setPanelHeaderMsg({ msg: 'Success', intent: 'success' })
      }
    })
  }, [configData, transformToSavePayload, validateCallback])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setPanelHeaderMsg({ intent: 'primary', msg: 'Editing' })
    if (hasSaved) {
      setSaved(false)
    }
  }, [configData, hasSaved])

  return (
    <CollapseListPanel
      collapseHeaderProps={collapseHeaderProps}
      onToggleOpen={onToggleOpenCallback}
      isOpen={isOpen || false}
      className={css.main}
      nextButtonText="Save"
      openNext={onNextCallback}
    >
      {children}
    </CollapseListPanel>
  )
}

export default DataSourceConfigPanel
