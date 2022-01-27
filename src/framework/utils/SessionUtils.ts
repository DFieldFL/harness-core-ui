/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

interface GetLoginPageURL {
  returnUrl?: string
}

export const getLoginPageURL = ({ returnUrl }: GetLoginPageURL): string => {
  const basePath = window.HARNESS_ENABLE_NG_AUTH_UI
    ? '/auth/#/signin'
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/login` // pick current path, but remove `/ng/`

  return returnUrl
    ? `${basePath}?action=signout&returnUrl=${encodeURIComponent(returnUrl)}`
    : `${basePath}?action=signout`
}

export const getForgotPasswordURL = (): string => {
  return window.HARNESS_ENABLE_NG_AUTH_UI
    ? '/auth/#/forgot-password'
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/forgot-password`
}
