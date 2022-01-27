/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import { validateReturnUrl } from '@common/utils/routeUtils'
import { useQueryParams } from '@common/hooks'

interface RedirectQueryParams {
  returnUrl?: string
}
export default function RedirectPage(): JSX.Element {
  const { returnUrl } = useQueryParams<RedirectQueryParams>({})

  useEffect(() => {
    if (!returnUrl) {
      return
    }

    if (validateReturnUrl(returnUrl)) {
      window.location.href = returnUrl
      return
    }

    window.location.href = getLoginPageURL({})
  }, [returnUrl])

  return <div>Redirecting...</div>
}
