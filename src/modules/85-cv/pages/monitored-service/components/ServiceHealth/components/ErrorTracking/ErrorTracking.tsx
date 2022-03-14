/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Heading, Card, NoDataCard, FontVariation } from '@wings-software/uicore'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import { useStrings } from 'framework/strings'
import ErrorTrackingAnalysis from '@cv/components/ErrorTrackingAnalysis/ErrorTrackingAnalysis'
import type { MetricsAndLogsProps } from '../MetricsAndLogs/MetricsAndLogs.types'
import css from './ErrorTracking.module.scss'

const ErrorTracking: React.FC<MetricsAndLogsProps> = props => {
  const { getString } = useStrings()

  const { startTime, endTime } = props

  return (
    <Container margin={{ bottom: 'medium' }}>
      <Heading level={2} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'small' }}>
        {getString('errors')}
      </Heading>

      {startTime && endTime ? (
        <Layout.Horizontal data-testid="error-tracking-analysis-view" spacing="medium">
          <Card className={css.metricsAndLogsCard}>
            <ErrorTrackingAnalysis {...props} startTime={startTime} endTime={endTime} />
          </Card>
        </Layout.Horizontal>
      ) : (
        <Card className={css.noServiceImageCard} data-testid="error-tracking-analysis-image-view">
          <NoDataCard
            image={noServiceAvailableImage}
            message={getString('cv.monitoredServices.serviceHealth.selectTimelineErrorTracking')}
            containerClassName={css.noDataCardContainer}
            className={css.noDataCard}
            imageClassName={css.noServiceImage}
          />
        </Card>
      )}
    </Container>
  )
}

export default ErrorTracking
