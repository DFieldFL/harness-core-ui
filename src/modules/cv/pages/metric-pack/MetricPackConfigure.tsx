import React, { FunctionComponent, useState, useEffect } from 'react'
import { accountId, projectIdentifier, RouteVerificationTypeToVerificationType } from 'modules/cv/constants'
import { fetchMetricPacks, saveGlobalMetricPacks } from '../../services/CVNextGenCVConfigService'
import css from './MetricPackConfigure.module.scss'
import ConfigureThreshold from './ConfigureThreshold'
import { MetricPackTable } from '../../components/MetricPackTable/MetricPackTable'
import { Button, OverlaySpinner, Text } from '@wings-software/uikit'

const MetricPackConfigure: FunctionComponent<any> = () => {
  const [isEditingThreshold, setIsEditingThreshold] = useState(false)
  const [metricPacks, setMetricPacks] = useState([])
  const [metricPacksThresholdData, setMetricPacksThresholdData] = useState([])
  const [inProgress, setInProgress] = useState(false)

  useEffect(() => {
    fetchExistingMetricPacks()
  }, [])

  async function fetchExistingMetricPacks() {
    setInProgress(true)
    const { response }: any = await fetchMetricPacks({
      accountId,
      projectId: projectIdentifier,
      dataSourceType: RouteVerificationTypeToVerificationType['app-dynamics'],
      group: 'metric-packs'
    })
    setMetricPacks(response.resource!)
    setInProgress(false)
  }

  function renderMetricTables(metrics: any) {
    return metrics.map((metric: any, index: number) => {
      return (
        <div key={index}>
          <MetricPackTable
            metrics={metric}
            metricPackName={metric.identifier}
            onConfigureThresholdClick={(data: any) => {
              setMetricPacksThresholdData(data)
              setIsEditingThreshold(true)
            }}
          />
        </div>
      )
    })
  }

  async function onSave(payload: any) {
    setInProgress(true)
    await saveGlobalMetricPacks({
      payload,
      accountId,
      projectId: projectIdentifier,
      dataSourceType: RouteVerificationTypeToVerificationType['app-dynamics'],
      group: 'metric-packs'
    })
    setInProgress(false)
  }

  function renderBody() {
    return (
      <OverlaySpinner show={inProgress}>
        <div>
          <div className={css.header}>
            <h3> Configure Metric Pack </h3>
            <Text> Add or remove metrics that make up a metric pack </Text>
          </div>

          <div className={css.packsContainer}>{renderMetricTables(metricPacks)}</div>

          <div className={css.actionButtons}>
            <Button
              large
              intent="primary"
              text="Save"
              width={120}
              onClick={() => {
                onSave(metricPacks)
              }}
              type="submit"
            />
          </div>
        </div>
      </OverlaySpinner>
    )
  }

  return (
    <div className={css.main}>
      <h2> Metric Packs </h2>
      {!isEditingThreshold ? (
        renderBody()
      ) : (
        <div className={css.thresholdSection}>
          <ConfigureThreshold
            metricPack={metricPacksThresholdData}
            dataSourceType={RouteVerificationTypeToVerificationType['app-dynamics']}
            onCancel={() => {
              setIsEditingThreshold(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default MetricPackConfigure
