/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { Button, Color, Container, Layout, Text, TextInput, ButtonVariation } from '@wings-software/uicore'
import QRCode from 'react-qr-code'
import { TwoFactorAuthSettingsInfo, useEnableTwoFactorAuth, useGetTwoFactorAuthSettings } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PageSpinner, useToaster } from '@common/components'
import { CopyText } from '@common/components/CopyText/CopyText'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from '../useEnableTwoFactorAuthModal.module.scss'

interface EnableTwoFactorAuthViewProps {
  isReset: boolean
  onEnable: () => void
  onCancel: () => void
}

const EnableTwoFactorAuthView: React.FC<EnableTwoFactorAuthViewProps> = ({ isReset, onCancel, onEnable }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { mutate: enableTwoFactorAuth } = useEnableTwoFactorAuth({})
  const { updateAppStore } = useAppStore()

  const {
    data,
    refetch: refetchTwoFactorAuthSettings,
    loading
  } = useGetTwoFactorAuthSettings({
    authMechanism: 'TOTP'
  })

  const handleEnableTwoFactorAuth = async (settings?: TwoFactorAuthSettingsInfo): Promise<void> => {
    try {
      const enabled = await enableTwoFactorAuth({
        ...settings,
        twoFactorAuthenticationEnabled: true
      })
      if (enabled) {
        showSuccess(getString('userProfile.twoFactor.enableSuccess'))
        updateAppStore({ currentUserInfo: enabled.data })
        onEnable()
      }
    } catch (e) {
      showError(e.data.message || e.message)
    }
  }

  const authSettings = data?.data
  return (
    <>
      <Container className={css.view}>
        {authSettings ? (
          <>
            <Layout.Horizontal padding={{ top: 'large', bottom: 'huge' }}>
              <Layout.Vertical>
                <Text padding={{ bottom: 'large' }} color={Color.BLACK_100}>
                  {getString('userProfile.qrCode')}
                </Text>
                <Layout.Horizontal padding="medium" className={css.qrCode}>
                  <QRCode value={authSettings.totpqrurl || ''} />
                </Layout.Horizontal>
              </Layout.Vertical>
              <Layout.Vertical padding="huge" className={css.description}>
                <Text color={Color.BLACK}>{getString('userProfile.twoFactor.description')}</Text>
                <Layout.Vertical spacing="small" padding={{ top: 'large' }}>
                  <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
                    {getString('common.secretKey')}
                  </Text>
                  <TextInput
                    readOnly
                    value={authSettings.totpSecretKey}
                    rightElement={
                      (
                        <CopyText
                          className={css.copy}
                          iconName="duplicate"
                          textToCopy={authSettings.totpSecretKey || ''}
                          iconAlwaysVisible
                        />
                      ) as any
                    }
                  />
                </Layout.Vertical>
              </Layout.Vertical>
            </Layout.Horizontal>
            <Layout.Horizontal flex>
              <Layout.Horizontal spacing="small">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text={isReset ? getString('save') : getString('enable')}
                  onClick={() => handleEnableTwoFactorAuth(authSettings)}
                />
                <Button text={getString('cancel')} onClick={onCancel} variation={ButtonVariation.TERTIARY} />
              </Layout.Horizontal>
              <Button icon="reset" minimal onClick={() => refetchTwoFactorAuthSettings()} />
            </Layout.Horizontal>
          </>
        ) : null}
      </Container>
      {loading ? <PageSpinner /> : null}
    </>
  )
}

export default EnableTwoFactorAuthView
