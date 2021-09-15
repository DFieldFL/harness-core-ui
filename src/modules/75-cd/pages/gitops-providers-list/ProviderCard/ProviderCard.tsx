import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import {
  useModalHook,
  Button,
  Card,
  Layout,
  Text,
  Popover,
  Color,
  ButtonVariation,
  Container
} from '@wings-software/uicore'
import { Menu, Classes, Position, Dialog, Intent } from '@blueprintjs/core'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { ConnectedArgoGitOpsInfoDTO, GitopsProviderResponse, useDeleteGitOpsProvider } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TagsPopover } from '@common/components'
import { getGitOpsLogo } from '@cd/utils/GitOpsUtils'

import css from './ProviderCard.module.scss'

interface ProviderCardProps {
  provider: GitopsProviderResponse
  onDelete?: () => Promise<void>
  onEdit?: () => Promise<void>
}

const ProviderCard: React.FC<ProviderCardProps> = props => {
  const { provider, onDelete, onEdit } = props
  const { projectIdentifier, orgIdentifier, accountId } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const logo = getGitOpsLogo(provider.spec)
  const [menuOpen, setMenuOpen] = useState(false)

  const { mutate: deleteConnector } = useDeleteGitOpsProvider({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit && onEdit()
  }

  const getConfirmationDialogContent = (): JSX.Element => {
    return (
      <div className={'connectorDeleteDialog'}>
        <Text margin={{ bottom: 'medium' }} className={css.confirmText} title={provider.name}>
          {`${getString('cd.confirmProviderDelete')} ${provider.name}?`}
        </Text>
      </div>
    )
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getConfirmationDialogContent(),
    titleText: getString('cd.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteConnector(provider?.identifier || '', {
            headers: { 'content-type': 'application/json' }
          })

          if (deleted) {
            onDelete && onDelete()
            showSuccess(`Provider ${provider?.name} deleted`)
          }
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!provider.identifier) return
    openDialog()
  }

  const [openUploadCertiModal, closeUploadCertiModal] = useModalHook(() => {
    return (
      <Dialog
        onClose={closeUploadCertiModal}
        isOpen={true}
        style={{
          width: '100%',
          padding: '40px',
          position: 'relative',
          height: '100vh',
          background: 'none',
          margin: '0px'
        }}
        enforceFocus={false}
      >
        <div style={{}} className={css.frameContainer}>
          <div className={css.frameHeader}>
            <img className={css.argoLogo} src={logo} alt="" aria-hidden />
            {provider.name} - {(provider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl}
            <Button
              variation={ButtonVariation.ICON}
              icon="cross"
              className={css.closeIcon}
              iconProps={{ size: 18 }}
              onClick={closeUploadCertiModal}
              data-testid={'close-certi-upload-modal'}
              withoutCurrentColor
            />
          </div>
          <iframe
            id="argoCD"
            className={css.argoFrame}
            width="100%"
            frameBorder="0"
            name="argoCD"
            title="argoCD"
            src={(provider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl}
          ></iframe>
        </div>
      </Dialog>
    )
  })

  return (
    <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
      <Container className={css.projectInfo}>
        <div className={css.mainTitle}>
          <img className={css.argoLogo} src={logo} alt="" aria-hidden />

          <Layout.Horizontal className={css.layout}>
            <Popover
              isOpen={menuOpen}
              onInteraction={nextOpenState => {
                setMenuOpen(nextOpenState)
              }}
              className={Classes.DARK}
              position={Position.RIGHT_TOP}
            >
              <Button
                variation={ButtonVariation.ICON}
                className={css.iconMore}
                icon="more"
                color="grey-450"
                withoutCurrentColor
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              />
              <Menu style={{ minWidth: 'unset' }}>
                <Menu.Item icon="edit" text="Edit" onClick={handleEdit} />
                <Menu.Item icon="trash" text="Delete" onClick={handleDelete} />
              </Menu>
            </Popover>
          </Layout.Horizontal>
        </div>

        <Text
          lineClamp={1}
          font={{ weight: 'bold' }}
          margin={{ top: 'small' }}
          color={Color.GREY_800}
          data-testid={provider.identifier}
        >
          {provider.name}
        </Text>
        <Text lineClamp={1} font="small" color={Color.GREY_600} margin={{ top: 'xsmall' }}>
          {getString('idLabel', { id: provider.identifier })}
        </Text>

        {!isEmpty(provider.tags) && (
          <div className={css.tags}>
            <TagsPopover
              className={css.tagsPopover}
              iconProps={{ size: 14, color: Color.GREY_600 }}
              tags={defaultTo(provider.tags, {})}
            />
          </div>
        )}

        {!!provider.description?.length && (
          <Text
            font="small"
            lineClamp={2}
            color={Color.GREY_600}
            className={css.description}
            margin={{ top: 'xsmall' }}
          >
            {provider.description}
          </Text>
        )}
        <div className={css.urls}>
          <div className={css.serverUrl}>
            <Text font={{ size: 'small' }}>{getString('cd.argoAdapterURL')}:</Text>
            <Text intent={Intent.PRIMARY} font={{ size: 'small' }}>
              {(provider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl}
            </Text>
          </div>
        </div>
      </Container>
    </Card>
  )
}

export default ProviderCard
