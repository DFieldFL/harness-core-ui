import React, { ReactElement } from 'react'
import cx from 'classnames'
import { NavLink as Link, NavLinkProps } from 'react-router-dom'
import { Text, Layout, Color, IconName, Icon } from '@wings-software/uicore'
import css from './SideNav.module.scss'

export interface SideNavProps {
  subtitle?: string
  title?: string
  icon?: IconName
}

export default function SideNav(props: React.PropsWithChildren<SideNavProps>): ReactElement {
  return (
    <div className={css.main}>
      <div>{props.children}</div>
      <div className={css.titleContainer}>
        {props.icon ? (
          <div className={css.iconContainer}>
            <Icon className={css.icon} name={props.icon} size={350} />
          </div>
        ) : null}
        <Layout.Vertical>
          {props.subtitle ? (
            <Text font={{ size: 'small' }} color={Color.GREY_400}>
              {props.subtitle}
            </Text>
          ) : null}
          {props.title ? (
            <Text color={Color.WHITE} className={css.title}>
              {props.title}
            </Text>
          ) : null}
        </Layout.Vertical>
      </div>
    </div>
  )
}

interface SidebarLinkProps extends NavLinkProps {
  label: string
  icon?: IconName
  className?: string
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ label, icon, className, ...others }) => (
  <Link className={cx(css.link, className)} activeClassName={css.selected} {...others}>
    <Text icon={icon} className={css.text}>
      {label}
    </Text>
  </Link>
)
