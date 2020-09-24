import React, { useState, useEffect, useMemo } from 'react'
import { Container, Text, Select, OverlaySpinner, Color, SelectOption } from '@wings-software/uikit'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { Page } from 'modules/common/exports'
import HeatMap, { CellStatusValues } from 'modules/common/components/HeatMap/HeatMap'
import { routeParams } from 'framework/exports'
import {
  HeatMapDTO,
  useGetHeatmap,
  useGetEnvServiceRisks,
  RestResponseListEnvServiceRiskDTO,
  EnvServiceRiskDTO
} from 'services/cv'
import { useToaster } from 'modules/common/exports'
import { routeCVDataSources } from 'modules/cv/routes'
import { RiskScoreTile } from 'modules/cv/components/RiskScoreTile/RiskScoreTile'
import ServiceSelector from './ServiceSelector/ServiceSelector'
import i18n from './CVServicesPage.i18n'
import { CategoryRiskCards } from '../dashboard/CategoryRiskCards/CategoryRiskCards'
import { AnalysisDrillDownView } from './analysis-drilldown-view/AnalysisDrillDownView'
import useAnalysisDrillDownView from './analysis-drilldown-view/useAnalysisDrillDownView'
import styles from './CVServicesPage.module.scss'

const RangeOptions = [
  { label: '4 hrs', value: 4 },
  { label: '12 hrs', value: 12 },
  { label: '1 day', value: 24 },
  { label: '7 days', value: 7 * 24 },
  { label: '30 days', value: 30 * 24 }
]
const DEFAULT_RANGE = RangeOptions[0]
const getRangeDates = (val: number) => {
  const now = moment()
  now.subtract(now.seconds() % 60, 'seconds') // floor to the nearest minute
  now.subtract(now.milliseconds() % 1000, 'milliseconds')
  return {
    start: now.clone().subtract(val, 'hours'),
    end: now
  }
}

function mapHeatmapValue(val: any): number | CellStatusValues {
  return val && typeof val.riskScore === 'number' ? val.riskScore : CellStatusValues.Missing
}

function HeatMapTooltip({ cell }: { cell?: HeatMapDTO }): JSX.Element {
  return cell ? (
    <Container className={styles.heatmapTooltip}>
      {cell.startTime && cell.endTime && (
        <Text>{`${moment(cell.startTime).format('M/D/YYYY h:m a')} - ${moment(cell.endTime).format(
          'M/D/YYYY h:m a'
        )}`}</Text>
      )}
      <Container className={styles.overallScoreContent}>
        <Text font={{ size: 'small' }}>{i18n.heatMapTooltipText.overallRiskScore}</Text>
        <RiskScoreTile riskScore={Math.floor((cell?.riskScore || 0) * 100)} isSmall />
      </Container>
    </Container>
  ) : (
    <Container className={styles.heatmapTooltip}>
      <Text className={styles.overallScoreContent}>{i18n.heatMapTooltipText.noData}</Text>
    </Container>
  )
}

