/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash-es'
import { Page, Tabs, Container, Layout, Button, ButtonVariation, Heading, FontVariation } from '@wings-software/uicore'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { ServiceLevelIndicatorDTO, TimeGraphResponse, useGetSliGraph } from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOName from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOName/SLOName'
import SLI from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLI/SLI'
import SLOTargetAndBudgetPolicy from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { isFormDataValid, handleTabChange } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import { TabsOrder } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import {
  CreateSLOTabs,
  NavButtonsProps,
  CreateSLOFormProps
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const CreateSLOForm: React.FC<CreateSLOFormProps> = ({
  formikProps,
  loading,
  createOrUpdateLoading,
  error,
  retryOnError
}) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const [selectedTabId, setSelectedTabId] = useState<CreateSLOTabs>(CreateSLOTabs.NAME)
  const [sliGraphData, setSliGraphData] = useState<TimeGraphResponse>()

  const {
    mutate,
    loading: sliGraphLoading,
    error: sliGraphError
  } = useGetSliGraph({
    monitoredServiceIdentifier: '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const fetchSliGraphData = async (
    serviceLevelIndicator: ServiceLevelIndicatorDTO,
    monitoredServiceIdentifier?: string
  ): Promise<void> => {
    try {
      const sliGraphResponseData = await mutate(serviceLevelIndicator, {
        pathParams: {
          monitoredServiceIdentifier: monitoredServiceIdentifier as string
        }
      })

      setSliGraphData(sliGraphResponseData.resource)
    } catch (e) {
      //
    }
  }

  const debounceFetchSliGraphData = useCallback(debounce(fetchSliGraphData, 2000), [])

  const NavButtons: React.FC<NavButtonsProps> = ({ loading: saving }) => (
    <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
      <Button
        icon="chevron-left"
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        disabled={saving}
        onClick={() => setSelectedTabId(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])}
      />
      <RbacButton
        rightIcon="chevron-right"
        text={selectedTabId === CreateSLOTabs.SLO_TARGET_BUDGET_POLICY ? getString('save') : getString('continue')}
        variation={ButtonVariation.PRIMARY}
        loading={saving}
        onClick={() => {
          if (selectedTabId === CreateSLOTabs.SLO_TARGET_BUDGET_POLICY) {
            formikProps.submitForm()
          } else if (isFormDataValid(formikProps, selectedTabId)) {
            setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
          }
        }}
        permission={{
          permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
          resource: {
            resourceType: ResourceType.MONITOREDSERVICE,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <Container className={css.createSloTabsContainer}>
      <Tabs
        id="createSLOTabs"
        selectedTabId={selectedTabId}
        onChange={nextTabId => handleTabChange(nextTabId, formikProps, setSelectedTabId)}
        tabList={[
          {
            id: CreateSLOTabs.NAME,
            title: getString('name'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'small' }}>
                  {getString('cv.slos.sloDefinition')}
                </Heading>
                <SLOName formikProps={formikProps} identifier={identifier}>
                  <NavButtons />
                </SLOName>
              </Page.Body>
            )
          },
          {
            id: CreateSLOTabs.SLI,
            title: getString('cv.slos.sli'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <SLI
                  formikProps={formikProps}
                  sliGraphData={sliGraphData}
                  loading={sliGraphLoading}
                  error={getErrorMessage(sliGraphError)}
                  retryOnError={fetchSliGraphData}
                  debounceFetchSliGraphData={debounceFetchSliGraphData}
                >
                  <NavButtons />
                </SLI>
              </Page.Body>
            )
          },
          {
            id: CreateSLOTabs.SLO_TARGET_BUDGET_POLICY,
            title: getString('cv.slos.sloTargetAndBudgetPolicy'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <SLOTargetAndBudgetPolicy
                  formikProps={formikProps}
                  sliGraphData={sliGraphData}
                  loading={sliGraphLoading}
                  error={getErrorMessage(sliGraphError)}
                  retryOnError={fetchSliGraphData}
                >
                  <NavButtons loading={createOrUpdateLoading} />
                </SLOTargetAndBudgetPolicy>
              </Page.Body>
            )
          }
        ]}
      />
    </Container>
  )
}

export default CreateSLOForm
