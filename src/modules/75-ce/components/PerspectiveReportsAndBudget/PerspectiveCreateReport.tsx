/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { Container, Layout, Label, Button, Formik, FormInput, FormikForm } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'

import { CEReportSchedule, useCreateReportSetting, useUpdateReportSetting } from 'services/ce'
import { useStrings } from 'framework/strings'
import { regexEmail } from '@common/utils/StringUtils'
import TimezoneSelector from '@ce/common/TimeZoneSelector/TimeZoneSelector'
import Cron from './Cron'
import css from './PerspectiveCreateReport.module.scss'

export interface ReportDetailsForm {
  name: string
  recipients: string
  cron: string
  userCronTimeZone: string
}

interface OpenModalArgs {
  isEdit?: boolean
  selectedReport?: CEReportSchedule
}

interface CreateReportModalProps {
  onSuccess?: () => void
  onError?: () => void
}

const useCreateReportModal = ({ onSuccess, onError }: CreateReportModalProps) => {
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [report, setReport] = useState<CEReportSchedule>()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const { mutate: createReport } = useCreateReportSetting({ accountIdentifier: accountId })
  const { mutate: updateReport } = useUpdateReportSetting({ accountIdentifier: accountId })
  const modalPropsLight: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: cx(Classes.DIALOG, css.mainCtn)
  }

  const handleSubmit = async (data: ReportDetailsForm): Promise<void> => {
    const { cron, recipients, name } = data
    const payload = {
      viewsId: [perspectiveId],
      name: name,
      userCron: `0 ${cron}`,
      recipients: recipients.split(',').map((s: string) => s.trim()),
      userCronTimeZone: data.userCronTimeZone
    }

    try {
      await (isEditMode ? updateReport({ ...report, ...payload }) : createReport(payload))
      onSuccess?.()
    } catch (e) {
      onError?.()
    }
  }

  const getSchemaValidations = () => {
    return Yup.object().shape({
      name: Yup.string().required(getString('ce.perspectives.validations.reportNameRequired')),
      recipients: Yup.string()
        .required(getString('ce.perspectives.validations.emailRequired'))
        .test(
          'emails',
          getString('ce.perspectives.validations.invalidEmails'),
          value =>
            value &&
            value
              .split(',')
              .map((s: string) => s.trim())
              .every((v: string) => regexEmail.test(v))
        )
    })
  }

  const getInitialValues = (): ReportDetailsForm => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (!isEditMode) {
      return {
        name: '',
        recipients: '',
        cron: '',
        userCronTimeZone: userTimezone
      }
    }

    return {
      name: report?.name || '',
      cron: report?.userCron?.split(' ').slice(1).join(' ') || '',
      recipients: report?.recipients?.join(', ') || '',
      userCronTimeZone: report?.userCronTimeZone || userTimezone
    }
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalPropsLight}>
        <Container padding="xlarge">
          <Formik<ReportDetailsForm>
            onSubmit={data => {
              handleSubmit(data)
            }}
            formName="createReportScheduleForm"
            enableReinitialize={true}
            initialValues={getInitialValues()}
            validationSchema={getSchemaValidations()}
          >
            {formikProps => {
              return (
                <FormikForm>
                  <Layout.Vertical spacing="xlarge">
                    <Container style={{ minHeight: 300 }}>
                      <FormInput.Text name={'name'} label={getString('name')} />
                      <Container margin={{ top: 'xlarge', bottom: 'xlarge' }}>
                        <Layout.Horizontal style={{ justifyContent: 'space-between' }} margin={{ bottom: 'small' }}>
                          <Label className={css.cronLabel}>{getString('ce.perspectives.reports.cronLabel')}</Label>
                          <TimezoneSelector
                            timezone={formikProps.values.userCronTimeZone}
                            onTimezoneSelect={tz => formikProps.setFieldValue('userCronTimeZone', tz)}
                          />
                        </Layout.Horizontal>
                        <Cron
                          cron={formikProps.values.cron}
                          onChange={cron => formikProps.setFieldValue('cron', cron)}
                        />
                      </Container>
                      <FormInput.TextArea
                        placeholder={getString('ce.perspectives.reports.emailPlaceholder')}
                        className={css.recipients}
                        name={'recipients'}
                        label={getString('ce.perspectives.reports.recipientLabel')}
                      />
                    </Container>
                    <Layout.Horizontal spacing="medium">
                      <Button type="submit" intent="primary" disabled={false}>
                        {getString('save')}
                      </Button>
                      <Button onClick={() => hideModal()} text={getString('cancel')}></Button>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
      </Dialog>
    ),
    [isEditMode, report]
  )

  return {
    hideModal,
    openModal: (args?: OpenModalArgs) => {
      const { isEdit, selectedReport } = args || {}
      setIsEditMode(!!isEdit)
      setReport(selectedReport)
      openModal()
    }
  }
}

export default useCreateReportModal
