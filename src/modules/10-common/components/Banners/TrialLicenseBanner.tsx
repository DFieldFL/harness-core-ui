import React, { useState } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Text, Layout, Button, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import { useToaster } from '@common/components'
import { useExtendTrialLicense, StartTrialDTO } from 'services/cd-ng'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useExtendTrialOrFeedbackModal,
  FORM_TYPE,
  FeedbackFormValues
} from '@common/modals/ExtendTrial/useExtendTrialOrFeedbackModal'
import { useContactSalesModal, ContactSalesFormProps } from '@common/modals/ContactSales/useContactSalesModal'
import { Page } from '../Page/Page'
import css from './TrialLicenseBanner.module.scss'

interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
  setHasBanner?: (value: boolean) => void
  refetch?: () => void
}

export const TrialLicenseBanner = (trialBannerProps: TrialBannerProps): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { showError } = useToaster()
  const [display, setDisplay] = useState(true)
  const { module, expiryTime, licenseType, setHasBanner, refetch } = trialBannerProps
  const moduleName = module.toString().toLowerCase()
  const moduleDescription = getString(`${moduleName}.continuous` as keyof StringsMap)

  const days = Math.round(moment(expiryTime).diff(moment.now(), 'days', true))
  const isExpired = days < 0
  const expiredDays = Math.abs(days)
  const expiredClassName = isExpired ? css.expired : css.notExpired

  const descriptionModule = module === ModuleName.CF ? 'FF' : module
  const { mutate: extendTrial, loading } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const alertMsg = isExpired ? (
    <Text font={{ weight: 'semi-bold' }} icon="info" iconProps={{ size: 18, color: Color.RED_500 }}>
      {getString('common.banners.trial.expired.description', {
        expiredDays,
        moduleDescription
      })}
    </Text>
  ) : (
    <Text font={{ weight: 'semi-bold' }} icon="info" iconProps={{ size: 18, color: Color.ORANGE_500 }}>
      {getString('common.banners.trial.description', {
        descriptionModule,
        days,
        moduleDescription
      })}
    </Text>
  )

  const { openContactSalesModal } = useContactSalesModal({
    onSubmit: (_values: ContactSalesFormProps) => {
      // TO-DO: call the API
    }
  })

  const { openExtendTrialOrFeedbackModal } = useExtendTrialOrFeedbackModal({
    onSubmit: (_values: FeedbackFormValues) => {
      // TO-DO: call the feed back api
      if (isExpired) {
        refetch?.()
      }
    },
    onCloseModal: () => {
      if (isExpired) {
        refetch?.()
      }
    },
    module,
    expiryDateStr: moment(expiryTime).format('MMMM D YYYY'),
    formType: isExpired ? FORM_TYPE.EXTEND_TRIAL : FORM_TYPE.FEEDBACK,
    moduleDescription
  })

  const handleExtendTrial = async (): Promise<void> => {
    try {
      const data = await extendTrial({ moduleType: module as StartTrialDTO['moduleType'] })
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module as any, data?.data)
      openExtendTrialOrFeedbackModal()
    } catch (error) {
      showError(error.data?.message)
    }
  }

  if (licenseType !== 'TRIAL' || !display) {
    setHasBanner?.(false)
    return <></>
  }

  const getExtendOrFeedBackBtn = (): React.ReactElement => {
    if (!isExpired) {
      return (
        <Button
          onClick={openExtendTrialOrFeedbackModal}
          padding={'small'}
          intent={'none'}
          color={Color.PRIMARY_7}
          className={css.extendTrial}
        >
          {getString('common.banners.trial.provideFeedback')}
        </Button>
      )
    }
    if (expiredDays > 14) {
      return <></>
    }
    return (
      <Button
        onClick={handleExtendTrial}
        padding={'small'}
        intent={'none'}
        color={Color.PRIMARY_7}
        className={css.extendTrial}
        disabled={loading}
      >
        {getString('common.banners.trial.expired.extendTrial')}
      </Button>
    )
  }

  return (
    <Page.Header
      className={cx(css.trialLicenseBanner, expiredClassName)}
      title={''}
      content={
        <Layout.Horizontal spacing="xxxlarge">
          <Layout.Horizontal spacing="small" padding={{ right: 'xxxlarge' }}>
            {alertMsg}
          </Layout.Horizontal>
          <Button
            className={css.contactSales}
            border={{ color: Color.PRIMARY_7 }}
            padding="xsmall"
            text={getString('common.banners.trial.contactSales')}
            onClick={openContactSalesModal}
          />
          {getExtendOrFeedBackBtn()}
        </Layout.Horizontal>
      }
      toolbar={
        <Button
          aria-label="close banner"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setDisplay(false), setHasBanner?.(false)
          }}
        />
      }
    />
  )
}
