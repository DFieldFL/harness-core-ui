import React, { useState } from 'react'
import cx from 'classnames'
import { Menu } from '@blueprintjs/core'
import { SelectOption, Layout, Color, Text, Button, Avatar, Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Select } from '@blueprintjs/select'
import { useToaster } from '@common/exports'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { useDeleteInvite, useUpdateInvite, InviteDTO } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import { InviteType } from '../Constants'
import css from './Steps.module.scss'

interface InviteListProps {
  user: InviteDTO
  projectIdentifier?: string
  orgIdentifier?: string
  roles: SelectOption[]
  reload: () => void
}
const CustomSelect = Select.ofType<SelectOption>()
const InviteListRenderer: React.FC<InviteListProps> = props => {
  const { user, reload, roles } = props
  const { accountId } = useParams()
  const { getString } = useStrings()
  const [approved, setApproved] = useState<boolean>(false)
  const { mutate: deleteInvite } = useDeleteInvite({ queryParams: { accountIdentifier: accountId } })
  const defaultRole = {
    label: getString('customText', { text: 'Assign a role' }),
    value: ''
  }
  const [role, setRole] = useState<SelectOption>(defaultRole)
  const { mutate: updateInvite } = useUpdateInvite({ inviteId: '', queryParams: { accountIdentifier: accountId } })
  const { showSuccess, showError } = useToaster()

  const handleUpdate = async (type: InviteType): Promise<void> => {
    const dataToSubmit: InviteDTO = {
      name: user.name,
      email: user.email,
      role: user.role,
      inviteType: type,
      approved: type === InviteType.USER_INITIATED ? true : false
    }
    try {
      const updated = await updateInvite(dataToSubmit, { pathParams: { inviteId: user.id || '' } })
      if (updated) reload()
      showSuccess(i18n.newProjectWizard.Collaborators.inviteSuccess)
    } catch (err) {
      showError(err.data)
    }
  }

  const handleDelete = async (): Promise<void> => {
    try {
      const deleted = await deleteInvite(user.id || '')
      if (deleted) reload()
      showSuccess(i18n.newProjectWizard.Collaborators.deleteSuccess)
    } catch (err) {
      showError(err.data)
    }
  }
  return (
    <Container className={css.invites} padding={{ left: 'xsmall', top: 'medium', bottom: 'medium' }}>
      {user?.inviteType == InviteType.ADMIN_INITIATED ? (
        <Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={cx(css.align, css.pendingUser)} width="60%">
            <Avatar email={user.email} size="normal" />
            <Layout.Vertical padding={{ left: 'small' }}>
              <Layout.Horizontal spacing="small">
                <Text font={{ weight: 'bold' }} color={Color.BLACK} className={css.name} lineClamp={1}>
                  {user.name}
                </Text>
                <Text
                  font={{ size: 'xsmall', weight: 'bold' }}
                  className={cx(css.colorBar, css.pending)}
                  color={Color.BLUE_500}
                >
                  {i18n.newProjectWizard.Collaborators.pendingInvitation}
                </Text>
              </Layout.Horizontal>
              <Text className={css.email} lineClamp={1}>
                {user.email}
              </Text>
              <Layout.Horizontal spacing="xsmall">
                <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
                  {i18n.newProjectWizard.Collaborators.roleAssigned}
                </Text>
                <Text font="xsmall" color={Color.BLUE_600} className={css.role} lineClamp={1}>
                  {user.role.name}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal width="40%" padding={{ right: 'medium' }} className={cx(css.align, css.toEnd)}>
            <Button
              inline
              minimal
              icon="refresh"
              onClick={() => {
                handleUpdate(InviteType.ADMIN_INITIATED)
              }}
            />
            <Button inline minimal icon="remove" iconProps={{ size: 20 }} onClick={handleDelete} />
          </Layout.Horizontal>
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={css.align} width="60%">
            <Avatar email={user.email} size="normal" />
            <Layout.Vertical padding={{ left: 'small' }}>
              <Layout.Horizontal spacing="small">
                <Text font={{ weight: 'bold' }} color={Color.BLACK} className={css.name} lineClamp={1}>
                  {user.name}
                </Text>
                <Text
                  font={{ size: 'xsmall', weight: 'bold' }}
                  className={cx(css.colorBar, css.request)}
                  color={Color.YELLOW_500}
                >
                  {i18n.newProjectWizard.Collaborators.requestAccess}
                </Text>
              </Layout.Horizontal>
              <Text className={css.email} lineClamp={1}>
                {user.email}
              </Text>
              <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
                {i18n.newProjectWizard.Collaborators.noRole}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal width="40%" padding={{ right: 'medium' }} className={cx(css.align, css.toEnd)}>
            {!approved ? (
              <Button
                inline
                minimal
                icon="command-approval"
                onClick={() => {
                  setApproved(true)
                }}
              />
            ) : (
              <Layout.Horizontal>
                <CustomSelect
                  items={roles}
                  filterable={false}
                  itemRenderer={(item, { handleClick }) => (
                    <div key={item.label}>
                      <Menu.Item
                        text={item.label}
                        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleClick(e)}
                      />
                    </div>
                  )}
                  onItemSelect={item => {
                    setRole(item)
                  }}
                  popoverProps={{ minimal: true }}
                >
                  <Button inline minimal rightIcon="chevron-down" text={role.label} />
                </CustomSelect>
                <Button
                  inline
                  minimal
                  icon="command-approval"
                  disabled={role === defaultRole}
                  onClick={() => {
                    handleUpdate(InviteType.USER_INITIATED)
                  }}
                />
              </Layout.Horizontal>
            )}
            <Button inline minimal icon="remove" onClick={handleDelete} />
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default InviteListRenderer
