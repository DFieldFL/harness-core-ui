import React from 'react'

import MainNav from '@common/navigation/MainNav'
import SideNav from '@common/navigation/SideNav'

import { useSidebar } from '@common/navigation/SidebarProvider'

import css from './layouts.module.scss'

// eslint-disable-next-line @typescript-eslint/ban-types
export function DefaultLayout(props: React.PropsWithChildren<{}>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent } = useSidebar()

  return (
    <div className={css.main} data-layout="default">
      <MainNav />
      <SideNav title={title} subtitle={subtitle} icon={icon}>
        <NavComponent />
      </SideNav>
      <div className={css.children}>{props.children}</div>
    </div>
  )
}
