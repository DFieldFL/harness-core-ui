import React, { useEffect, useMemo, useState } from 'react'
import { Container, Select, SelectOption } from '@wings-software/uicore'
import Card from '@cv/components/Card/Card'
import { useStrings } from 'framework/strings'
// import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import { getTimeFormat, getTimePeriods, getTimestampsForPeriod } from './ServiceHealth.utils'
import {
  // tickerData,
  TimePeriodEnum
} from './ServiceHealth.constants'
// import type { TickerType } from './ServiceHealth.types'
// import TickerValue from './components/TickerValue/TickerValue'
import type { ServiceHealthProps } from './ServiceHealth.types'
import HealthScoreChart from './components/HealthScoreChart/HealthScoreChart'
import HealthScoreCard from './components/HealthScoreCard/HealthScoreCard'
import css from './ServiceHealth.module.scss'

export default function ServiceHealth({
  monitoredServiceIdentifier,
  serviceIdentifier,
  environmentIdentifier
}: ServiceHealthProps): JSX.Element {
  const { getString } = useStrings()
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<SelectOption>({
    value: TimePeriodEnum.TWENTY_FOUR_HOURS,
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
  })
  const [timestamps, setTimestamps] = useState<number[]>([])

  useEffect(() => {
    const timestampsForPeriod = getTimestampsForPeriod(selectedTimePeriod.value as string)
    setTimestamps(timestampsForPeriod)
  }, [selectedTimePeriod?.value])

  const timeFormat = useMemo(() => {
    return getTimeFormat(selectedTimePeriod?.value as string)
  }, [selectedTimePeriod?.value])

  return (
    <>
      <Container className={css.serviceHealthHeader}>
        <Select
          value={selectedTimePeriod}
          items={getTimePeriods(getString)}
          className={css.timePeriods}
          onChange={setSelectedTimePeriod}
        />
        <HealthScoreCard serviceIdentifier={serviceIdentifier} environmentIdentifier={environmentIdentifier} />
      </Container>
      <Container className={css.serviceHealthCard}>
        <Card>
          <>
            {/* TODO - Will be added back once the backend api data is available */}
            {/* <Container className={css.tickersRow}>
              {tickerData.map((ticker: TickerType) => {
                return (
                  <Container key={ticker.id} className={css.ticker}>
                    <Ticker
                      value={
                        <TickerValue
                          value={ticker.percentage}
                          label={ticker.label}
                          color={ticker.percentage < 0 ? Color.GREEN_600 : Color.RED_500}
                        />
                      }
                      decreaseMode={ticker.percentage < 0}
                      color={ticker.percentage < 0 ? Color.GREEN_600 : Color.RED_500}
                      verticalAlign={TickerVerticalAlignment.TOP}
                    >
                      <Text color={Color.BLACK} font={{ weight: 'bold', size: 'large' }} margin={{ right: 'medium' }}>
                        {ticker.count}
                      </Text>
                    </Ticker>
                  </Container>
                )
              })}
            </Container> */}
            <HealthScoreChart
              duration={selectedTimePeriod.value as TimePeriodEnum}
              monitoredServiceIdentifier={monitoredServiceIdentifier as string}
            />
            <ChangeTimeline timestamps={timestamps} timeFormat={timeFormat} />
          </>
        </Card>
      </Container>
    </>
  )
}
