import React from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { throttle } from 'lodash-es'

const STREAM_ENDPOINT = `${window.apiUrl || ''}/log-service/stream`

export interface UseLogsStreamProps {
  queryParams: {
    key: string
    accountId: string
  }
  headers: Record<string, any>
  unitId: string
  throttleTime?: number
}

export interface UseLogsStreamReturn {
  log: string
  unitId: string
  startStream(props: UseLogsStreamProps): void
  closeStream(): void
}

export function useLogsStream(): UseLogsStreamReturn {
  const eventSource = React.useRef<null | EventSource>(null)
  const [log, setLog] = React.useState('')
  const [unitId, setUnitId] = React.useState('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSetLog = React.useCallback(throttle(setLog, 2000), [setLog])

  const closeStream = React.useCallback(() => {
    eventSource.current?.close()
    throttledSetLog.cancel()
    eventSource.current = null
  }, [throttledSetLog])

  const startStream = React.useCallback(
    (props: UseLogsStreamProps): void => {
      closeStream()
      setLog('')

      let cache = ''

      setUnitId(props.unitId)

      const currentEventSource: EventSource = new EventSourcePolyfill(
        `${STREAM_ENDPOINT}?accountID=${props.queryParams.accountId}&key=${props.queryParams.key}`,
        { headers: props.headers }
      )

      eventSource.current = currentEventSource

      currentEventSource.onmessage = (e: MessageEvent) => {
        if (e.type === 'error') {
          currentEventSource.close()
        }

        if (e.data) {
          cache += `\n${e.data}`
          throttledSetLog(cache.trim())
        }
      }

      currentEventSource.onerror = (e: Event) => {
        if (e.type === 'error') {
          currentEventSource.close()
        }
      }
    },
    [throttledSetLog, closeStream]
  )

  return { log, startStream, closeStream, unitId }
}
