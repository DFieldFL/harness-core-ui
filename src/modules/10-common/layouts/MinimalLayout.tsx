import React from 'react'

import MainNav from '@common/navigation/MainNav'

import css from './layouts.module.scss'

export function MinimalLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  return (
    <div className={css.main} data-layout="minimal">
      <MainNav />
      <div className={css.children}>{props.children}</div>
    </div>
  )
}
