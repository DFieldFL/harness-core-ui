import React, { useMemo, ElementType, useLayoutEffect } from 'react'
import { Container, Link, Icon } from '@wings-software/uikit'
import css from './Nav.module.scss'
import { useAppStoreReader } from 'framework/hooks/useAppStore'
import type { Route, NavEntry } from 'framework'
import cx from 'classnames'
import { routeParams } from 'framework/route/RouteMounter'

const ICON_SIZE = 24
const BOTTOM = 'BOTTOM'

const renderSidebarItem = (navEntry: NavEntry, route?: Route): JSX.Element => (
  <li key={navEntry.navId} className={cx(css.sidebarItem, navEntry.navId === route?.navId && css.selected)}>
    <Link noStyling href={navEntry.url(routeParams())} className={css.sidebarLink} title={navEntry.title}>
      <Icon name={navEntry.icon.normal} size={ICON_SIZE} />
    </Link>
  </li>
)
const renderMenu = (Menu?: ElementType): JSX.Element | null => (Menu ? <Menu /> : null)

export const Nav: React.FC<{ withoutMenu?: boolean }> = ({ withoutMenu = false }) => {
  const { route, navRegistry } = useAppStoreReader()
  const menu = useMemo(
    () => renderMenu(navRegistry?.find(({ navId }) => navId === route?.navId)?.menu as ElementType),
    [navRegistry, route] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useLayoutEffect(() => {
    document.querySelector(`.${css.beforeSelected}`)?.classList.remove(css.beforeSelected)
    document.querySelector(`.${css.selected}`)?.previousElementSibling?.classList.add(css.beforeSelected)
  }, [route])

  return (
    <Container flex className={cx(css.nav)}>
      <ul className={css.sidebar}>
        {navRegistry
          ?.filter(navEntry => navEntry.position !== BOTTOM)
          .map(navEntry => renderSidebarItem(navEntry, route))}
        <li className={css.spacer}></li>
        {navRegistry
          ?.filter(navEntry => navEntry.position === BOTTOM)
          .map(navEntry => renderSidebarItem(navEntry, route))}
      </ul>
      {!withoutMenu && <Container className={css.menu}>{menu}</Container>}
    </Container>
  )
}

export const NavWithoutMenu: React.FC = () => <Nav withoutMenu />
