import React from 'react'
import { Container, Layout, Icon, Color } from '@wings-software/uikit'
import { NavLink, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetPipelineSummary, useGetTrigger } from 'services/cd-ng'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useAppStore, useStrings } from 'framework/exports'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './TriggerDetails.module.scss'

export default function TriggerDetails({ children }: React.PropsWithChildren<{}>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const { data: triggerResponse } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })
  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { projects } = useAppStore()
  const project = projects.find(({ identifier }) => identifier === projectIdentifier)
  const { getString } = useStrings()
  const onEditTriggerName = triggerResponse?.data?.name

  return (
    <>
      <Page.Header
        title={
          <Layout.Vertical spacing="xsmall">
            <Breadcrumbs
              links={[
                {
                  url: routes.toCDProjectOverview({
                    orgIdentifier,
                    projectIdentifier,
                    accountId
                  }),
                  label: project?.name as string
                },
                {
                  url: routes.toPipelines({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    module
                  }),
                  label: getString('pipelines')
                },
                {
                  url: routes.toTriggersPage({
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier,
                    accountId,
                    module
                  }),
                  label: pipeline?.data?.name || ''
                },
                { url: '#', label: onEditTriggerName || '' }
              ]}
            />
          </Layout.Vertical>
        }
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toPipelineDeploymentList({
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  accountId,
                  module
                })}
              >
                {getString('executionsText')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toInputSetList({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
              >
                {getString('inputSetsText')}
              </NavLink>
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toTriggersPage({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
              >
                {getString('pipeline-triggers.triggersLabel')}
              </NavLink>

              <NavLink
                className={css.tags}
                to={routes.toPipelineStudio({
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  accountId,
                  module
                })}
              >
                <Icon name="pipeline-ng" size={20} style={{ marginRight: '8px' }} color={Color.BLUE_600} />
                {getString('studioText')}
              </NavLink>
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}
