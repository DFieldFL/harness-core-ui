/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { GetDelegateGroupsNGV2WithFilterQueryParams } from 'services/portal'
import { useListDelegateConfigsNgV2WithFilter } from 'services/cd-ng'
import type { DelegateProfileDetailsNg } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

const DelegatesPage: React.FC = ({ children }) => {
  const params = useParams<PipelineType<ProjectPathProps>>()
  const { NG_SHOW_DEL_TOKENS } = useFeatureFlags()
  const { accountId, orgIdentifier, projectIdentifier, module } = params
  const { getString } = useStrings()
  const [profiles, setProfiles] = useState<DelegateProfileDetailsNg[]>([])

  const { mutate: getDelegateProfiles } = useListDelegateConfigsNgV2WithFilter({
    accountId,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const getDelegates = async () => {
    const delProfilesResponse = await getDelegateProfiles(
      {
        filterType: 'DelegateProfile'
      },
      {
        queryParams: {
          accountId,
          module,
          pageSize: 10,
          searchTerm: ''
        } as GetDelegateGroupsNGV2WithFilterQueryParams
      }
    )
    const resource = delProfilesResponse?.resource as any
    setProfiles(resource?.response || [])
  }

  useEffect(() => {
    getDelegates()
  }, [getDelegateProfiles])

  const links = [
    {
      label: getString('delegate.delegates'),
      to: routes.toDelegateList({ accountId, orgIdentifier, projectIdentifier, module })
    }
  ]
  if (profiles.length > 0) {
    links.push({
      label: getString('delegate.delegateConfigurations'),
      to: routes.toDelegateConfigs({ accountId, orgIdentifier, projectIdentifier, module })
    })
  }
  if (NG_SHOW_DEL_TOKENS) {
    links.push({
      label: getString('common.tokens'),
      to: routes.toDelegateTokens({ accountId, orgIdentifier, projectIdentifier, module })
    })
  }
  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: getString('delegate.delegates'),
              [Scope.ORG]: getString('delegates.delegatesTitle'),
              [Scope.ACCOUNT]: getString('delegates.delegatesTitle')
            }}
          />
        }
        toolbar={<TabNavigation size={'small'} links={links} />}
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default DelegatesPage
