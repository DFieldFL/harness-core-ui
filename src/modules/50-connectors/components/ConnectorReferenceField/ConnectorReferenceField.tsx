import React from 'react'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import {
  Layout,
  Icon,
  Color,
  Button,
  Tag,
  Text,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import cx from 'classnames'
import {
  Failure,
  ConnectorInfoDTO,
  getConnectorListPromise,
  ConnectorConfigDTO,
  GetConnectorListQueryParams,
  ConnectorResponse,
  getConnectorListV2Promise,
  ConnectorFilterProperties,
  useGetConnector
} from 'services/cd-ng'
import {
  EntityReferenceResponse,
  getIdentifierFromValue,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { getIconByType } from '@connectors/exports'
import useCreateConnectorModal, {
  UseCreateConnectorModalReturn
} from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Scope } from '@common/interfaces/SecretsInterface'
import { String, useStrings } from 'framework/exports'
import { ReferenceSelect, ReferenceSelectProps } from '../../../10-common/components/ReferenceSelect/ReferenceSelect'
import css from './ConnectorReferenceField.module.scss'

interface AdditionalParams {
  projectIdentifier?: string
  orgIdentifier?: string
}

const getAdditionalParams = ({
  scope,
  projectIdentifier,
  orgIdentifier
}: {
  scope?: string
  projectIdentifier?: string
  orgIdentifier?: string
}): AdditionalParams => {
  const additionalParams: AdditionalParams = {}

  if (scope === Scope.PROJECT) {
    additionalParams.projectIdentifier = projectIdentifier
  }

  if (scope === Scope.PROJECT || scope === Scope.ORG) {
    additionalParams.orgIdentifier = orgIdentifier
  }

  return additionalParams
}
interface ConnectorSelectedValue {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: ConnectorInfoDTO
}
export interface ConnectorReferenceFieldProps extends Omit<IFormGroupProps, 'label'> {
  accountIdentifier: string
  name: string
  placeholder: string
  label: string | React.ReactElement
  projectIdentifier?: string
  selected?: ConnectorSelectedValue | string
  onChange?: (connector: ConnectorReferenceDTO, scope: Scope) => void
  orgIdentifier?: string
  defaultScope?: Scope
  width?: number
  type?: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
  category?: GetConnectorListQueryParams['category']
  error?: string
}

interface ConnectorReferenceDTO extends ConnectorInfoDTO {
  status: ConnectorResponse['status']
}
export function getEditRenderer(
  selected: ConnectorSelectedValue,
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal'],
  type: ConnectorInfoDTO['type']
): JSX.Element {
  return (
    <Layout.Horizontal spacing="small" style={{ justifyContent: 'space-between', width: '100%' }}>
      <div>
        <Text font={{ size: 'small' }}>
          <String stringID="thisConnectorIsSavedAs" />
        </Text>
        <Text font={{ weight: 'bold' }}>{selected?.value}</Text>
      </div>
      <Button
        minimal
        icon="edit"
        onClick={e => {
          e.stopPropagation()
          openConnectorModal(true, type, selected?.connector)
        }}
        style={{
          color: 'var(--blue-450)'
        }}
      />
    </Layout.Horizontal>
  )
}
export function getSelectedRenderer(selected: ConnectorSelectedValue): JSX.Element {
  return (
    <Layout.Horizontal spacing="small" flex={{ distribution: 'space-between' }} className={css.selectWrapper}>
      <Text tooltip={selected?.label} className={css.label}>
        {selected?.label}
      </Text>

      <div className={css.rightStatus}>
        <Icon
          className={cx(css.status, { [css.redStatus]: !selected?.live }, { [css.greenStatus]: selected?.live })}
          name="full-circle"
          size={6}
          style={{ paddingRight: 'var(--spacing-xsmall)' }}
        />
        <Tag minimal className={css.tag}>
          {getScopeFromValue(selected?.value || '')}
        </Tag>
      </div>
    </Layout.Horizontal>
  )
}

interface GetReferenceFieldMethodProps extends ConnectorReferenceFieldProps {
  getString(key: string, vars?: Record<string, any>): string
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
  type: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
}

export function getReferenceFieldProps({
  defaultScope,
  accountIdentifier,
  projectIdentifier,
  orgIdentifier,
  type = 'K8sCluster',
  category,
  name,
  width,
  selected,
  placeholder,
  getString,
  openConnectorModal
}: GetReferenceFieldMethodProps): Omit<ReferenceSelectProps<ConnectorReferenceDTO>, 'onChange'> {
  return {
    name,
    width,
    selected: selected as ConnectorSelectedValue,
    placeholder,
    defaultScope,
    createNewLabel: getString('newConnector'),
    recordClassName: css.listItem,
    fetchRecords: (scope, search = '', done) => {
      const additionalParams = getAdditionalParams({ scope, projectIdentifier, orgIdentifier })
      const request = Array.isArray(type)
        ? getConnectorListV2Promise({
            queryParams: {
              accountIdentifier,
              searchTerm: search,
              ...additionalParams
            },
            body: {
              ...(!category && { types: type }),
              category,
              filterType: 'Connector',
              projectIdentifier: scope === Scope.PROJECT ? [projectIdentifier as string] : undefined,
              orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? [orgIdentifier as string] : undefined
            } as ConnectorFilterProperties
          })
        : getConnectorListPromise({
            queryParams: {
              accountIdentifier,
              // If we also pass "type" along with "category", "category" will be ignored
              ...(!category && { type }),
              category,
              searchTerm: search,
              projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
              orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined
            }
          })

      return request
        .then(responseData => {
          if (responseData?.data?.content) {
            const connectors = responseData.data.content
            const response: EntityReferenceResponse<ConnectorReferenceDTO>[] = []
            connectors.forEach(connector => {
              response.push({
                name: connector.connector?.name || '',
                identifier: connector.connector?.identifier || '',
                record: { ...connector.connector, status: connector.status } as ConnectorReferenceDTO
              })
            })
            done(response)
          } else {
            done([])
          }
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: getString('noSecretsFound'),
    recordRender: function renderItem(item) {
      return (
        <Layout.Horizontal spacing="small" style={{ justifyContent: 'space-between' }}>
          <Layout.Horizontal spacing="small">
            <Icon name={getIconByType(item.record.type)} size={30}></Icon>
            <div>
              <Text font={{ weight: 'bold' }}>{item.record.name}</Text>
              <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_450}>
                {item.identifier}
              </Text>
            </div>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="small">
            <Button
              minimal
              icon="edit"
              className={css.editBtn}
              onClick={e => {
                e.stopPropagation()
                openConnectorModal(true, item.record?.type || type, item.record)
              }}
              style={{
                color: 'var(--blue-450)'
              }}
            />
            <Icon
              className={css.status}
              name="full-circle"
              size={6}
              color={item.record.status?.status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    }
  }
}

export const ConnectorReferenceField: React.FC<ConnectorReferenceFieldProps> = props => {
  const {
    defaultScope,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    type = 'K8sCluster',
    name,
    selected,
    label,
    width = 400,
    placeholder,
    category,
    error,
    disabled,
    ...rest
  } = props
  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data) {
        props.onChange?.({ ...data.connector, status: data.status }, Scope.PROJECT)
      }
    }
  })

  const [selectedValue, setSelectedValue] = React.useState(selected)

  const scopeFromSelected = typeof selected === 'string' && getScopeFromValue(selected || '')
  const selectedRef = typeof selected === 'string' && getIdentifierFromValue(selected || '')
  const { data: connectorData, loading, refetch } = useGetConnector({
    identifier: selectedRef as string,
    queryParams: {
      accountIdentifier,
      orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true
  })

  React.useEffect(() => {
    if (
      typeof selected == 'string' &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      selected.length > 0
    ) {
      refetch()
    } else {
      setSelectedValue(selected)
    }
  }, [selected])

  React.useEffect(() => {
    if (
      typeof selected === 'string' &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      connectorData &&
      connectorData?.data?.connector?.name &&
      !loading
    ) {
      const scope = getScopeFromValue(selected || '')
      const value = {
        label: connectorData?.data?.connector?.name,
        value:
          scope === Scope.ORG || scope === Scope.ACCOUNT
            ? `${scope}.${connectorData?.data?.connector?.identifier}`
            : connectorData?.data?.connector?.identifier,
        scope: scope,
        live: connectorData?.data?.status?.status === 'SUCCESS',
        connector: connectorData?.data?.connector
      }
      setSelectedValue(value)
    }
  }, [
    connectorData?.data?.connector?.name,
    loading,
    selected,
    defaultScope,
    connectorData,
    connectorData?.data?.connector?.identifier,
    connectorData?.data?.status?.status,
    name
  ])

  const helperText = error ? error : undefined
  const intent = error ? Intent.DANGER : Intent.NONE
  const { getString } = useStrings()

  const placeHolderLocal = loading ? getString('loading') : placeholder
  const optionalReferenceSelectProps: Pick<
    ReferenceSelectProps<ConnectorConfigDTO>,
    'createNewHandler' | 'editRenderer'
  > = {}

  // TODO: Add support for multi type connectors
  if (typeof type === 'string' && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      openConnectorModal(false, type, undefined)
    }
  }

  // TODO: Add support for multi type connectors
  if (typeof type === 'string' && typeof selectedValue === 'object') {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue as ConnectorSelectedValue,
      openConnectorModal,
      (selectedValue as ConnectorSelectedValue)?.connector?.type || type
    )
  } else if (Array.isArray(type) && typeof selectedValue === 'object') {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue as ConnectorSelectedValue,
      openConnectorModal,
      (selectedValue as ConnectorSelectedValue)?.connector?.type || type[0]
    )
  }

  return (
    <FormGroup {...rest} label={label} helperText={helperText} intent={intent}>
      <ReferenceSelect<ConnectorReferenceDTO>
        onChange={(connector, scope) => {
          props.onChange?.(connector, scope)
        }}
        {...getReferenceFieldProps({
          defaultScope,
          accountIdentifier,
          projectIdentifier,
          orgIdentifier,
          type,
          name,
          selected: selectedValue,
          width,
          placeholder: placeHolderLocal,
          label,
          getString,
          category,
          openConnectorModal
        })}
        selectedRenderer={getSelectedRenderer(selectedValue as ConnectorSelectedValue)}
        {...optionalReferenceSelectProps}
        disabled={disabled || loading}
      />
    </FormGroup>
  )
}
