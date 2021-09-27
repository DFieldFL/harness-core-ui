import React, { useState } from 'react'
import { defaultTo, first } from 'lodash-es'
import { Text, Button, Icon, Utils, Container } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'

import type { CIBuildCommit } from 'services/ci'
import { String, useStrings } from 'framework/strings'
import { UserLabel, TimeAgoPopover } from '@common/exports'

import css from './CommitsInfo.module.scss'

export interface CommitIdProps {
  commitId: string
  commitLink: string
}

export function CommitId({ commitId, commitLink }: CommitIdProps): React.ReactElement {
  const [isCommitIdCopied, setIsCommitIdCopied] = useState(false)
  const { getString } = useStrings()

  const handleCommitIdClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    Utils.copy(commitLink)
    setIsCommitIdCopied(true)
  }

  const handleCommitIdTooltipClosed = (): void => {
    setIsCommitIdCopied(false)
  }

  return (
    <Text className={css.commitId} style={{ cursor: 'pointer' }}>
      {commitId && (
        <a className={css.label} href={commitLink} rel="noreferrer" target="_blank">
          {commitId.slice(0, 7)}
        </a>
      )}
      <Text
        tooltip={
          <Container padding="small">{getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}</Container>
        }
        tooltipProps={{
          onClosed: handleCommitIdTooltipClosed
        }}
        style={{ cursor: 'pointer' }}
      >
        <Icon name="copy" size={14} onClick={handleCommitIdClick} />
      </Text>
    </Text>
  )
}

export interface LastCommitProps {
  lastCommit?: CIBuildCommit
}

export function LastCommit({ lastCommit }: LastCommitProps): React.ReactElement {
  return (
    <Text className={css.lastCommit} style={{ cursor: 'pointer' }}>
      <Icon className={css.icon} name="git-commit" size={14} />
      <div style={{ fontSize: 0 }}>
        <Text className={css.message} tooltip={<Container padding="small">{lastCommit?.message}</Container>}>
          {lastCommit?.message}
        </Text>
      </div>
      {lastCommit?.id && lastCommit?.link && <CommitId commitId={lastCommit.id} commitLink={lastCommit.link} />}
    </Text>
  )
}

export interface CommitsInfoProps {
  commits?: CIBuildCommit[]
}

export function CommitsInfo(props: CommitsInfoProps): React.ReactElement | null {
  const { commits = [] } = props
  const lastCommit = first(commits || [])

  const [showCommits, setShowCommits] = React.useState(false)

  function toggleCommits(e: React.SyntheticEvent): void {
    e.stopPropagation()
    setShowCommits(status => !status)
  }

  if (!lastCommit) return null

  return (
    <div className={css.commitsInfo}>
      <LastCommit lastCommit={lastCommit} />
      {commits && commits.length > 1 ? (
        <React.Fragment>
          <div className={css.divider} data-show={showCommits} />
          <Button
            minimal
            icon={showCommits ? 'minus' : 'plus'}
            className={css.moreCommits}
            iconProps={{ size: 8 }}
            onClick={toggleCommits}
          >
            <String stringID="ci.moreCommitsLabel" />
          </Button>

          <Collapse isOpen={showCommits}>
            {commits.slice(1).map((commit, i) => {
              return (
                <div className={css.commit} key={i}>
                  <div style={{ fontSize: 0 }}>
                    <Text className={css.commitText} tooltip={<Container padding="small">{commit.message}</Container>}>
                      {commit.message}
                    </Text>
                  </div>
                  <Container flex>
                    <UserLabel className={css.user} name={commit.ownerName || ''} iconProps={{ size: 16 }} />
                    <TimeAgoPopover time={defaultTo((commit?.timeStamp || 0) * 1000, 0)} inline={false} />
                  </Container>
                  {commit?.id && commit?.link && <CommitId commitId={commit.id} commitLink={commit.link} />}
                </div>
              )
            })}
          </Collapse>
        </React.Fragment>
      ) : null}
    </div>
  )
}
