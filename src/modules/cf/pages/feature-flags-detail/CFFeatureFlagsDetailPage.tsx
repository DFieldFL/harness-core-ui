import React, { useEffect, useState } from 'react'
import { get } from 'lodash-es'
import { Layout, Container, SelectOption } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { GetEnvironmentListForProjectQueryParams } from 'services/cd-ng'
import { useGetAllFeatures, useGetFeatureFlag } from 'services/cf'
import { useEnvironments } from '@cf/hooks/environment'
import { PageError } from '@common/components/Page/PageError'
import { CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV } from '@cf/utils/CFUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useLocalStorage } from '@common/hooks'
import FlagActivation from '../../components/FlagActivation/FlagActivation'
import FlagActivationDetails from '../../components/FlagActivation/FlagActivationDetails'
import css from './CFFeatureFlagsDetailPage.module.scss'

const CFFeatureFlagsDetailPage: React.FC = () => {
  const history = useHistory()
  const { orgIdentifier, projectIdentifier, featureFlagIdentifier, environmentIdentifier, accountId } = useParams<any>()
  const [environment, setEnvironment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)

  const { data: environments, error: errorEnvs, loading: envsLoading, refetch: refetchEnvironments } = useEnvironments({
    projectIdentifier,
    accountIdentifier: accountId,
    orgIdentifier
  } as GetEnvironmentListForProjectQueryParams)
  const [environmentOption, setEnvironmentOption] = useState<SelectOption | null>(null)

  useEffect(() => {
    if (!envsLoading) {
      let index = 0
      if (environmentIdentifier) {
        index = environments.findIndex(elem => elem.value === environmentIdentifier)
      }
      setEnvironmentOption(environments?.length > 0 ? environments[index] : null)
    }
  }, [environments?.length, envsLoading, environmentIdentifier])

  const { data: featureFlag, loading: loadingFlag, error: errorFlag, refetch } = useGetFeatureFlag({
    lazy: true,
    identifier: featureFlagIdentifier as string,
    queryParams: {
      project: projectIdentifier as string,
      environment: environmentOption?.value as string,
      account: accountId,
      org: orgIdentifier
    }
  })

  const { data: featureList, refetch: fetchFlagList } = useGetAllFeatures({
    lazy: true,
    queryParams: {
      environment: environmentOption?.value as string,
      project: projectIdentifier as string,
      account: accountId,
      org: orgIdentifier
    }
  })

  useEffect(() => {
    if (environmentOption) {
      refetch()
      fetchFlagList()
    }
  }, [environmentOption])

  const onEnvChange = (item: SelectOption) => {
    setEnvironment({ label: item?.label, value: item?.value as string })

    if (item?.value) {
      history.push(
        routes.toCFFeatureFlagsDetail({
          orgIdentifier: orgIdentifier as string,
          projectIdentifier: projectIdentifier as string,
          environmentIdentifier: item?.value as string,
          featureFlagIdentifier: featureFlagIdentifier as string,
          accountId
        })
      )
    }
  }

  useEffect(() => {
    if (environmentOption) {
      refetch()
      if (environment) {
        onEnvChange(environment as SelectOption)
      }
    }
  }, [environmentOption])

  const error = errorFlag || errorEnvs
  const loading = envsLoading || loadingFlag

  return (
    <Container flex height="100%">
      <Layout.Horizontal className={css.flagContainer}>
        <Layout.Vertical width="100%">
          {featureFlag && (
            <FlagActivationDetails featureFlag={featureFlag} featureList={featureList} refetchFlag={refetch} />
          )}
        </Layout.Vertical>
      </Layout.Horizontal>

      <Layout.Horizontal width="70%" height="100%">
        <Layout.Vertical width="100%">
          {featureFlag && (
            <FlagActivation
              refetchFlag={refetch}
              project={projectIdentifier as string}
              environments={environments}
              environment={environmentOption}
              flagData={featureFlag}
              isBooleanFlag={featureFlag.kind === 'boolean'}
              onEnvChange={onEnvChange}
            />
          )}
          {error && (
            <PageError
              message={get(error, 'data.message', error?.message)}
              onClick={() => {
                refetchEnvironments()
              }}
            />
          )}
        </Layout.Vertical>
      </Layout.Horizontal>

      {loading && (
        <Container
          style={{
            position: 'fixed',
            top: 0,
            left: '270px',
            width: 'calc(100% - 270px)',
            height: 'calc(100% - 144px)',
            zIndex: 1
          }}
        >
          <ContainerSpinner />
        </Container>
      )}
    </Container>
  )
}

export default CFFeatureFlagsDetailPage
