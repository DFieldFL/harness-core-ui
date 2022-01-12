import React, { useState, useEffect } from 'react'
import {
  Text,
  Layout,
  Color,
  Button,
  Popover,
  StepsProgress,
  ButtonVariation,
  ButtonSize
} from '@wings-software/uicore'
import { Position, Intent, PopoverInteractionKind } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { useStrings } from 'framework/strings'
import {
  useGetTestConnectionResult,
  ConnectorConnectivityDetails,
  ConnectorValidationResult,
  ConnectorResponse
} from 'services/cd-ng'

import { StepIndex, STEP } from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import type { StepDetails } from '@connectors/interfaces/ConnectorInterface'
import { ConnectorStatus } from '@connectors/constants'
import useTestConnectionErrorModal from '@connectors/common/useTestConnectionErrorModal/useTestConnectionErrorModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GetTestConnectionValidationTextByType } from '../../utils/ConnectorUtils'
import css from '../ConnectorsListView.module.scss'

export type ErrorMessage = ConnectorValidationResult & { useErrorHandler?: boolean }

interface ConnectivityStatusProps {
  data: ConnectorResponse
}

const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({ data }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [testing, setTesting] = useState(false)
  const [lastTestedAt, setLastTestedAt] = useState<number>()
  const [status, setStatus] = useState<ConnectorConnectivityDetails['status']>(data.status?.status)

  const [errorMessage, setErrorMessage] = useState<ErrorMessage>()
  const { getString } = useStrings()
  const { branch, repoIdentifier } = data.gitDetails || {}
  const [stepDetails, setStepDetails] = useState<StepDetails>({
    step: 1,
    intent: Intent.WARNING,
    status: 'PROCESS' // Replace when enum is added in uikit
  })

  const { openErrorModal } = useTestConnectionErrorModal({})
  const { mutate: reloadTestConnection } = useGetTestConnectionResult({
    identifier: data.connector?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      branch,
      repoIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const executeStepVerify = async (): Promise<void> => {
    if (stepDetails.step === StepIndex.get(STEP.TEST_CONNECTION)) {
      if (stepDetails.status === 'PROCESS') {
        try {
          const result = await reloadTestConnection()
          setStatus(result?.data?.status)
          setLastTestedAt(new Date().getTime())
          if (result?.data?.status === 'SUCCESS') {
            setStepDetails({
              step: 2,
              intent: Intent.SUCCESS,
              status: 'DONE'
            })
          } else {
            setErrorMessage({ ...result.data, useErrorHandler: false })
            setStepDetails({
              step: 1,
              intent: Intent.DANGER,
              status: 'ERROR'
            })
          }
          setTesting(false)
        } catch (err) {
          setLastTestedAt(new Date().getTime())
          setStatus('FAILURE')
          if (err?.data?.responseMessages) {
            setErrorMessage({
              errorSummary: err?.data?.message,
              errors: err?.data?.responseMessages || [],
              useErrorHandler: true
            })
          } else {
            setErrorMessage({ ...err.message, useErrorHandler: false })
          }
          setStepDetails({
            step: 1,
            intent: Intent.DANGER,
            status: 'ERROR'
          })
          setTesting(false)
        }
      }
    }
  }
  const stepName = GetTestConnectionValidationTextByType(data.connector?.type)

  useEffect(() => {
    if (testing) {
      executeStepVerify()
    }
  }, [testing])

  const isStatusSuccess = status === ConnectorStatus.SUCCESS || data.status?.status === ConnectorStatus.SUCCESS

  return (
    <Layout.Horizontal>
      {!testing ? (
        <Layout.Vertical width="100px">
          <Layout.Horizontal spacing="small">
            {status || data.status?.status || errorMessage ? (
              <Text
                inline
                icon={isStatusSuccess ? 'full-circle' : 'warning-sign'}
                iconProps={{
                  size: isStatusSuccess ? 6 : 12,
                  color: isStatusSuccess ? Color.GREEN_500 : Color.RED_500
                }}
                tooltip={
                  !isStatusSuccess ? (
                    errorMessage?.errorSummary || data?.status?.errorSummary ? (
                      <Layout.Vertical font={{ size: 'small' }} spacing="small" padding="small">
                        <Text font={{ size: 'small' }} color={Color.WHITE}>
                          {errorMessage?.errorSummary || data.status?.errorSummary}
                        </Text>
                        {errorMessage?.errors || data?.status?.errors ? (
                          <Text
                            color={Color.BLUE_400}
                            onClick={e => {
                              e.stopPropagation()
                              openErrorModal((errorMessage as ErrorMessage) || data?.status)
                            }}
                            className={css.viewDetails}
                          >
                            {getString('connectors.testConnectionStep.errorDetails')}
                          </Text>
                        ) : null}
                      </Layout.Vertical>
                    ) : (
                      <Text padding="small" color={Color.WHITE}>
                        {getString('noDetails')}
                      </Text>
                    )
                  ) : (
                    ''
                  )
                }
                tooltipProps={{ isDark: true, position: 'bottom', popoverClassName: css.tooltip }}
              >
                {isStatusSuccess ? getString('success').toLowerCase() : getString('failed').toLowerCase()}
              </Text>
            ) : null}
          </Layout.Horizontal>
          {status || data.status?.status ? (
            <Text font={{ size: 'small' }} color={Color.GREY_400}>
              {<ReactTimeago date={lastTestedAt || data.status?.testedAt || ''} />}
            </Text>
          ) : null}
        </Layout.Vertical>
      ) : (
        <Layout.Horizontal>
          <Popover interactionKind={PopoverInteractionKind.HOVER} position={Position.LEFT_TOP}>
            <Button intent="primary" minimal loading />
            <div className={css.testConnectionPop}>
              <StepsProgress
                steps={[stepName]}
                intent={stepDetails.intent}
                current={stepDetails.step}
                currentStatus={stepDetails.status}
              />
            </div>
          </Popover>
          <Text style={{ margin: 8 }}>{getString('connectors.testInProgress')}</Text>
        </Layout.Horizontal>
      )}
      {!testing && !isStatusSuccess ? (
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('test')}
          className={css.testBtn}
          onClick={e => {
            e.stopPropagation()
            setTesting(true)
            setStepDetails({
              step: 1,
              intent: Intent.WARNING,
              status: 'PROCESS' // Replace when enum is added in uikit
            })
          }}
          withoutBoxShadow
        />
      ) : null}
    </Layout.Horizontal>
  )
}

export default ConnectivityStatus
