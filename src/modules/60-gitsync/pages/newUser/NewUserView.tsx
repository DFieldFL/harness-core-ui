import React from 'react'

import { Button, Text, Container, Icon, Color } from '@wings-software/uicore'

import { noop } from 'lodash-es'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/exports'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import css from './NewUserView.module.scss'

const NewUserView: React.FC = () => {
  const { updateAppStore } = useAppStore()
  const { refreshStore } = useGitSyncStore()

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: () => {
      refreshStore()
      updateAppStore({ isGitSyncEnabled: true })
    },
    onClose: noop
  })
  const { getString } = useStrings()
  return (
    <Container className={css.pageContainer}>
      <Container padding={{ bottom: 'large' }}>
        <Icon size={120} name="git-landing-page" />
      </Container>

      <Text margin="medium" color={Color.GREY_600} font={{ size: 'large', weight: 'semi-bold' }}>
        {getString('enableGitExperience')}
      </Text>
      <Text>{getString('gitExperienceNewUserText')}</Text>
      <Button
        intent="primary"
        margin="large"
        font={{ size: 'medium' }}
        className={css.gitEnableBtn}
        text={getString('enableGitExperience')}
        onClick={() => openGitSyncModal(true, false, undefined)}
      />
    </Container>
  )
}

export default NewUserView
