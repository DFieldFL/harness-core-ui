import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  StepWizard,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  StepProps,
  SelectOption,
  Icon
} from '@wings-software/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { AccessPoint, useAllHostedZones, useCreateAccessPoint, useGetAccessPoint } from 'services/lw'
import { useStrings } from 'framework/exports'
import { useToaster } from '@common/exports'
import CreateTunnelStep from './CreateAccessPointTunnel'

interface Props extends StepProps<any> {
  name: string
  accessPoint: AccessPoint
  closeModal: () => void
  refreshAccessPoints: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}
interface CreateAccessPointWizardProps {
  accessPoint: AccessPoint
  closeModal: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  refreshAccessPoints: () => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}

interface MapToProviderProps {
  accessPoint: AccessPoint
}
const MapToProvider: React.FC<StepProps<MapToProviderProps> & Props> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { data: hostedZones, loading: hostedZonesLoading, refetch: loadHostedZones } = useAllHostedZones({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.accessPoint.cloud_account_id as string, // eslint-disable-line
      region: 'us-east-1'
    },
    lazy: true
  })
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>('route53')

  const { showError, showSuccess } = useToaster()
  const { previousStep } = props
  const { getString } = useStrings()
  const [accessPointStatusInProgress, setaccessPointStatusInProgress] = useState<boolean>(false)
  const [accessPointID, setAccessPointID] = useState<string>()
  const { data: accessPointData, refetch, loading: accessPointStatusLoading } = useGetAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    access_point_id: props.accessPoint.id as string, //eslint-disable-line
    lazy: true
  })
  useEffect(() => {
    if (hostedZonesLoading) return
    if (hostedZones?.response?.length == 0) {
      return
    }
    const loadedhostedZones: SelectOption[] =
      hostedZones?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setHostedZonesList(loadedhostedZones)
  }, [hostedZones, hostedZonesLoading])
  useEffect(() => {
    if (dnsProvider == 'route53') loadHostedZones()
  }, [dnsProvider])
  useEffect(() => {
    if (accessPointStatusInProgress && accessPointID) {
      if (!accessPointStatusLoading) {
        if (accessPointData?.response?.status == 'errored') {
          setaccessPointStatusInProgress(false)
          showError(
            'could not create access point' + !_isEmpty(accessPointData?.response?.metadata?.error)
              ? `\n ${accessPointData?.response?.metadata?.error}`
              : ''
          )
        } else if (accessPointData?.response?.status == 'created') {
          setaccessPointStatusInProgress(false)
          // props.setAccessPoint(accessPointData?.response as AccessPoint)
          showSuccess('Access Point Created Succesfully')
          props.refreshAccessPoints()
          props.setAccessPoint?.(accessPointData?.response)
          props.closeModal()
        } else {
          const timerId = window.setTimeout(() => {
            refetch()
          }, 1000)
          return () => {
            window.clearTimeout(timerId)
          }
        }
      }
    }
  }, [accessPointData, refetch, accessPointStatusLoading, accessPointID])

  const { mutate: createAccessPoint } = useCreateAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })

  const onSave = async (): Promise<void> => {
    setaccessPointStatusInProgress(true)
    try {
      const result = await createAccessPoint(props.accessPoint) // eslint-disable-line
      if (result.response) {
        if (!_isEmpty(result.response?.metadata?.error)) {
          showError(result.response?.metadata?.error)
        } else {
          props.accessPoint.id = result.response.id
          setAccessPointID(result.response.id)
        }
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }
  return (
    <Layout.Vertical style={{ minHeight: '640px', width: '55%' }} padding="large" spacing="large">
      <Heading level={2}>{props.name}</Heading>
      <Formik
        initialValues={{
          dnsProvider: props.accessPoint.metadata?.dns?.route53 ? 'route53' : 'others',
          route53Account: props.accessPoint.metadata?.dns?.route53?.hosted_zone_id // eslint-disable-line
        }}
        onSubmit={_ => {
          onSave()
        }}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium" height="640px">
              <RadioGroup
                inline={true}
                name="dnsProvider"
                label={'Select the DNS Provider'}
                onChange={e => {
                  formik.setFieldValue('dnsProvider', e.currentTarget.value)
                  setDNSProvider(e.currentTarget.value)
                  if (props.accessPoint.metadata) {
                    if (e.currentTarget.value == 'route53') {
                      props.accessPoint.metadata.dns = {
                        route53: {
                          hosted_zone_id: '' // eslint-disable-line
                        }
                      }
                    } else {
                      props.accessPoint.metadata.dns = {
                        others: ''
                      }
                    }
                  }
                }}
                selectedValue={formik.values.dnsProvider}
              >
                <Radio label="Route53" value="route53" />
                <Radio label="Others" value="others" />
              </RadioGroup>
              {formik.values.dnsProvider == 'route53' ? (
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="route53Account"
                    label={'Select Route53 hosted zone'}
                    placeholder={'Select route 53 hosted zone'}
                    items={hostedZonesList}
                    onChange={e => {
                      formik.setFieldValue('route53Account', e.value)
                      if (props.accessPoint.metadata) {
                        props.accessPoint.metadata.dns = {
                          route53: {
                            hosted_zone_id: e.value as string // eslint-disable-line
                          }
                        }
                      }
                    }}
                    style={{ width: '80%' }}
                    disabled={hostedZonesLoading || hostedZonesList.length == 0}
                  />
                </Layout.Horizontal>
              ) : null}
            </Layout.Vertical>
            <Layout.Horizontal spacing="medium" style={{ position: 'absolute', bottom: 0 }}>
              <Button
                text={getString('previous')}
                icon="chevron-left"
                onClick={_ =>
                  previousStep?.({
                    accessPoint: props.accessPoint
                  })
                }
                disabled={accessPointStatusInProgress}
              />

              <Button
                intent="primary"
                text={getString('ce.co.accessPoint.create')}
                onClick={formik.submitForm}
                disabled={accessPointStatusInProgress}
              ></Button>
              {accessPointStatusInProgress ? (
                <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
              ) : null}
            </Layout.Horizontal>
          </FormikForm>
        )}
        validationSchema={Yup.object().shape({
          route53Account: Yup.string().when(['dnsProvider'], {
            is: dns => dns == 'route53',
            then: Yup.string().required('Connector is a required field')
          })
        })}
      ></Formik>
    </Layout.Vertical>
  )
}
const CreateAccessPointWizard: React.FC<CreateAccessPointWizardProps> = props => {
  return (
    <StepWizard icon={'service-aws'} iconProps={{ size: 40 }} title={'Create New Access Point'}>
      <CreateTunnelStep
        name="Create access point"
        accessPoint={props.accessPoint}
        closeModal={props.closeModal}
        refreshAccessPoints={props.refreshAccessPoints}
        isEditMod={props.isEditMod}
        isRuleCreationMode={props.isRuleCreationMode}
      />
      <MapToProvider
        name="Map the domain"
        accessPoint={props.accessPoint}
        closeModal={props.closeModal}
        setAccessPoint={props.setAccessPoint}
        refreshAccessPoints={props.refreshAccessPoints}
      />
    </StepWizard>
  )
}

export default CreateAccessPointWizard
