/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ExpressionAndRuntimeTypeProps,
  ExpressionAndRuntimeType,
  MultiTypeInputValue,
  Layout,
  Text,
  Color,
  FixedTypeComponentProps,
  MultiTypeInputType,
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, SecretsPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { EntityReferenceProps, EntityReference } from '../EntityReference/EntityReference'
import css from './ReferenceSelect.module.scss'
export interface MinimalObject {
  identifier?: string
  name?: string
}
export interface Item {
  label: string
  value: string
  scope: Scope
}

export interface ReferenceSelectDialogTitleProps {
  componentName?: string
  createNewLabel?: string
  createNewHandler?: () => void
  isNewConnectorLabelVisible?: boolean
}
export interface ReferenceSelectProps<T extends MinimalObject>
  extends Omit<EntityReferenceProps<T>, 'onSelect'>,
    ReferenceSelectDialogTitleProps {
  name: string
  placeholder: string
  selectAnReferenceLabel: string
  selected?: Item
  // createNewLabel?: string
  // createNewHandler?: () => void
  hideModal?: boolean
  selectedRenderer?: JSX.Element
  editRenderer?: JSX.Element
  width?: number
  // isNewConnectorLabelVisible?: boolean
  onChange: (record: T, scope: Scope) => void
  disabled?: boolean
  // componentName?: string
}

export const ReferenceSelectDialogTitle = (props: ReferenceSelectDialogTitleProps): JSX.Element => {
  const { getString } = useStrings()
  const { componentName, createNewHandler, createNewLabel, isNewConnectorLabelVisible } = props
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & SecretsPathProps & ModulePathParams>()
  const projectScopeTitle = projectIdentifier ? `${getString('projectsText')} / ` : ''
  const orgScopeTitle = orgIdentifier ? `${getString('orgsText')} / ` : ''
  const scopes = `${projectScopeTitle}${orgScopeTitle}${getString('account')}`
  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Layout.Vertical spacing="xsmall" padding={{ top: 'xlarge', left: 'large', right: 'large' }}>
        <Text font={{ variation: FontVariation.H4 }}>
          {getString('common.entityReferenceTitle', {
            componentName
          })}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_350}>
          {`${getString('common.entityReferenceSubTitle', {
            componentName
          })} (${scopes})`}
        </Text>
      </Layout.Vertical>

      {createNewLabel && createNewHandler && isNewConnectorLabelVisible && (
        <>
          <Layout.Horizontal className={Classes.POPOVER_DISMISS}>
            <Button
              variation={ButtonVariation.SECONDARY}
              onClick={() => {
                props.createNewHandler?.()
              }}
              text={`+ ${createNewLabel}`}
            ></Button>
          </Layout.Horizontal>
        </>
      )}
    </Layout.Horizontal>
  )
}

export function ReferenceSelect<T extends MinimalObject>(props: ReferenceSelectProps<T>): JSX.Element {
  const {
    name,
    placeholder,
    selected,
    onChange,
    width = 300,
    createNewLabel,
    createNewHandler,
    isNewConnectorLabelVisible = true,
    editRenderer,
    hideModal = false,
    selectedRenderer,
    componentName = '',
    disabled,
    ...referenceProps
  } = props
  const [isOpen, setOpen] = React.useState(false)
  React.useEffect(() => {
    isOpen && setOpen(!hideModal) //this will hide modal if hideModal changes to true in open state
  }, [hideModal])

  return (
    <>
      <Button
        minimal
        data-testid={`cr-field-${name}`}
        className={css.container}
        style={{ width }}
        withoutCurrentColor={true}
        rightIcon="chevron-down"
        iconProps={{ size: 14 }}
        disabled={disabled}
        onClick={e => {
          if (disabled) {
            e.preventDefault()
          } else {
            setOpen(true)
          }
        }}
      >
        {selected ? selectedRenderer || selected.label : <span className={css.placeholder}>{placeholder}</span>}
      </Button>
      <Dialog
        isOpen={isOpen}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => setOpen(false)}
        className={cx(css.referenceSelect, css.dialog)}
        title={ReferenceSelectDialogTitle({
          componentName,
          createNewLabel,
          createNewHandler,
          isNewConnectorLabelVisible
        })}
      >
        <div className={cx(css.contentContainer)}>
          {/* <Layout.Horizontal
            flex={{ justifyContent: 'space-between' }}
            style={{
              borderBottom: '1px solid var(--grey-200)',
              paddingTop: 'var(--spacing-xsmall)',
              paddingBottom: 'var(--spacing-medium)'
            }}
          >
            {editRenderer && selected && selected.value && <Layout.Horizontal>{editRenderer}</Layout.Horizontal>}
          </Layout.Horizontal> */}
          <EntityReference<T>
            {...referenceProps}
            onSelect={(record, scope) => {
              setOpen(false)
              onChange(record, scope)
            }}
            onCancel={() => {
              setOpen(false)
            }}
            renderTabSubHeading
          />
        </div>
      </Dialog>
    </>
  )
}
export interface MultiTypeReferenceInputProps<T extends MinimalObject>
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  referenceSelectProps: Omit<ReferenceSelectProps<T>, 'onChange'>
}
function MultiTypeReferenceInputFixedTypeComponent<T extends MinimalObject>(
  props: FixedTypeComponentProps & MultiTypeReferenceInputProps<T>['referenceSelectProps']
): React.ReactElement {
  const { onChange, selected, width = 300, ...restProps } = props
  return (
    <ReferenceSelect
      {...restProps}
      selected={selected}
      width={width}
      onChange={(record, scope) => {
        onChange?.({ record, scope } as any, MultiTypeInputValue.SELECT_OPTION, MultiTypeInputType.FIXED)
      }}
    />
  )
}
export function MultiTypeReferenceInput<T extends MinimalObject>(props: MultiTypeReferenceInputProps<T>): JSX.Element {
  const { referenceSelectProps, ...rest } = props
  return (
    <ExpressionAndRuntimeType<MultiTypeReferenceInputProps<T>['referenceSelectProps']>
      width={referenceSelectProps.width}
      {...rest}
      fixedTypeComponentProps={referenceSelectProps}
      fixedTypeComponent={MultiTypeReferenceInputFixedTypeComponent}
    />
  )
}
