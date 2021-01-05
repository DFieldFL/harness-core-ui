import React from 'react'
import { Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import cx from 'classnames'
import { Container, Heading, Icon, Text, IconName, Popover } from '@wings-software/uicore'
import { NavLink } from 'react-router-dom'
import i18n from './AdminSelector.i18n'
import css from './AdminSelector.module.scss'

export interface AdminSelectorProps {
  selected?: boolean
  path: string
}

export const AdminSelector: React.FC<AdminSelectorProps> = ({ children, path }) => {
  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.RIGHT}
      modifiers={{ offset: { offset: -50 } }}
      minimal
      portalClassName={css.portal}
      fill={true}
    >
      <NavLink className={css.adminLink} activeClassName={css.active} to={path} onClick={e => e.preventDefault()}>
        {i18n.admin}
      </NavLink>
      <Container width={300} padding="medium">
        <Heading level={2} font={{ weight: 'semi-bold' }} padding="small" margin={{ bottom: 'large' }}>
          {i18n.adminSelector}
        </Heading>
        <Container className={cx(css.grid, Classes.POPOVER_DISMISS)}>{children}</Container>
      </Container>
    </Popover>
  )
}

export interface AdminSelectorLinkProps {
  to: string
  label: string
  iconName: IconName
  disabled?: boolean
}

export const AdminSelectorLink: React.FC<AdminSelectorLinkProps> = ({ to, label, iconName, disabled }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if (disabled) e.preventDefault()
  }

  return (
    <NavLink className={cx(css.link, Classes.POPOVER_DISMISS)} to={to} onClick={handleLinkClick}>
      <Icon name={iconName} size={24} className={css.linkIcon} />
      <Text inline style={{ paddingTop: 'var(--spacing-medium)' }} className={css.text}>
        {label}
      </Text>
    </NavLink>
  )
}
