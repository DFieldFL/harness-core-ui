import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Color, Container, Layout, Text } from '@wings-software/uicore'
import { IOptionProps, Radio } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { DelegateSelectors } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import { DelegateGroupDetails, useGetDelegatesUpTheHierarchy } from 'services/portal'
import {
  DelegateSelectorTable,
  DelegateSelectorTableProps
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelectorTable'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

export enum DelegateOptions {
  DelegateOptionsAny = 'DelegateOptions.DelegateOptionsAny',
  DelegateOptionsSelective = 'DelegateOptions.DelegateOptionsSelective'
}
export interface DelegateSelectorProps {
  mode: DelegateOptions
  setMode: (mode: DelegateOptions) => void
  delegateSelectors: Array<string>
  setDelegateSelectors: (delegateSelectors: Array<string>) => void
  setDelegatesFound: (delegatesFound: boolean) => void
  delegateSelectorMandatory: boolean
}

export interface DelegateGroupDetailsCustom extends DelegateGroupDetails {
  checked: boolean
}

const NullRenderer = () => <></>

interface CustomRadioGroupProps {
  items: (IOptionProps & { checked: boolean; CustomComponent?: React.ReactElement })[]
  onClick: (mode: DelegateOptions) => void
}

const shouldDelegateBeChecked = (delegateSelectors: Array<string>, tags: Array<string> = []) => {
  if (!delegateSelectors?.length) {
    return false
  }
  const delegateSelectorsMap = delegateSelectors.reduce((acc: Record<string, boolean>, delegateSelector) => {
    acc[delegateSelector] = false
    return acc
  }, {})
  for (const tag of tags) {
    delete delegateSelectorsMap[tag]
  }
  return !Object.keys(delegateSelectorsMap).length
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = props => {
  const { items, onClick } = props
  return (
    <Container>
      {items.map((item, index) => {
        const { CustomComponent = NullRenderer } = item
        return (
          <Layout.Horizontal
            margin={index === items.length - 1 ? { bottom: 'small' } : { bottom: 'medium' }}
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            key={index}
          >
            <Radio
              label={item.label}
              value={item.value}
              color={Color.GREY_800}
              className={css.radio}
              checked={item.checked}
              disabled={item.disabled}
              onClick={() => onClick(item.value as DelegateOptions)}
            />
            {CustomComponent}
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}

export const DelegateSelector: React.FC<DelegateSelectorProps> = props => {
  const {
    mode,
    setMode,
    delegateSelectors = [],
    setDelegateSelectors,
    setDelegatesFound,
    delegateSelectorMandatory = false
  } = props
  const [formattedData, setFormattedData] = useState<DelegateGroupDetailsCustom[]>([])
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data, loading, error, refetch } = useGetDelegatesUpTheHierarchy({
    queryParams: {
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier
    }
  })
  const { CDNG_ENABLED, NG_SHOW_DELEGATE } = useFeatureFlags()
  const { openDelegateModal } = useCreateDelegateModal({
    onClose: refetch
  })

  useEffect(() => {
    const parsedData = (data?.resource?.delegateGroupDetails || []).map(delegateGroupDetails => ({
      ...delegateGroupDetails,
      checked: shouldDelegateBeChecked(
        delegateSelectors,
        Object.keys(delegateGroupDetails?.groupImplicitSelectors || {})
      )
    }))
    parsedData.sort((parsedDataItemA, parsedDataItemB) => {
      const [checkedA, checkedB] = [parsedDataItemA.checked, parsedDataItemB.checked]
      if (checkedA && !checkedB) {
        return -1
      }
      if (checkedB && !checkedA) {
        return 1
      }
      return 0
    })
    setFormattedData(parsedData)
    const updatedMode =
      delegateSelectors.length || delegateSelectorMandatory
        ? DelegateOptions.DelegateOptionsSelective
        : DelegateOptions.DelegateOptionsAny
    setMode(updatedMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegateSelectors, data])

  useEffect(() => {
    const totalChecked = formattedData.filter(item => item.checked).length
    const isSaveButtonDisabled = mode === DelegateOptions.DelegateOptionsSelective && delegateSelectors.length === 0
    if (
      !loading &&
      !isSaveButtonDisabled &&
      (!formattedData.length || (mode === DelegateOptions.DelegateOptionsSelective && !totalChecked))
    ) {
      setDelegatesFound(false)
    } else {
      setDelegatesFound(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, formattedData])

  const DelegateSelectorCountComponent = useMemo(() => {
    const count = formattedData.filter(item => item.checked).length
    const total = formattedData.length
    if (!total) {
      return <></>
    }
    return (
      <Text data-name="delegateMatchingText">{`${count}/${total} ${getString(
        'connectors.delegate.matchingDelegates'
      )}`}</Text>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedData])

  const DelegateSelectorsCustomComponent = useMemo(
    () => (
      <DelegateSelectors
        className={css.formInput}
        fill
        allowNewTag={false}
        placeholder={getString('delegate.DelegateselectionPlaceholder')}
        selectedItems={delegateSelectors}
        onChange={selectors => {
          setDelegateSelectors(selectors as Array<string>)
          setMode(DelegateOptions.DelegateOptionsSelective)
        }}
      ></DelegateSelectors>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delegateSelectors]
  )

  const CustomComponent = useMemo(() => {
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'small' }}>
        {DelegateSelectorsCustomComponent}
        {DelegateSelectorCountComponent}
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedData])

  const options: CustomRadioGroupProps['items'] = useMemo(
    () => [
      {
        label: getString('connectors.delegate.delegateSelectorAny'),
        value: DelegateOptions.DelegateOptionsAny,
        checked: mode === DelegateOptions.DelegateOptionsAny,
        disabled: delegateSelectorMandatory
      },
      {
        label: getString('connectors.delegate.delegateSelectorSelective'),
        value: DelegateOptions.DelegateOptionsSelective,
        checked: mode === DelegateOptions.DelegateOptionsSelective
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, formattedData]
  )
  const delegateSelectorTableProps: DelegateSelectorTableProps = {
    data: formattedData,
    loading,
    error,
    refetch,
    showMatchesSelectorColumn: mode === DelegateOptions.DelegateOptionsSelective
  }
  return (
    <Layout.Vertical className={css.delegateSelectorContainer}>
      <Text color={Color.GREY_800} margin={{ top: 'xlarge', bottom: 'medium' }}>
        {getString('connectors.delegate.configure')}
      </Text>
      <CustomRadioGroup items={options} onClick={newMode => setMode(newMode)} />
      {CustomComponent}
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ bottom: 'medium' }}>
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
          {getString('connectors.delegate.testDelegateConnectivity')}
        </Text>
        {CDNG_ENABLED && NG_SHOW_DELEGATE ? (
          <Button
            icon="plus"
            withoutBoxShadow
            font={{ weight: 'semi-bold' }}
            iconProps={{ margin: { right: 'xsmall' } }}
            onClick={() => openDelegateModal()}
            data-name="installNewDelegateButton"
          >
            {getString('connectors.testConnectionStep.installNewDelegate')}
          </Button>
        ) : (
          <></>
        )}
      </Layout.Horizontal>
      <DelegateSelectorTable {...delegateSelectorTableProps} />
    </Layout.Vertical>
  )
}
