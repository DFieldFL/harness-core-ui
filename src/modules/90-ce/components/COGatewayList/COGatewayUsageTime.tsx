import React, { useEffect, useState } from 'react'
import { Text, Color } from '@wings-software/uicore'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { Page } from '@common/components/Page/Page'
import Table from '@common/components/Table/Table'
import { Service, SessionReportRow, useGatewaySessionReport } from 'services/lw'
import css from './COGatewayList.module.scss'

interface COGatewayUsageTimeProps {
  service: Service
}
function convertToDuration(t: number): string {
  const durationMap = []
  const cd = 24 * 60 * 60 * 1000,
    ch = 60 * 60 * 1000
  let d = Math.floor(t / cd),
    h = Math.floor((t - d * cd) / ch),
    m = Math.round((t - d * cd - h * ch) / 60000)
  const pad = function (n: number) {
    return n < 10 ? '0' + n : n
  }
  if (m === 60) {
    h++
    m = 0
  }
  if (h === 24) {
    d++
    h = 0
  }
  if (d > 0) {
    durationMap.push(`${d} d`)
  }
  if (h > 0) {
    durationMap.push(`${pad(h)} h`)
  }
  if (m > 0) {
    durationMap.push(`${pad(m)} m`)
  }
  return durationMap.join(' ')
}
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'
const today = () => moment()
const startOfDay = (time: moment.Moment) => time.startOf('day').toDate()
const endOfDay = (time: moment.Moment) => time.endOf('day').toDate()
function TableCell(tableProps: CellProps<SessionReportRow>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function DurationCell(tableProps: CellProps<SessionReportRow>): JSX.Element {
  const milliseconds = tableProps.value * 60 * 60 * 1000
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {convertToDuration(milliseconds)}
    </Text>
  )
}
const COGatewayUsageTime: React.FC<COGatewayUsageTimeProps> = props => {
  const { orgIdentifier } = useParams<{
    orgIdentifier: string
  }>()
  const { mutate: getSessionReport } = useGatewaySessionReport({
    org_id: orgIdentifier // eslint-disable-line
  })
  const [sessionReportRows, setSessionReportRows] = useState<SessionReportRow[]>([])
  useEffect(() => {
    if (!props.service) return
    loadSessionReport()
  }, [props.service])
  const loadSessionReport = async (): Promise<void> => {
    try {
      const result = await getSessionReport({
        from: moment(startOfDay(today().subtract(7, 'days'))).format(DATE_FORMAT),
        to: moment(endOfDay(today())).format(DATE_FORMAT),
        report_name: 'GATEWAY-SESSION-WISE', // eslint-disable-line
        service_ids: [props.service.id as number], // eslint-disable-line
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      if (result && result.response && result.response.rows) {
        setSessionReportRows(result.response.rows)
      }
    } catch (e) {
      //   modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }
  return (
    <Page.Body className={css.pageContainer}>
      <Table<SessionReportRow>
        data={sessionReportRows}
        className={css.table}
        columns={[
          {
            accessor: 'start',
            Header: 'Started At',
            width: '35%',
            Cell: TableCell
          },
          {
            accessor: 'end',
            Header: 'Ended At',
            width: '35%',
            Cell: TableCell
          },
          {
            accessor: 'hours',
            Header: 'Duration',
            width: '30%',
            Cell: DurationCell
          }
        ]}
      />
    </Page.Body>
  )
}

export default COGatewayUsageTime
