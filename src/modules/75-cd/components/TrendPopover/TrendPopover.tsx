/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import { SparklineChart, SparklineChartProps } from '@common/components/SparklineChart/SparklineChart'
import { numberFormatter } from '@cd/components/Services/common'
import css from '@cd/components/TrendPopover/TrendPopover.module.scss'

export interface TrendPopoverProps {
  title?: string
  data: SparklineChartProps['data']
}

const Trend: React.FC<TrendPopoverProps> = props => {
  const { title, data } = props
  return (
    <Layout.Vertical padding={{ left: 'medium', right: 'medium', top: 'xsmall', bottom: 0 }} width={676} height={200}>
      <Layout.Horizontal flex={{ distribution: 'space-between', align: 'center-center' }} margin={{ bottom: 'xsmall' }}>
        <Text color={Color.GREY_600} font={{ weight: 'semi-bold' }}>
          {title}
        </Text>
        <Icon name="cross" size={16} className={cx(Classes.POPOVER_DISMISS, css.hover)} />
      </Layout.Horizontal>
      <SparklineChart
        data={data}
        options={{
          chart: { width: 646, height: 155 },
          plotOptions: {
            series: {
              marker: {
                enabled: true
              },
              dataLabels: {
                enabled: true,
                color: 'var(--grey-600)',
                formatter: /* istanbul ignore next */ function () {
                  return numberFormatter(this.y ? this.y : 0)
                }
              }
            }
          }
        }}
        sparklineChartContainerStyles={css.sparklineChartContainerStyles}
      />
    </Layout.Vertical>
  )
}

export const TrendPopover: React.FC<TrendPopoverProps> = props => {
  const { title, data, children } = props
  return (
    <Popover interactionKind={PopoverInteractionKind.CLICK} position={Position.RIGHT}>
      {children}
      <Trend title={title} data={data} />
    </Popover>
  )
}
