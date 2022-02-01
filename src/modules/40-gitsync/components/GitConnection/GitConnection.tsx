/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Radio } from '@blueprintjs/core'
import {
  Button,
  Card,
  Color,
  Container,
  getErrorInfoFromErrorObject,
  Layout,
  StepProps,
  Text
} from '@wings-software/uicore'
import { defaultTo, pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { GitSyncConfig, ResponseSaasGitDTO, useIsSaasGit, usePostGitSync, usePostGitSyncSetting } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import DelegatesGit from '@gitsync/icons/DelegatesGit.svg'
import PlatformGit from '@gitsync/icons/PlatformGit.svg'
import css from './GitConnection.module.scss'

interface GitConnectionStepProps {
  repo: string
}

interface GitConnectionProps {
  onSuccess: (data?: GitSyncConfig) => void
  isLastStep: boolean
}

enum Agent {
  Manager = 'Manager',
  Delegate = 'Delegate'
}

const GitConnection: React.FC<StepProps<GitConnectionStepProps> & GitConnectionProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { prevStepData, onSuccess, isLastStep } = props
  const [isSaaS, setIsSaaS] = useState<boolean | undefined>()
  const [loading, setLoading] = useState<boolean>(true)
  const [agent, setAgent] = useState<Agent | undefined>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()

  const { mutate: createGitSyncRepo } = usePostGitSync({
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: registerAgent } = usePostGitSyncSetting({
    queryParams: { accountIdentifier: accountId },
    requestOptions: { headers: { accept: 'application/json' } }
  })

  const { mutate: isSaasGit, loading: checkingIsSaasGit } = useIsSaasGit({
    queryParams: {},
    requestOptions: {
      headers: { 'content-type': 'application/json' }
    }
  })

  React.useEffect(() => {
    isSaasGit(undefined, {
      queryParams: {
        repoURL: encodeURIComponent(defaultTo(prevStepData?.repo, ''))
      }
    })
      .then((res: ResponseSaasGitDTO) => {
        const { saasGit } = defaultTo(res?.data, {})
        if (typeof saasGit !== 'undefined') {
          setAgent(saasGit ? Agent.Manager : Agent.Delegate)
          setIsSaaS(saasGit)
        }
      })
      .catch(e => {
        showError(getErrorInfoFromErrorObject(e))
      })
  }, [prevStepData?.repo])

  React.useEffect(() => {
    setLoading(checkingIsSaasGit)
  }, [checkingIsSaasGit])

  const onSubmit = async (): Promise<void> => {
    setLoading(true)
    try {
      const params = {
        ...pick(props.prevStepData as GitSyncConfig, [
          'gitConnectorType',
          'branch',
          'name',
          'identifier',
          'repo',
          'gitConnectorRef',
          'gitSyncFolderConfigDTOs',
          'projectIdentifier',
          'orgIdentifier'
        ])
      } as GitSyncConfig
      await createGitSyncRepo(params)
      const { status } = await registerAgent({
        projectIdentifier,
        orgIdentifier,
        executeOnDelegate: agent === Agent.Delegate
      })
      if (status === 'SUCCESS') {
        showSuccess(getString('gitsync.successfullySavedConnectivityMode'))
        if (isLastStep) {
          onSuccess()
        } else {
          props.nextStep?.(prevStepData)
        }
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
    setLoading(false)
  }

  return (
    <Layout.Vertical
      padding={{ top: 'huge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }}
      spacing="huge"
      flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      style={{ minHeight: '720px' }}
    >
      <Container>
        <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
          {getString('gitsync.connectToGitProvider')}
        </Text>
        <Layout.Horizontal spacing="xlarge" padding={{ top: 'large' }}>
          <Card
            disabled={!isSaaS}
            className={cx(css.card, { [css.selected]: agent === Agent.Manager })}
            onClick={() => {
              if (isSaaS) {
                setAgent(Agent.Manager)
              }
            }}
          >
            <Layout.Horizontal flex>
              <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.PRIMARY_6}>
                {getString('gitsync.connectThroughManagerLabel')}
              </Text>
              <Radio
                onClick={() => setAgent(Agent.Manager)}
                checked={agent === Agent.Manager}
                disabled={loading || !isSaaS}
              />
            </Layout.Horizontal>
            <Text font="small" style={{ lineHeight: 'var(--spacing-large' }}>
              {getString('gitsync.connectThroughManager')}
            </Text>
            <img src={PlatformGit} width="100%" className={css.img} />
          </Card>
          <Card
            disabled={loading}
            className={cx(css.card, { [css.selected]: agent === Agent.Delegate })}
            onClick={() => setAgent(Agent.Delegate)}
          >
            <Layout.Horizontal flex>
              <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.PRIMARY_6}>
                {getString('gitsync.connectThroughDelegateLabel')}
              </Text>
              <Radio
                onClick={() => setAgent(Agent.Delegate)}
                checked={!isSaaS || agent === Agent.Delegate}
                disabled={loading}
              />
            </Layout.Horizontal>
            <Text font="small" padding={{ bottom: 'huge' }} style={{ lineHeight: 'var(--spacing-large' }}>
              {getString('gitsync.connectThroughDelegate')}
            </Text>
            <img src={DelegatesGit} width="100%" className={css.img} />
          </Card>
        </Layout.Horizontal>
        {/* <Layout.Horizontal padding={{ top: 'xxlarge' }} spacing="small">
          <Icon name="info" size={16} />
          <Link to={'/'}>{getString('gitsync.learnMore')}</Link>
        </Layout.Horizontal> */}
      </Container>
      <Layout.Horizontal className={css.btnWrapper}>
        <Button
          type="submit"
          intent="primary"
          text={isLastStep ? getString('save') : getString('saveAndContinue')}
          rightIcon="chevron-right"
          disabled={loading || !agent}
          onClick={onSubmit}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default GitConnection
