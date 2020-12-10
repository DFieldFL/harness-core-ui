import { Card, Color, Container, Icon, Layout, Text, CardBody, AvatarGroup } from '@wings-software/uikit'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Menu, Classes } from '@blueprintjs/core'
import { OrganizationAggregateDTO, useDeleteOrganization } from 'services/cd-ng'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'

import { useToaster } from '@common/exports'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import i18n from './OrganizationCard.i18n'
import css from './OrganizationCard.module.scss'

interface OrganizationCardProps {
  data: OrganizationAggregateDTO
  width?: number
  isPreview?: boolean
  reloadOrgs?: () => void
  editOrg?: () => void
  inviteCollab?: () => void
  onClick?: () => void
}

export const OrganizationCard: React.FC<OrganizationCardProps> = props => {
  const { data: organizationAggregateDTO, isPreview, onClick, editOrg, reloadOrgs, inviteCollab } = props
  const { accountId } = useParams()
  const { showSuccess, showError } = useToaster()
  const {
    organizationResponse: { organization: data },
    projectsCount,
    admins,
    collaborators
  } = organizationAggregateDTO
  const orgMembers = admins?.concat(collaborators || [])
  const { mutate: deleteOrg } = useDeleteOrganization({ queryParams: { accountIdentifier: accountId } })

  const { openDialog } = useConfirmationDialog({
    contentText: i18n.confirmDelete(data.name || ''),
    titleText: i18n.confirmDeleteTitle,
    confirmButtonText: i18n.delete,
    cancelButtonText: i18n.cancelButton,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteOrg(data.identifier || '', { headers: { 'content-type': 'application/json' } })
          if (deleted) showSuccess(i18n.successMessage(data.name || ''))
          reloadOrgs?.()
        } catch (err) {
          showError(err)
        }
      }
    }
  })
  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    editOrg?.()
  }

  const handleInvite = (e: React.MouseEvent): void => {
    e.stopPropagation()
    inviteCollab?.()
  }

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (!data?.identifier) return
    openDialog()
  }

  return (
    <Card elevation={2} interactive={!isPreview} className={css.card} onClick={onClick}>
      <Container className={css.overflow}>
        {!isPreview ? (
          <CardBody.Menu
            menuContent={
              <Menu>
                <Menu.Item icon="edit" text={i18n.edit} onClick={handleEdit} />
                <Menu.Item icon="new-person" text={i18n.invite} onClick={handleInvite} />
                <Menu.Item icon="trash" text={i18n.delete} onClick={handleDelete} />
              </Menu>
            }
            menuPopoverProps={{
              className: Classes.DARK
            }}
            className={css.cardMenu}
          />
        ) : null}
        <Layout.Vertical className={css.title} padding={{ right: isPreview ? 'large' : undefined }}>
          <Text font="medium" color={Color.BLACK} lineClamp={1}>
            {data?.name || i18n.placeholder.name}
          </Text>
          <Layout.Horizontal className={css.description}>
            {data?.description ? (
              <Text color={Color.GREY_350} lineClamp={2}>
                {data.description}
              </Text>
            ) : null}
          </Layout.Horizontal>
          <TagsRenderer tags={data.tags || {}} className={css.tags} />
          <Layout.Horizontal padding={{ top: 'xlarge' }}>
            <Layout.Vertical spacing="small">
              <Layout.Horizontal spacing="small" flex={{ align: 'center-center' }}>
                <Icon name="nav-project" size={25}></Icon>
                <Text font="medium">{projectsCount}</Text>
              </Layout.Horizontal>
              <Text font="xsmall">{i18n.projects.toUpperCase()}</Text>
            </Layout.Vertical>
            <Layout.Vertical padding={{ left: 'huge' }} spacing="small" flex>
              <AvatarGroup
                avatars={orgMembers?.length ? orgMembers : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  inviteCollab?.()
                }}
              />
              <Text font="xsmall">{i18n.orgMembers.toUpperCase()}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    </Card>
  )
}
