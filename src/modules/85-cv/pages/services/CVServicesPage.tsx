import React, { useEffect, useState } from 'react'
import { Container, Text, Select, Color, SelectOption, SelectProps } from '@wings-software/uicore'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import ActivitesTimelineViewSection from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineViewSection'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/exports'
import { RestResponseCategoryRisksDTO, useGetCategoryRiskMap } from 'services/cv'
import ServiceSelector from './ServiceSelector/ServiceSelector'
import i18n from './CVServicesPage.i18n'
import { CategoryRiskCards } from '../dashboard/CategoryRiskCards/CategoryRiskCards'
import { AnalysisDrillDownView, AnalysisDrillDownViewProps } from './analysis-drilldown-view/AnalysisDrillDownView'
import ServiceHeatMap from './ServiceHeatMap/ServiceHeatMap'
import styles from './CVServicesPage.module.scss'

const RangeOptions = [
  { label: i18n.timeRangeLabels.fiveMinutes, value: 5 },
  { label: i18n.timeRangeLabels.fifteenMinutes, value: 15 },
  { label: i18n.timeRangeLabels.oneHour, value: 60 },
  { label: i18n.timeRangeLabels.fourHours, value: 4 * 60 },
  { label: i18n.timeRangeLabels.twelveHours, value: 12 * 60 },
  { label: i18n.timeRangeLabels.oneDay, value: 24 * 60 },
  { label: i18n.timeRangeLabels.sevenDays, value: 7 * 24 * 60 },
  { label: i18n.timeRangeLabels.thirtyDays, value: 30 * 24 * 60 }
]
const DEFAULT_RANGE = RangeOptions[3]
const FIVE_MINUTES_IN_MILLISECONDS = 1000 * 60 * 5
const TimelineViewProps = {
  labelsWidth: 210,
  timelineBarProps: {
    columnWidth: 65,
    className: styles.timelineBarStyle
  }
}

const getRangeDates = (val: number, endTime?: number) => {
  const currTime =
    endTime ||
    Math.round(new Date().getTime() / FIVE_MINUTES_IN_MILLISECONDS) * FIVE_MINUTES_IN_MILLISECONDS -
      FIVE_MINUTES_IN_MILLISECONDS
  const now = moment(currTime)
  return {
    startTime: now.clone().subtract(val, 'minutes').valueOf(),
    endTime: currTime
  }
}

export default function CVServicesPage(): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [serviceIsEmpty, setIsServiceEmpty] = useState<boolean>(false)
  const [{ selectedValue, startTime, endTime }, setRange] = useState<{
    selectedValue: number
    endTime?: number
    startTime?: number
  }>({
    selectedValue: DEFAULT_RANGE.value,
    endTime: undefined,
    startTime: undefined
  })
  const [selectedService, setSelectedService] = useState<{
    serviceIdentifier?: string
    environmentIdentifier?: string
  }>({})
  const [heatMapAndTimeSeriesInput, setInput] = useState<
    Pick<AnalysisDrillDownViewProps, 'startTime' | 'endTime' | 'environmentIdentifier' | 'serviceIdentifier'>
  >({
    startTime: startTime || 0,
    endTime: endTime || 0,
    ...selectedService
  })
  const history = useHistory()

  const { data: categoryRiskData, error, loading, refetch: refetchCategoryRisk } = useGetCategoryRiskMap({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId,
      envIdentifier: selectedService?.environmentIdentifier,
      serviceIdentifier: selectedService?.serviceIdentifier
    },
    resolve: (response: RestResponseCategoryRisksDTO) => {
      if (response?.resource?.endTimeEpoch) {
        const { startTime: updatedStartTime, endTime: updatedEndTime } = getRangeDates(
          selectedValue,
          response.resource.endTimeEpoch
        )
        setRange({ selectedValue, startTime: updatedStartTime, endTime: updatedEndTime })
        setInput({ startTime: updatedStartTime, endTime: updatedEndTime, ...selectedService })
      }
      return response
    }
  })

  // We need to reset a value to default one every time account ID / project ID / organization ID changes
  useEffect(() => {
    setIsServiceEmpty(false)
  }, [accountId, projectIdentifier, orgIdentifier])

  const isTimeRangeMoreThan4Hours = moment(endTime).diff(startTime, 'minutes') > 4 * 60
  return (
    <>
      <Page.Header title={getString('services').toLocaleUpperCase()} toolbar={<Container></Container>} />
      <Page.Body
        loading={loading}
        noData={{
          when: () => !loading && serviceIsEmpty === true,
          message: i18n.noDataText.noServicesConfigured,
          buttonText: i18n.noDataText.goBackToDataSourcePage,
          onClick: () => {
            history.push({
              pathname: routes.toCVAdminSetup({
                projectIdentifier,
                orgIdentifier,
                accountId,
                step: 2
              })
            })
          },
          icon: 'error'
        }}
        error={error?.message}
        retryOnError={() => refetchCategoryRisk()}
      >
        <Container className={styles.servicesPage} background={Color.GREY_100}>
          <ServiceSelector
            isEmptyList={isEmpty => setIsServiceEmpty(isEmpty)}
            onSelect={(environmentIdentifier?: string, serviceIdentifier?: string) => {
              setSelectedService({ environmentIdentifier, serviceIdentifier })
            }}
          />
          <Container className={styles.content}>
            <CategoryRiskCards className={styles.categoryRiskCard} data={categoryRiskData} />
            <Container className={styles.serviceBody}>
              <Container flex>
                <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.BLACK}>
                  {i18n.activityTimeline}
                </Text>
                <Select
                  defaultSelectedItem={DEFAULT_RANGE}
                  items={RangeOptions}
                  className={styles.rangeSelector}
                  size={'small' as SelectProps['size']}
                  onChange={({ value }: SelectOption) => {
                    if (selectedValue === value) return
                    const { startTime: updatedStartTime, endTime: updatedEndTime } = getRangeDates(
                      value as number,
                      endTime
                    )
                    setRange({ selectedValue: value as number, startTime: updatedStartTime, endTime: updatedEndTime })
                    setInput({ ...selectedService, startTime: updatedStartTime, endTime: updatedEndTime })
                  }}
                />
              </Container>
              <ActivitesTimelineViewSection
                startTime={heatMapAndTimeSeriesInput.startTime}
                endTime={heatMapAndTimeSeriesInput.endTime}
                environmentIdentifier={selectedService?.environmentIdentifier}
                className={styles.serviceActivityTimeline}
                timelineViewProps={TimelineViewProps}
              />
              {isTimeRangeMoreThan4Hours ? (
                <ServiceHeatMap {...heatMapAndTimeSeriesInput} />
              ) : (
                <AnalysisDrillDownView {...heatMapAndTimeSeriesInput} />
              )}
            </Container>
          </Container>
        </Container>
      </Page.Body>
    </>
  )
}
