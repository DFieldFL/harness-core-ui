/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import MainNav from '@common/navigation/MainNav'
import SideNav from '@common/navigation/SideNav'

import { useSidebar } from '@common/navigation/SidebarProvider'
import { TrialLicenseBanner } from '@common/components/Banners/TrialLicenseBanner'
import FeatureBanner from './FeatureBanner'

import css from './layouts.module.scss'

export function DefaultLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent } = useSidebar()

  return (
    <div className={css.main} data-layout="default">
      <MainNav />
      <SideNav title={title} subtitle={subtitle} icon={icon}>
        <NavComponent />
      </SideNav>
      <div className={css.rhs}>
        <TrialLicenseBanner />
        <FeatureBanner />
        <div className={css.children}>{props.children}</div>
      </div>
    </div>
  )
}