export default function CVServicesPage(): JSX.Element {
  const {
    params: { accountId, projectIdentifier, orgIdentifier }
  } = routeParams()
  const [range, setRange] = useState({
    selectedValue: DEFAULT_RANGE.value,
    dates: {
      ...getRangeDates(DEFAULT_RANGE.value)
    }
  })
  const [heatmapData, setHeatmapData] = useState<Array<{ name: string; data: Array<any> }>>([])
  const [services, setServices] = useState<EnvServiceRiskDTO[]>([])
  const [selectedService, setSelectedService] = useState<{
    serviceIdentifier?: string
    environmentIdentifier?: string
  }>({})
  const history = useHistory()
  const { showError } = useToaster()
  const { openDrillDown } = useAnalysisDrillDownView()

  const { data: heatmapResponse, loading: loadingHeatmap, error: heatmapError, refetch: getHeatmap } = useGetHeatmap({
    queryParams: {
      accountId: accountId,
      envIdentifier: selectedService?.environmentIdentifier,
      serviceIdentifier: selectedService?.serviceIdentifier,
      projectIdentifier: projectIdentifier as string,
      startTimeMs: range.dates.start.valueOf(),
      endTimeMs: range.dates.end.valueOf()
    },
    lazy: true,
    resolve: response => {
      setHeatmapData(
        !response?.resource
          ? []
          : Object.keys(response.resource).map((key: string) => ({
              name: key,
              data: response?.resource[key]
            }))
      )
      return response
    }
  })

  const { loading: loadingServices, error: servicesError, refetch: refetchServices } = useGetEnvServiceRisks({
    queryParams: {
      accountId,
      projectIdentifier: projectIdentifier as string,
      orgIdentifier: orgIdentifier as string
    },
    resolve: (response: RestResponseListEnvServiceRiskDTO) => {
      if (response?.resource?.length) {
        setServices(response.resource)
        getHeatmap({
          queryParams: {
            accountId: accountId,
            projectIdentifier: projectIdentifier as string,
            startTimeMs: range.dates.start.valueOf(),
            endTimeMs: range.dates.end.valueOf()
          }
        })
      }
      return response
    }
  })

  useEffect(() => {
    if (heatmapError) showError(heatmapError.message)
  }, [heatmapResponse])

  const heatMapSize = useMemo(() => {
    return Math.max(...heatmapData.map(({ data }) => data.length)) || 48
  }, [heatmapData])

  return (
    <>
      <Page.Header
        title="Services"
        toolbar={
          <Container>
            <Select
              defaultSelectedItem={DEFAULT_RANGE}
              items={RangeOptions}
              onChange={({ value }: SelectOption) => {
                if (range?.selectedValue === value) return
                const selectedValue = value as number
                setRange({ selectedValue, dates: getRangeDates(selectedValue) })
                setHeatmapData([])
                const { start, end } = getRangeDates(value as number)
                getHeatmap({
                  queryParams: {
                    accountId: accountId,
                    projectIdentifier: projectIdentifier as string,
                    startTimeMs: start.valueOf(),
                    endTimeMs: end.valueOf()
                  }
                })
              }}
            />
          </Container>
        }
      />
      <Page.Body
        loading={loadingServices}
        noData={{
          when: () => services?.length === 0 && !servicesError?.message?.length,
          message: i18n.noDataText.noServicesConfigured,
          buttonText: i18n.noDataText.goBackToDataSourcePage,
          onClick: () => {
            history.push({
              pathname: routeCVDataSources.url({
                projectIdentifier: projectIdentifier as string,
                orgIdentifier: orgIdentifier as string
              })
            })
          },
          icon: 'error'
        }}
        error={servicesError?.message}
        retryOnError={() => {
          refetchServices()
        }}
      >
        <Container className={styles.servicesPage} background={Color.GREY_100}>
          <ServiceSelector
            className={styles.fixedServices}
            serviceData={services}
            onSelect={(envIdentifier?: string, serviceIdentifier?: string) => {
              setSelectedService({ serviceIdentifier, environmentIdentifier: envIdentifier })
              setHeatmapData([])
              getHeatmap({
                queryParams: {
                  accountId: accountId,
                  projectIdentifier: projectIdentifier as string,
                  startTimeMs: range.dates.start.valueOf(),
                  endTimeMs: range.dates.end.valueOf(),
                  serviceIdentifier,
                  envIdentifier
                }
              })
            }}
          />
          <Container className={styles.content}>
            <CategoryRiskCards
              categoryRiskCardClassName={styles.categoryRiskCard}
              environmentIdentifier={selectedService?.environmentIdentifier}
              serviceIdentifier={selectedService?.serviceIdentifier}
            />
            <Container className={styles.serviceBody}>
              <OverlaySpinner show={loadingHeatmap}>
                <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.BLACK}>
                  {i18n.heatmapSectionTitleText}
                </Text>
                <HeatMap
                  series={heatmapData}
                  minValue={0}
                  maxValue={1}
                  labelsWidth={80}
                  className={styles.serviceHeatMap}
                  mapValue={mapHeatmapValue}
                  renderTooltip={(cell: HeatMapDTO) => <HeatMapTooltip cell={cell} />}
                  cellShapeBreakpoint={0.5}
                  onCellClick={(cell: HeatMapDTO, rowData) => {
                    if (cell.startTime && cell.endTime) {
                      openDrillDown({
                        categoryRiskScore: cell.riskScore ? Math.floor(cell.riskScore * 100) : 0,
                        analysisProps: {
                          startTime: cell.startTime,
                          endTime: cell.endTime,
                          categoryName: rowData?.name,
                          environmentIdentifier: selectedService?.environmentIdentifier,
                          serviceIdentifier: selectedService?.serviceIdentifier
                        }
                      })
                    }
                  }}
                  rowSize={heatMapSize}
                />
                <AnalysisDrillDownView
                  className={styles.analysisView}
                  startTime={range.dates.start.valueOf()}
                  endTime={range.dates.end.valueOf()}
                  serviceIdentifier={selectedService?.serviceIdentifier}
                  environmentIdentifier={selectedService?.environmentIdentifier}
                />
              </OverlaySpinner>
            </Container>
          </Container>
        </Container>
      </Page.Body>
    </>
  )
}
