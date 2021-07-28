import React, { useState } from 'react'
import { Formik } from 'formik'
import { FormikForm, FormInput, Button, Layout, Icon, Text, Heading } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'

import { useToaster } from '@common/components'
import { useTestNotificationSetting, SlackSettingDTO } from 'services/notifications'
import { SlackNotificationConfiguration, TestStatus } from '@notifications/interfaces/Notifications'
import { NotificationType } from '@notifications/interfaces/Notifications'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'
import css from '../../ConfigureNotificationsModal.module.scss'

interface ConfigureSlackNotificationsProps {
  onSuccess: (config: SlackNotificationConfiguration) => void
  hideModal: () => void
  withoutHeading?: boolean
  isStep?: boolean
  onBack?: (config?: SlackNotificationConfiguration) => void
  submitButtonText?: string
  config?: SlackNotificationConfiguration
}

interface SlackNotificationData {
  webhookUrl: string
  userGroups: string[]
}

const ConfigureSlackNotifications: React.FC<ConfigureSlackNotificationsProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { mutate: testNotificationSetting } = useTestNotificationSetting({})
  const { showSuccess, showError } = useToaster()

  const handleTest = async (testData: SlackNotificationData): Promise<void> => {
    try {
      setTestStatus(TestStatus.INIT)
      const resp = await testNotificationSetting({
        accountId,
        type: 'SLACK',
        recipient: testData.webhookUrl,
        notificationId: 'asd'
      } as SlackSettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('notifications.slackTestSuccess'))
        setTestStatus(TestStatus.SUCCESS)
      } else {
        showError(getString('somethingWentWrong'))
        setTestStatus(TestStatus.FAILED)
      }
    } catch (err) {
      showError(err.data.message)
      setTestStatus(TestStatus.ERROR)
    }
  }

  const handleSubmit = (formData: SlackNotificationData): void => {
    props.onSuccess(convertFormData(formData))
  }

  const convertFormData = (formData: SlackNotificationData) => {
    return {
      type: NotificationType.Slack,
      ...formData
    }
  }

  return (
    <div className={css.body}>
      <Layout.Vertical spacing="large">
        {props.withoutHeading ? null : (
          <>
            <Icon name="service-slack" size={24} />
            <Heading className={css.title}>{getString('notifications.titleSlack')}</Heading>
          </>
        )}
        <Text>{getString('notifications.helpSlack')}</Text>
        <Text>{getString('notifications.infoSlack')}</Text>

        <Formik
          onSubmit={handleSubmit}
          validationSchema={Yup.object().shape({
            webhookUrl: Yup.string().test('isValidUrl', getString('validation.urlIsNotValid'), _webhookUrl => {
              if (!_webhookUrl) return true

              // TODO: Create global validation function for url validation
              try {
                const url = new URL(_webhookUrl)
                return url.protocol === 'http:' || url.protocol === 'https:'
              } catch (_) {
                return false
              }
            })
          })}
          initialValues={{
            webhookUrl: '',
            userGroups: [],
            ...props.config
          }}
        >
          {formik => {
            return (
              <FormikForm>
                <FormInput.Text name={'webhookUrl'} label={getString('notifications.labelWebhookUrl')} />
                <Layout.Horizontal margin={{ bottom: 'xxlarge' }} style={{ alignItems: 'center' }}>
                  <Button text={getString('test')} onClick={() => handleTest(formik.values)} />
                  {testStatus === TestStatus.SUCCESS ? (
                    <Icon name="tick" className={cx(css.statusIcon, css.green)} />
                  ) : null}
                  {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
                    <Icon name="cross" className={cx(css.statusIcon, css.red)} />
                  ) : null}
                </Layout.Horizontal>
                <UserGroupsInput name="userGroups" label={getString('notifications.labelSlackUserGroups')} />

                {props.isStep ? (
                  <Layout.Horizontal spacing="medium" margin={{ top: 'xlarge' }}>
                    <Button
                      text={getString('back')}
                      onClick={() => {
                        props.onBack?.(convertFormData(formik.values))
                      }}
                    />
                    <Button text={props.submitButtonText || getString('next')} intent="primary" type="submit" />
                  </Layout.Horizontal>
                ) : (
                  <Layout.Horizontal spacing={'medium'} margin={{ top: 'xxlarge' }}>
                    <Button type={'submit'} intent={'primary'} text={props.submitButtonText || getString('submit')} />
                    <Button text={getString('cancel')} onClick={props.hideModal} />
                  </Layout.Horizontal>
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </div>
  )
}

export default ConfigureSlackNotifications
