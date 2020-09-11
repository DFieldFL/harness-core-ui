import React, { useState, ChangeEvent } from 'react'
import { Container, Text, Color } from '@wings-software/uikit'
import cx from 'classnames'
import { RiskScoreTile } from 'modules/cv/components/RiskScoreTile/RiskScoreTile'
import type { EnvServiceRiskDTO } from 'services/cv'
import i18n from './ServiceSelector.i18n'
import css from './ServiceSelector.module.scss'

interface ServiceSelectorProps {
  serviceData: EnvServiceRiskDTO[]
  className?: string
  onSelect?: (serviceIdentifier: string, environmentIdentifier: string) => void
}

interface EnvironmentRowProps {
  entityName: string
  riskScore: number
}

interface ServiceRowProps extends EnvironmentRowProps {
  selected?: boolean
  onSelect: (entityName: string) => void
}

function EnvironmentRow(props: EnvironmentRowProps): JSX.Element {
  const { entityName, riskScore } = props
  return (
    <Container flex className={cx(css.entityRow, css.environmentRow)}>
      <Text color={Color.BLACK} font={{ weight: 'bold' }}>
        {entityName}
      </Text>
      <RiskScoreTile riskScore={riskScore} className={css.smallRiskTile} />
    </Container>
  )
}

function ServiceRow(props: ServiceRowProps): JSX.Element {
  const { entityName, riskScore, selected, onSelect } = props
  return (
    <Container
      flex
      data-selected={selected}
      className={cx(css.entityRow, entityName === i18n.allServiceOptionText ? css.allServiceSelector : css.serviceRow)}
      onClick={() => {
        onSelect(entityName)
      }}
    >
      <Text>{entityName}</Text>
      <RiskScoreTile riskScore={riskScore} className={css.smallRiskTile} />
    </Container>
  )
}

export default function ServiceSelector(props: ServiceSelectorProps): JSX.Element {
  const { serviceData, onSelect, className } = props
  const [selectedEntity, setSelectedEntity] = useState<{ envIdentifier: string; serviceIdentifier: string }>({
    serviceIdentifier: i18n.allServiceOptionText,
    envIdentifier: ''
  })
  const [filterText, setFilterText] = useState<string | undefined>()
  const onSelectService = (serviceIdentifier: string, envIdentifier: string): void => {
    setSelectedEntity({ serviceIdentifier, envIdentifier })
    onSelect?.(serviceIdentifier === i18n.allServiceOptionText ? '' : serviceIdentifier, envIdentifier)
  }
  return (
    <Container className={cx(css.main, className)} background={Color.GREY_100}>
      <input
        placeholder={i18n.searchInputPlaceholder}
        className={css.filterService}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setFilterText(e.target.value)
        }}
      />
      {serviceData?.map((serviceMapping, index: number) => {
        const { envIdentifier = '', serviceRisks = [] } = serviceMapping || {}
        const filteredServiceRisks = filterText?.length
          ? serviceRisks.filter(serviceRisk =>
              serviceRisk.serviceIdentifier?.toLowerCase().includes(filterText.toLowerCase())
            )
          : serviceRisks
        return !filteredServiceRisks?.length ? null : (
          <Container key={envIdentifier}>
            {index === 0 && (
              <ServiceRow
                entityName={i18n.allServiceOptionText}
                riskScore={0}
                selected={i18n.allServiceOptionText === selectedEntity.serviceIdentifier}
                onSelect={() => onSelectService(i18n.allServiceOptionText, '')}
              />
            )}
            <EnvironmentRow entityName={envIdentifier} riskScore={0} />
            {filteredServiceRisks.map(serviceRisk => {
              const { serviceIdentifier = '', risk = 0 } = serviceRisk || {}
              return (
                <ServiceRow
                  entityName={serviceIdentifier}
                  riskScore={risk}
                  key={serviceIdentifier}
                  selected={
                    serviceIdentifier === selectedEntity?.serviceIdentifier &&
                    envIdentifier === selectedEntity?.envIdentifier
                  }
                  onSelect={() => onSelectService(serviceIdentifier, envIdentifier)}
                />
              )
            })}
          </Container>
        )
      })}
    </Container>
  )
}
