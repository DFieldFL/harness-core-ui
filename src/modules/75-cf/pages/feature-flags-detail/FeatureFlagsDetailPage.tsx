import React, { useEffect, useState } from 'react'
import { Layout, Container, SelectOption } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { GetEnvironmentListForProjectQueryParams } from 'services/cd-ng'
import { useGetFeatureFlag } from 'services/cf'
import { useEnvironments } from '@cf/hooks/environment'
import { PageError } from '@common/components/Page/PageError'
import { CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV, getErrorMessage } from '@cf/utils/CFUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { NoEnvironment } from '@cf/components/NoEnvironment/NoEnvironment'
import { useLocalStorage } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import FlagActivation from '@cf/components/FlagActivation/FlagActivation'
import FlagActivationDetails from '../../components/FlagActivation/FlagActivationDetails'
import css from './FeatureFlagsDetailPage.module.scss'

// Show loading and wait 3s when the first environment is created before reloading
// current detail page. See https://harness.atlassian.net/browse/FFM-565
const WAIT_TIME_FOR_NEWLY_CREATED_ENVIRONMENT = 3000

const FeatureFlagsDetailPage: React.FC = () => {
  const history = useHistory()
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, featureFlagIdentifier, environmentIdentifier, accountId } = useParams<
    Record<string, string>
  >()
  const [environment, setEnvironment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const [newEnvironmentCreateLoading, setNewEnvironmentCreateLoading] = useState(false)
  const { data: environments, error: errorEnvs, loading: envsLoading, refetch: refetchEnvironments } = useEnvironments({
    projectIdentifier,
    accountIdentifier: accountId,
    orgIdentifier
  } as GetEnvironmentListForProjectQueryParams)
  const [environmentOption, setEnvironmentOption] = useState<SelectOption | null>(null)

  useDocumentTitle(getString('featureFlagsText'))

  useEffect(() => {
    if (!envsLoading) {
      let index = 0
      if (environmentIdentifier) {
        index = environments.findIndex(elem => elem.value === environmentIdentifier)
      }
      setEnvironmentOption(environments?.length > 0 ? environments[index] : null)
    }
  }, [environments?.length, envsLoading, environmentIdentifier]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: featureFlag, loading: loadingFlag, error: errorFlag, refetch: fetchFeatureFlag } = useGetFeatureFlag({
    identifier: featureFlagIdentifier as string,
    queryParams: {
      project: projectIdentifier as string,
      environment: environmentIdentifier === 'undefined' ? '' : environmentIdentifier,
      account: accountId,
      org: orgIdentifier
    }
  })

  const onEnvChange = (item: SelectOption): void => {
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
      if (environment) {
        onEnvChange(environment as SelectOption)
      }
    }
  }, [environmentOption]) // eslint-disable-line react-hooks/exhaustive-deps

  const error = errorFlag || errorEnvs
  const loading = envsLoading || loadingFlag || newEnvironmentCreateLoading
  const noEnvironmentExists = !loading && !error && environments?.length === 0

  // console.log({ envsLoading, loadingFlag, newEnvironmentCreateLoading, featureFlag, environments })
  return (
    <Container flex height="100%">
      <Layout.Horizontal width={450} className={css.flagContainer}>
        <Layout.Vertical width="100%">
          {featureFlag && <FlagActivationDetails featureFlag={featureFlag} refetchFlag={fetchFeatureFlag} />}
        </Layout.Vertical>
      </Layout.Horizontal>

      <Layout.Horizontal
        width="calc(100% - 450px + 20px)"
        height="100%"
        style={{ transform: 'translateX(-20px)', background: 'var(--white)' }}
      >
        <Layout.Vertical width="100%">
          {!loading && featureFlag && !noEnvironmentExists && !errorEnvs && (
            <FlagActivation
              refetchFlag={fetchFeatureFlag}
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
              message={getErrorMessage(error)}
              onClick={() => {
                refetchEnvironments()
              }}
            />
          )}
          {noEnvironmentExists && (
            <Container style={{ height: '100%', display: 'grid', alignItems: 'center' }}>
              <NoEnvironment
                style={{ marginTop: '-100px' }}
                onCreated={response => {
                  history.replace(
                    routes.toCFFeatureFlagsDetail({
                      orgIdentifier,
                      projectIdentifier,
                      environmentIdentifier: response?.data?.identifier as string,
                      featureFlagIdentifier,
                      accountId
                    })
                  )

                  // See https://harness.atlassian.net/browse/FFM-565
                  setNewEnvironmentCreateLoading(true)
                  setTimeout(() => {
                    setNewEnvironmentCreateLoading(false)
                    refetchEnvironments()
                  }, WAIT_TIME_FOR_NEWLY_CREATED_ENVIRONMENT)
                }}
              />
            </Container>
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

export default FeatureFlagsDetailPage
