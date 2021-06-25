import React from 'react'

import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { Button, Heading, Color, Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { Page } from '@common/components/Page/Page'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import getStarted from './images/getStarted.svg'
import css from './GetStartedProject.module.scss'

const GetStartedProject: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const { currentUserInfo: user } = useAppStore()
  useDocumentTitle(getString('getStarted'))

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: () => {
      history.push(routes.toProjects({ accountId }))
    },
    onWizardComplete: () => {
      closeProjectModal()
      history.push(routes.toProjects({ accountId }))
    }
  })

  const className = user.emailVerified === undefined || user.emailVerified ? '' : css.hasBanner

  return (
    <>
      <EmailVerificationBanner />
      <Page.Header title={getString('getStarted')} />
      <Page.Body className={cx(css.getStartedMainContainer, className)}>
        <Layout.Vertical spacing="xxxlarge" flex>
          <Layout.Vertical spacing="medium" flex>
            <img src={getStarted} className={css.image} />
            <Heading level={1} font={{ weight: 'bold' }} color={Color.BLACK}>
              {getString('projectsOrgs.welcome')}
            </Heading>
            <Heading color={Color.GREY_600} level={2}>
              {getString('projectsOrgs.welcomeSecondLine')}
            </Heading>
          </Layout.Vertical>
          <Button intent="primary" text={getString('projectLabel')} icon="plus" onClick={() => openProjectModal()} />
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
export default GetStartedProject
