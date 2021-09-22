import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, IconName, Color } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type {
  ProjectPathProps,
  ModulePathParams,
  DelegatePathProps,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { useGetDelegateGroupByIdentifier, useGetV2, DelegateProfile } from 'services/portal'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { DelegateOverview } from './DelegateOverview'
import { DelegateAdvanced } from './DelegateAdvanced'
import css from './DelegateDetails.module.scss'

export default function DelegateDetails(): JSX.Element {
  const { delegateIdentifier, accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & DelegatePathProps & AccountPathProps
  >()
  const { getString } = useStrings()
  const { data } = useGetDelegateGroupByIdentifier({
    identifier: delegateIdentifier,
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const breadcrumbs = [
    {
      label: getString('delegate.delegates'),
      url: routes.toDelegateList({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    }
  ]

  const delegate = data?.resource

  const {
    loading,
    error,
    data: profileResponse,
    refetch
  } = useGetV2({
    delegateProfileId: delegate?.delegateConfigurationId || '',
    queryParams: { accountId }
  })

  const delegateProfile = profileResponse?.resource as DelegateProfile
  const icon: IconName = delegateTypeToIcon(delegate?.delegateType as string)

  const renderTitle = (): React.ReactNode => {
    return (
      <Layout.Vertical spacing="small">
        <Layout.Horizontal spacing="small">
          <NGBreadcrumbs links={breadcrumbs} />
        </Layout.Horizontal>
        <Text style={{ fontSize: '20px', color: 'var(--black)' }} icon={icon} iconProps={{ size: 21 }}>
          {delegate?.groupName}
        </Text>
        <Text color={Color.GREY_400}>{delegate?.groupHostName}</Text>
        <Container>
          <TagsViewer tags={Object.keys(delegate?.groupImplicitSelectors || {})} style={{ background: '#CDF4FE' }} />
        </Container>
      </Layout.Vertical>
    )
  }

  if (loading) {
    return (
      <Container
        style={{
          position: 'fixed',
          top: '0',
          left: '270px',
          width: 'calc(100% - 270px)',
          height: '100%'
        }}
      >
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return <Page.Error message={error.message} onClick={() => refetch()} />
  }

  return (
    <>
      <Container
        height={143}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{ backgroundColor: 'rgba(219, 241, 255, .46)' }}
      >
        {renderTitle()}
      </Container>
      <Page.Body className={css.main}>
        <Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Container className={css.cardContainer}>
              {delegate && delegateProfile && (
                <Layout.Vertical spacing="large" width={550}>
                  <DelegateOverview delegate={delegate} delegateProfile={delegateProfile} />
                  <DelegateAdvanced delegate={delegate} delegateProfile={delegateProfile} />
                </Layout.Vertical>
              )}
            </Container>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
