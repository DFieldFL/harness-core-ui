import React, { ReactElement } from 'react'
import { Container, FormInput, Layout, Text, Color, Icon, FontVariation, Heading } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './SaveFlagToGitSubForm.module.scss'

export interface SaveFlagToGitSubFormProps {
  title?: string
  subtitle?: string
  flagName?: string
  hideNameField?: boolean
}

const SaveFlagToGitSubForm = ({ title, subtitle, hideNameField }: SaveFlagToGitSubFormProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <>
      {title && (
        <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xlarge' }}>
          {title}
        </Heading>
      )}

      <Layout.Vertical spacing="small">
        {subtitle && (
          <Heading level={5} font={{ variation: FontVariation.H5 }}>
            {subtitle}
          </Heading>
        )}
        {!hideNameField && (
          <Container width="50%">
            <FormInput.InputWithIdentifier
              inputName="flagName"
              inputLabel={getString('name')}
              idName="flagIdentifier"
              isIdentifierEditable={false}
              inputGroupProps={{ disabled: true }}
            />
          </Container>
        )}

        <Container>
          <Heading level={4} font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }} color={Color.GREY_600}>
            {getString('common.gitSync.harnessFolderLabel')}
          </Heading>
          <Layout.Horizontal className={css.formRow} spacing="small">
            <FormInput.Text name="gitDetails.repoIdentifier" label={getString('common.git.selectRepoLabel')} disabled />
            <FormInput.Text
              name="gitDetails.rootFolder"
              label={getString('common.gitSync.harnessFolderLabel')}
              disabled
            />
          </Layout.Horizontal>
          <FormInput.Text name="gitDetails.filePath" label={getString('common.git.filePath')} disabled />
        </Container>
        <Container>
          <Heading level={4} font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }} color={Color.GREY_600}>
            {getString('common.gitSync.commitDetailsLabel')}
          </Heading>
          <FormInput.TextArea
            name="gitDetails.commitMsg"
            label={getString('common.git.commitMessage')}
            placeholder={getString('common.git.commitMessage')}
          />

          <Container flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <Icon name="git-branch-existing"></Icon>
            <Text margin={{ left: 'small', right: 'small' }} inline>
              {getString('common.git.existingBranchCommitLabel')}:
            </Text>
            <FormInput.Text name="gitDetails.branch" disabled style={{ marginBottom: 0 }} />
          </Container>

          <Container padding={{ left: 'xlarge', top: 'small' }} data-testid="commit-details-section">
            <FormInput.CheckBox large name="autoCommit" label={getString('cf.creationModal.git.autoCommitMessage')} />
          </Container>
        </Container>
      </Layout.Vertical>
    </>
  )
}

export default SaveFlagToGitSubForm
