/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { capitalize, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  Text,
  Layout,
  Button,
  FontVariation,
  Color,
  PageSpinner,
  ButtonVariation,
  ButtonSize
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { useToaster } from '@common/components'
import type { Module } from 'framework/types/ModuleName'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  useExtendTrialLicense,
  StartTrialDTO,
  useSaveFeedback,
  FeedbackFormDTO,
  useGetLicensesAndSummary,
  GetLicensesAndSummaryQueryParams
} from 'services/cd-ng'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useExtendTrialOrFeedbackModal,
  FORM_TYPE,
  FeedbackFormValues
} from '@common/modals/ExtendTrial/useExtendTrialOrFeedbackModal'
import { Editions } from '@common/constants/SubscriptionTypes'
import css from './TrialLicenseBanner.module.scss'

export const BANNER_KEY = 'license_banner_dismissed'

export const TrialLicenseBanner = (): React.ReactElement => {
  const { getString } = useStrings()
  const { module } = useModuleInfo()
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { showError, showSuccess } = useToaster()
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<Partial<Record<Module, boolean>>>(
    BANNER_KEY,
    {},
    window.sessionStorage
  )

  const {
    data,
    refetch,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: module?.toUpperCase() as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId,
    lazy: module === undefined || isBannerDismissed[module]
  })

  const { maxExpiryTime, edition, licenseType } = data?.data || {}
  const updatedLicenseInfo = data?.data &&
    module && {
      ...licenseInformation?.[module.toUpperCase()],
      ...pick(data?.data, ['licenseType', 'edition']),
      expiryTime: maxExpiryTime
    }

  useEffect(() => {
    if (module) {
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const days = Math.round(moment(maxExpiryTime).diff(moment.now(), 'days', true))
  const isExpired = days < 0
  const expiredDays = Math.abs(days)
  const expiredClassName = isExpired ? css.expired : css.notExpired

  const moduleDescriptionMap: Record<string, keyof StringsMap> = {
    cd: 'cd.continuous',
    ce: 'ce.continuous',
    cf: 'cf.continuous',
    ci: 'ci.continuous',
    cv: 'cv.continuous'
  }
  const moduleDescription = (module && getString(moduleDescriptionMap[module])) || ''

  const descriptionModuleMap: Record<string, keyof StringsMap> = {
    cd: 'common.module.cd',
    ce: 'common.module.ce',
    cf: 'common.module.cf',
    ci: 'common.module.ci',
    cv: 'common.module.cv'
  }
  const descriptionModule = module && getString(descriptionModuleMap[module])

  const { mutate: extendTrial, loading: extendingTrial } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  const alertMsg = isExpired ? (
    <Text
      color={Color.WHITE}
      font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
      icon="issue"
      iconProps={{ padding: { right: 'small' }, className: css.issueIcon }}
    >
      {getString('common.banners.trial.expired.description', {
        expiredDays,
        moduleDescription
      })}
    </Text>
  ) : (
    <Text
      color={Color.PRIMARY_10}
      font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
      icon="info-message"
      iconProps={{ padding: { right: 'small' }, size: 25, className: css.infoIcon }}
    >
      {getString('common.banners.trial.description', {
        module: descriptionModule,
        days,
        moduleDescription,
        edition: capitalize(edition)
      })}
    </Text>
  )
  const { mutate: saveFeedback, loading: sendingFeedback } = useSaveFeedback({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleFeedbackSubmit = async (values: FeedbackFormValues): Promise<void> => {
    try {
      await saveFeedback({
        accountId,
        moduleType: module as FeedbackFormDTO['moduleType'],
        email: currentUserInfo.email,
        score: Number(values.experience),
        suggestion: values.suggestion
      }).then(() => {
        if (isExpired) {
          refetch?.()
        } else {
          closeExtendTrialOrFeedbackModal()
        }
      })
      showSuccess(getString('common.banners.trial.feedbackSuccess'))
    } catch (error) {
      showError(error.data?.message || error.message)
    }
  }

  const { openExtendTrialOrFeedbackModal, closeExtendTrialOrFeedbackModal } = useExtendTrialOrFeedbackModal({
    onSubmit: handleFeedbackSubmit,
    onCloseModal: () => {
      if (isExpired) {
        refetch?.()
      }
    },
    module: module || '',
    expiryDateStr: moment(maxExpiryTime).format('MMMM D YYYY'),
    formType: isExpired ? FORM_TYPE.EXTEND_TRIAL : FORM_TYPE.FEEDBACK,
    moduleDescription,
    loading: sendingFeedback
  })

  const handleExtendTrial = async (): Promise<void> => {
    try {
      const extendedData = await extendTrial({
        moduleType: module as StartTrialDTO['moduleType'],
        edition: Editions.ENTERPRISE
      })
      if (module) {
        handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, extendedData?.data)
      }
      openExtendTrialOrFeedbackModal()
    } catch (error) {
      showError(error.data?.message || error.message)
    }
  }

  const loading = extendingTrial || loadingContactSales || sendingFeedback || gettingLicense

  const getExtendOrFeedBackBtn = (): React.ReactElement => {
    if (!isExpired) {
      return (
        <Text
          onClick={openExtendTrialOrFeedbackModal}
          color={Color.PRIMARY_7}
          className={css.link}
          flex={{ alignItems: 'center' }}
        >
          {getString('common.banners.trial.provideFeedback')}
        </Text>
      )
    }
    if (expiredDays > 14) {
      return <></>
    }
    return (
      <Text onClick={handleExtendTrial} color={Color.WHITE} className={css.link} flex={{ alignItems: 'center' }}>
        {getString('common.banners.trial.expired.extendTrial')}
      </Text>
    )
  }

  const contactSalesLink = (
    <Layout.Horizontal padding={{ left: 'large' }} flex={{ alignItems: 'center' }}>
      <Text onClick={openMarketoContactSales} color={isExpired ? Color.WHITE : Color.PRIMARY_6} className={css.link}>
        {getString('common.banners.trial.contactSales')}
      </Text>
      <Text padding={{ left: 'small', right: 'small' }} color={isExpired ? Color.WHITE : Color.PRIMARY_6}>
        {'or'}
      </Text>
    </Layout.Horizontal>
  )

  if (module === undefined || isBannerDismissed[module] || licenseType !== 'TRIAL') {
    return <></>
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className={cx(css.trialLicenseBanner, expiredClassName)}>
      <Layout.Horizontal width="95%" padding={{ left: 'large' }}>
        {alertMsg}
        {contactSalesLink}
        {getExtendOrFeedBackBtn()}
      </Layout.Horizontal>
      <Button
        variation={ButtonVariation.ICON}
        size={ButtonSize.LARGE}
        icon="cross"
        data-testid="trial-banner-dismiss"
        onClick={() => setIsBannerDismissed(prev => (module ? { ...prev, [module]: true } : prev))}
      />
    </div>
  )
}
