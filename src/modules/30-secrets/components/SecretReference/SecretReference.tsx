/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Icon, SelectOption, Text, Button, Container, Layout, Color } from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import cx from 'classnames'
import {
  ListSecretsV2QueryParams,
  Failure,
  listSecretsV2Promise,
  SecretDTOV2,
  SecretTextSpecDTO,
  ResponsePageSecretResponseWrapper,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { EntityReference } from '@common/exports'
import { EntityReferenceResponse, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import SecretEmptyState from '../../pages/secrets/secrets-empty-state.png'
import type { SecretFormData, SecretIdentifiers } from '../CreateUpdateSecret/CreateUpdateSecret'
import css from './SecretReference.module.scss'

const CustomSelect = Select.ofType<SelectOption>()
export interface SecretRef extends SecretDTOV2 {
  scope: Scope
}

export interface SecretReferenceProps {
  onSelect: (secret: SecretRef) => void
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  defaultScope?: Scope
  type?: ListSecretsV2QueryParams['type']
  mock?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  onCancel?: () => void
  handleInlineSSHSecretCreation?: () => void
}

const fetchRecords = (
  pageIndex: number,
  setPagedSecretData: (data: ResponsePageSecretResponseWrapper) => void,
  scope: Scope,
  search: string | undefined,
  done: (records: EntityReferenceResponse<SecretRef>[]) => void,
  type: ListSecretsV2QueryParams['type'],
  accountIdentifier: string,
  projectIdentifier?: string,
  orgIdentifier?: string,
  mock?: ResponsePageSecretResponseWrapper,
  connectorTypeContext?: ConnectorInfoDTO['type']
): void => {
  const secretManagerTypes: ConnectorInfoDTO['type'][] = [
    'AwsKms',
    'AzureKeyVault',
    'Vault',
    'AwsSecretManager',
    'GcpKms'
  ]
  let sourceCategory: ListSecretsV2QueryParams['source_category'] | undefined
  if (connectorTypeContext && secretManagerTypes.includes(connectorTypeContext)) {
    sourceCategory = 'SECRET_MANAGER'
  }

  listSecretsV2Promise({
    queryParams: {
      accountIdentifier,
      type,
      searchTerm: search?.trim(),
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      source_category: sourceCategory,
      pageIndex: pageIndex,
      pageSize: 10
    },
    mock
  })
    .then(responseData => {
      if (responseData?.data?.content) {
        const secrets = responseData.data.content
        setPagedSecretData(responseData)
        const response: EntityReferenceResponse<SecretRef>[] = []
        secrets.forEach(secret => {
          response.push({
            name: secret.secret.name || '',
            identifier: secret.secret.identifier || '',
            record: { ...secret.secret, scope }
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
}

const SecretReference: React.FC<SecretReferenceProps> = props => {
  const { defaultScope, accountIdentifier, projectIdentifier, orgIdentifier, type, mock, connectorTypeContext } = props
  const { getString } = useStrings()
  const [pagedSecretData, setPagedSecretData] = useState<ResponsePageSecretResponseWrapper>({})
  const [pageNo, setPageNo] = useState(0)
  const secretTypeOptions: SelectOption[] = [
    {
      label: getString('secrets.secret.labelText'),
      value: 'SecretText'
    },
    {
      label: getString('secrets.secret.labelFile'),
      value: 'SecretFile'
    }
  ]
  const defaultSecretType = secretTypeOptions.findIndex(val => val.value === type)
  const [secretType, setSecretType] = React.useState<SelectOption>(
    secretTypeOptions[defaultSecretType === -1 ? 0 : defaultSecretType]
  )
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: data => {
      props.onSelect({
        ...data,
        spec: {},
        scope: getScopeFromDTO<SecretFormData>(data)
      })
      //refetch()
    }
  })
  const selectTypeDropdown = (
    <Container flex={{ alignItems: 'baseline' }}>
      <Text margin={{ left: 'medium', right: 'xsmall' }}>{getString('secrets.secret.labelSecretType')}</Text>
      <CustomSelect
        items={secretTypeOptions}
        filterable={false}
        itemRenderer={(item, { handleClick }) => (
          <MenuItem className={css.popoverWidth} key={item.value as string} text={item.label} onClick={handleClick} />
        )}
        onItemSelect={item => {
          setSecretType(item)
        }}
        popoverProps={{ minimal: true, popoverClassName: css.popoverWidth }}
      >
        <Button
          className={css.selectButton}
          width={60}
          inline
          minimal
          rightIcon="chevron-down"
          text={secretType.label}
        />
      </CustomSelect>
    </Container>
  )
  return (
    <Container className={css.secretRefContainer}>
      <EntityReference<SecretRef>
        onSelect={(secret, scope) => {
          secret.scope = scope
          props.onSelect(secret)
        }}
        defaultScope={defaultScope}
        noDataCard={{
          image: SecretEmptyState,
          message: getString('secrets.secret.noSecretsFound'),
          containerClassName: css.noDataCardContainerSecret,
          className: css.noDataCardContainerSecret
        }}
        // recordClassName={css.listItem}
        fetchRecords={(page = 0, scope, search, done) => {
          const selectedType = type || (secretType?.value as SecretDTOV2['type'])
          fetchRecords(
            page,
            setPagedSecretData,
            scope,
            search,
            done,
            selectedType,
            accountIdentifier,
            projectIdentifier,
            orgIdentifier,
            mock,
            connectorTypeContext
          )
        }}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onCancel={props.onCancel}
        noRecordsText={getString('secrets.secret.noSecretsFound')}
        searchInlineComponent={!type ? selectTypeDropdown : undefined}
        renderTabSubHeading
        pagination={{
          itemCount: pagedSecretData?.data?.totalItems || 0,
          pageSize: pagedSecretData?.data?.pageSize || 10,
          pageCount: pagedSecretData?.data?.totalPages || -1,
          pageIndex: pageNo || 0,
          gotoPage: pageIndex => setPageNo(pageIndex)
        }}
        disableCollapse={true}
        recordRender={({ item, selectedScope, selected }) => {
          return (
            <>
              <Layout.Horizontal className={css.item} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Layout.Horizontal spacing="medium" className={css.leftInfo}>
                  <Icon
                    className={cx(css.iconCheck, { [css.iconChecked]: selected })}
                    size={14}
                    name="pipeline-approval"
                  />
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    {item.record.type === 'SecretText' || item.record.type === 'SecretFile' ? (
                      <Icon
                        name={item.record.type === 'SecretText' ? 'text' : 'file'}
                        size={24}
                        className={css.secretIcon}
                      />
                    ) : null}
                    <Layout.Vertical padding={{ left: 'small' }}>
                      <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
                        {item.record.name}
                      </Text>
                      {item.record.type === 'SecretText' || item.record.type === 'SecretFile' ? (
                        <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                          {`${getString('common.ID')}: ${item.identifier}.${
                            (item.record.spec as SecretTextSpecDTO).secretManagerIdentifier
                          }`}
                        </Text>
                      ) : null}
                      {item.record.type === 'SSHKey' ? (
                        <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                          {`${getString('common.ID')}: ${item.identifier}`}
                        </Text>
                      ) : null}
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Layout.Horizontal>

                <RbacButton
                  minimal
                  className={css.editBtn}
                  data-testid={`${name}-edit`}
                  onClick={() =>
                    openCreateSecretModal(item.record.type, {
                      identifier: item.identifier,
                      projectIdentifier: item.record.projectIdentifier,
                      orgIdentifier: item.record.orgIdentifier
                    } as SecretIdentifiers)
                  }
                  permission={{
                    permission: PermissionIdentifier.UPDATE_SECRET,
                    resource: {
                      resourceType: ResourceType.SECRET,
                      resourceIdentifier: item.identifier
                    },
                    resourceScope: {
                      accountIdentifier,
                      orgIdentifier:
                        selectedScope === Scope.ORG || selectedScope === Scope.PROJECT ? orgIdentifier : undefined,
                      projectIdentifier: selectedScope === Scope.PROJECT ? projectIdentifier : undefined
                    }
                  }}
                  text={<Icon size={16} name={'Edit'} color={Color.GREY_600} />}
                />
              </Layout.Horizontal>
            </>
          )
        }}
      />
    </Container>
  )
}

export default SecretReference
