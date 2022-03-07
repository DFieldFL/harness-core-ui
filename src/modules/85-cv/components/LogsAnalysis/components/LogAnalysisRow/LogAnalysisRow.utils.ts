/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import routes from '@common/RouteDefinitions'
import type { LogData } from 'services/cv'

export const getEventTypeFromClusterType = (tag: LogData['tag']): string => {
  switch (tag) {
    case 'KNOWN':
      return 'Known'
    case 'UNKNOWN':
      return 'Unknown'
    case 'UNEXPECTED':
      return 'Unexpected'
    default:
      return ''
  }
}

export const onClickErrorTrackingRow = (
  message: string,
  accountId: string,
  projectIdentifier: string,
  orgIdentifier: string
): void => {
  const rowMessageSplit = message.split('|')
  const timestamp = rowMessageSplit[rowMessageSplit.length - 1].trim()
  const requestId = rowMessageSplit[rowMessageSplit.length - 2].trim()
  const sid = rowMessageSplit[rowMessageSplit.length - 3].trim()

  // Make duration window 1 hour from timestamp
  const fromTimestamp = parseInt(timestamp) - 3600

  const arcJson = `{
          "service_id": "${sid}",
          "viewport_strings":{
            "from_timestamp":"${fromTimestamp}",
            "to_timestamp":"${timestamp}",
            "until_now":false,
            "machine_hashes":[],
            "agent_hashes":[],
            "deployment_hashes":[],
            "request_ids":[${requestId}]
          }
          ,"timestamp":"${timestamp}"
        }`

  const arcUrl = routes.toErrorTrackingArc({
    orgIdentifier: orgIdentifier,
    projectIdentifier: projectIdentifier,
    accountId: accountId
  })
  const baseUrl = window.location.href.split('#')[0]
  window.open(`${baseUrl}#${arcUrl}/arc?event=${btoa(arcJson)}`)
}
