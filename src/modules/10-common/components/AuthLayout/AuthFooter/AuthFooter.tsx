import React from 'react'
import { Icon, Text, Container } from '@wings-software/uicore'

import { OAuthProviderType, OAuthProviders, URLS } from '@common/constants/OAuthProviders'

import { useStrings } from 'framework/strings'
import SegmentTracker from '@common/utils/SegmentTracker'
import { SignupActions } from '@common/constants/TrackingConstants'
import css from './AuthFooter.module.scss'

export enum AuthPage {
  SignIn,
  SignUp
}

interface AuthFooterProps {
  page: AuthPage
}

const AuthFooter: React.FC<AuthFooterProps> = ({ page }) => {
  const { getString } = useStrings()
  return (
    <>
      <h2 className={css.lineMessage}>
        <span className={css.message}>
          {page === AuthPage.SignUp ? getString('signUp.oAuth.signup') : getString('signUp.oAuth.signin')}
        </span>
      </h2>

      <Container padding="large">
        <div className={css.oAuthIcons}>
          {OAuthProviders.map((oAuthProvider: OAuthProviderType) => {
            const { iconName, type, url } = oAuthProvider

            const link = `${URLS.OAUTH}api/users/${url}`

            return (
              <a
                className={css.iconContainer}
                key={type}
                href={link}
                rel="noreferrer"
                target="_blank"
                onClick={() => {
                  SegmentTracker.track(SignupActions.OauthSignup, { type: type })
                }}
              >
                <Icon name={iconName} size={24} />
              </a>
            )
          })}
        </div>
        {page === AuthPage.SignUp ? (
          <div className={css.disclaimer}>
            {getString('signUp.disclaimer.initial')}
            <a className={css.externalLink} href={URLS.PRIVACY_AGREEMENT} rel="noreferrer" target="_blank">
              {getString('signUp.disclaimer.privacyPolicy')}
            </a>
            {getString('signUp.disclaimer.middle')}
            <a className={css.externalLink} href={URLS.SUBSCRIPTION_TERMS} rel="noreferrer" target="_blank">
              {getString('signUp.disclaimer.terms')}
            </a>
          </div>
        ) : (
          <button className={css.ssoButton}>
            <Text icon="cloud-sso" iconProps={{ className: css.icon, size: 24 }} className={css.text}>
              {getString('signUp.ssoButton')}
            </Text>
          </button>
        )}
      </Container>
    </>
  )
}

export default AuthFooter
