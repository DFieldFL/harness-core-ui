import React, { useState, useEffect } from 'react'
import { Prompt } from 'react-router-dom'
import type * as History from 'history'
import { useStrings } from 'framework/exports'
import { useConfirmationDialog } from '../../modals/ConfirmDialog/useConfirmationDialog'

interface Props {
  when?: boolean
  textProps?: {
    contentText?: string
    titleText?: string
    confirmButtonText?: string
    cancelButtonText?: string
  }
  navigate: (path: string) => void
  shouldBlockNavigation?: (location: History.Location) => boolean
}
export const NavigationCheck = ({ when, navigate, shouldBlockNavigation, textProps }: Props): JSX.Element => {
  const [lastLocation, setLastLocation] = useState<History.Location | null>(null)
  const [confirmedNavigation, setConfirmedNavigation] = useState(false)
  const { getString } = useStrings()
  const handleBlockedNavigation = (nextLocation: History.Location): string | boolean => {
    if (!confirmedNavigation) {
      if (!shouldBlockNavigation || (shouldBlockNavigation && shouldBlockNavigation(nextLocation))) {
        openDialog()
        setLastLocation(nextLocation)
        return false
      }
    }
    return true
  }

  const handleConfirmNavigationClick = (): void => {
    setConfirmedNavigation(true)
  }

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: textProps?.cancelButtonText || getString('cancel'),
    contentText: textProps?.contentText || getString('navigationCheckText'),
    titleText: textProps?.titleText || getString('navigationCheckTitle'),
    confirmButtonText: textProps?.confirmButtonText || getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        handleConfirmNavigationClick()
      }
    }
  })

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      // Navigate to the previous blocked location with your navigate function
      navigate(lastLocation.pathname)
    }

    // reset back to false
    confirmedNavigation && setConfirmedNavigation(false)
  }, [confirmedNavigation, lastLocation])

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
    </>
  )
}
