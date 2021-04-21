import React, { useState, ChangeEvent, useMemo } from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EnvServiceRiskDTO, RestResponseListEnvServiceRiskDTO, useGetEnvServiceRisks } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import css from './ServiceSelector.module.scss'

interface ServiceSelectorProps {
  className?: string
  onSelect?: (environmentIdentifier?: string, serviceIdentifier?: string) => void
  isEmptyList?: (isEmpty: boolean) => void
}

interface RowProps {
  entityName: string
  riskScore: number
  selected?: boolean
  onSelect: (entityName: string) => void
}

const NO_DATA_RISK_SCORE = -1

function generateOverallRiskScores(
  getString: UseStringsReturn['getString'],
  serviceData?: EnvServiceRiskDTO[]
): Map<string, number> {
  const riskScoreMap = new Map<string, number>()
  if (!serviceData) {
    return riskScoreMap
  }

  let maxOverallRiskScore = NO_DATA_RISK_SCORE
  for (const serviceInfo of serviceData) {
    if (!serviceInfo?.serviceRisks?.length || !serviceInfo?.envIdentifier) continue

    let envScore = NO_DATA_RISK_SCORE
    for (const serviceScore of serviceInfo.serviceRisks) {
      if (typeof serviceScore.risk === 'number' && serviceScore.risk > envScore) envScore = serviceScore.risk
    }

    if (envScore > maxOverallRiskScore) maxOverallRiskScore = envScore
    riskScoreMap.set(serviceInfo.envIdentifier, envScore)
  }

  riskScoreMap.set(getString('cv.allServices'), maxOverallRiskScore)
  return riskScoreMap
}

function EnvironmentRow(props: RowProps): JSX.Element {
  const { entityName, riskScore, onSelect, selected } = props
  const { getString } = useStrings()
  return (
    <Container
      flex
      data-selected={selected}
      className={cx(css.entityRow, css.environmentRow)}
      onClick={() => {
        onSelect(entityName)
      }}
    >
      <Text color={Color.BLACK} font={{ weight: 'bold' }}>
        {`${getString('environment')}: ${entityName}`}
      </Text>
      <RiskScoreTile riskScore={riskScore} isSmall />
    </Container>
  )
}

function ServiceRow(props: RowProps): JSX.Element {
  const { entityName, riskScore, selected, onSelect } = props
  const { getString } = useStrings()
  return (
    <Container
      flex
      data-selected={selected}
      className={cx(
        css.entityRow,
        entityName === getString('cv.allServices') ? css.allServiceSelector : css.serviceRow
      )}
      onClick={() => {
        onSelect(entityName)
      }}
    >
      <Text color={Color.BLACK}>{entityName}</Text>
      <RiskScoreTile riskScore={riskScore} isSmall />
    </Container>
  )
}

export default function ServiceSelector(props: ServiceSelectorProps): JSX.Element {
  const { onSelect, className, isEmptyList } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { refetch: refetchServices, data } = useGetEnvServiceRisks({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    },
    resolve: (response: RestResponseListEnvServiceRiskDTO) => {
      isEmptyList?.(Number(response?.resource?.length) === 0)
      return response
    }
  })

  const serviceData = data?.resource
  const [selectedEntity, setSelectedEntity] = useState<{ envIdentifier?: string; serviceIdentifier?: string }>({
    serviceIdentifier: getString('cv.allServices'),
    envIdentifier: ''
  })
  const [filterText, setFilterText] = useState<string | undefined>()
  const overallRiskScoresMap = useMemo(() => generateOverallRiskScores(getString, serviceData), [serviceData])
  const onSelectService = (envIdentifier?: string, serviceIdentifier?: string): void => {
    setSelectedEntity({ serviceIdentifier, envIdentifier })
    onSelect?.(envIdentifier, serviceIdentifier === getString('cv.allServices') ? undefined : serviceIdentifier)
    refetchServices()
  }
  return (
    <Container className={cx(css.main, className)} background={Color.GREY_100}>
      <input
        placeholder={getString('cv.searchForAService')}
        className={css.filterService}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
      />
      {serviceData?.map((serviceMapping, index: number) => {
        const { envIdentifier = '', serviceRisks = [], envName = '' } = serviceMapping || {}
        const filterTextLowerCase = filterText?.toLocaleLowerCase()
        const filteredServiceRisks = filterText?.length
          ? serviceRisks.filter(serviceRisk =>
              serviceRisk.serviceIdentifier?.toLowerCase().includes(filterTextLowerCase!)
            )
          : serviceRisks

        if (!envIdentifier || !envName) return null
        return !filteredServiceRisks?.length ? null : (
          <Container key={envIdentifier}>
            {index === 0 &&
              (!filterTextLowerCase?.length || filterTextLowerCase.includes(getString('cv.allServices'))) && (
                <ServiceRow
                  entityName={getString('cv.allServices')}
                  riskScore={overallRiskScoresMap.get(getString('cv.allServices')) || 0}
                  selected={getString('cv.allServices') === selectedEntity.serviceIdentifier}
                  onSelect={() => onSelectService(undefined, getString('cv.allServices'))}
                />
              )}
            <EnvironmentRow
              entityName={envName}
              riskScore={overallRiskScoresMap.get(envIdentifier) || 0}
              selected={!selectedEntity?.serviceIdentifier && selectedEntity?.envIdentifier === envIdentifier}
              onSelect={() => onSelectService(envIdentifier)}
            />
            {filteredServiceRisks.map(serviceRisk => {
              const { serviceIdentifier = '', risk = 0, serviceName = '' } = serviceRisk || {}
              if (!serviceIdentifier || !serviceName) return null
              return (
                <ServiceRow
                  entityName={serviceName}
                  riskScore={risk}
                  key={serviceIdentifier}
                  selected={
                    serviceIdentifier === selectedEntity?.serviceIdentifier &&
                    envIdentifier === selectedEntity?.envIdentifier
                  }
                  onSelect={() => onSelectService(envIdentifier, serviceIdentifier)}
                />
              )
            })}
          </Container>
        )
      })}
    </Container>
  )
}
