import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Popover, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { QlceViewFieldIdentifierData, QlceViewFilterOperator } from 'services/ce/services'
import ProviderSelector from './views/ProviderSelector'
import ServiceSelector from './views/ServiceSelector'
import ValueSelector from './views/ValueSelector'

import css from './FilterPill.module.scss'

const ValueRendererPopUp: React.FC<{ valueList: string[] }> = ({ valueList }) => {
  return (
    <ul className="perspective-list-item">
      {valueList.map(value => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  )
}

const ValueRenderer: React.FC<{ valueList: string[] }> = ({ valueList }) => {
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.RIGHT_TOP}
      modifiers={{
        arrow: { enabled: true },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      usePortal={true}
      content={<ValueRendererPopUp valueList={valueList} />}
    >
      <div className={cx(css.valueListContainer, { [css.hideCount]: valueList.length <= 1 })}>
        <div className={css.firstValue}>{valueList[0]}</div>
        {valueList.length > 1 && <div className={css.count}>{`(+${valueList.length - 1})`}</div>}
      </div>
    </Popover>
  )
}

export type ProviderType = {
  id: string
  name: string
}

export interface PillData {
  type: 'VIEW_ID_CONDITION'
  viewField: {
    fieldId: string
    fieldName: string
    identifier: string
    identifierName: string
  }
  operator: QlceViewFilterOperator
  values: Array<string>
}

interface FilterPillProps {
  id: number
  removePill: () => void
  onChange: (id: number, data: Omit<PillData, 'type'>) => void
  pillData: PillData
  fieldValuesList: QlceViewFieldIdentifierData[]
}

const FilterPill: React.FC<FilterPillProps> = ({ fieldValuesList, removePill, id, onChange, pillData }) => {
  // const { fieldName, identifierName, identifier, fieldId } = pillData.viewField

  const [provider, setProvider] = useState<ProviderType | null>()
  const [service, setService] = useState<ProviderType | null>()
  const [values, setValues] = useState<Record<string, boolean>>({})
  const [operator, setOperator] = useState<QlceViewFilterOperator>(QlceViewFilterOperator.In)
  const [showError, setShowError] = useState(false)

  const valueList = Object.keys(values).filter(val => values[val])

  useEffect(() => {
    const { fieldName, identifierName, identifier, fieldId } = pillData.viewField
    const valuesObject: Record<string, boolean> = {}
    pillData.values.forEach(val => {
      valuesObject[val] = true
    })
    setProvider({ id: identifier, name: identifierName })
    setService({ id: fieldId, name: fieldName })
    setValues(valuesObject)
    setOperator(pillData.operator)
  }, [pillData])

  return (
    <section className={css.filterPillContainer}>
      <Layout.Horizontal
        background="blue100"
        spacing="xsmall"
        padding="xsmall"
        className={cx(css.filterPillInnerContainer, { [css.errorPill]: showError })}
        style={{
          alignItems: 'center'
        }}
      >
        {provider?.id ? <Text font="small">{provider.name}</Text> : null}
        {service?.id ? <Text font="small">{service.name}</Text> : null}
        {service?.id && operator ? <Text font="small">{operator}</Text> : null}
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.BOTTOM_LEFT}
          defaultIsOpen={valueList.length === 0}
          modifiers={{
            arrow: { enabled: false },
            flip: { enabled: true },
            keepTogether: { enabled: true },
            preventOverflow: { enabled: true }
          }}
          usePortal={true}
          onClose={() =>
            onChange(id, {
              values: Object.keys(values).filter(val => values[val]),
              operator: operator,
              viewField: {
                fieldId: service?.id || '',
                fieldName: service?.name || '',
                identifier: provider?.id || '',
                identifierName: provider?.name || ''
              }
            })
          }
          onClosing={() => {
            setShowError(!valueList.length)
          }}
          onOpening={() => {
            setShowError(false)
          }}
          content={
            provider?.id ? (
              service?.id ? (
                <ValueSelector values={values} setOperator={setOperator} setValues={setValues} operator={operator} />
              ) : (
                <ServiceSelector setService={setService} provider={provider} fieldValueList={fieldValuesList} />
              )
            ) : (
              <ProviderSelector setProvider={setProvider} setService={setService} fieldValueList={fieldValuesList} />
            )
          }
        >
          {valueList.length ? (
            <ValueRenderer valueList={valueList} />
          ) : (
            <div className={css.placeholderContainer}></div>
          )}
        </Popover>
        <Icon name="cross" color={'blue500'} size={12} onClick={removePill} />
      </Layout.Horizontal>
    </section>
  )
}

export default FilterPill
