import React, { useEffect, useState } from 'react'
import {
  Heading,
  Layout,
  Icon,
  Formik,
  FormikForm,
  FormInput,
  Button,
  Color,
  Text,
  useModalHook,
  SelectOption
} from '@wings-software/uicore'
import { Dialog, IDialogProps, RadioGroup, Radio } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { AccessPoint, useAllHostedZones, useListAccessPoints } from 'services/lw'
import CreateAccessPointWizard from './CreateAccessPointWizard'
import type { ConnectionMetadata, CustomDomainDetails, GatewayDetails } from '../COCreateGateway/models'

const modalPropsLight: IDialogProps = {
  isOpen: true,
  style: {
    width: 1175,
    minHeight: 640,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface DNSLinkSetupProps {
  gatewayDetails: GatewayDetails
  setHelpTextSection: (s: string) => void
  setGatewayDetails: (gw: GatewayDetails) => void
}

const DNSLinkSetup: React.FC<DNSLinkSetupProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const accessDetails = props.gatewayDetails.metadata.access_details as ConnectionMetadata // eslint-disable-line
  const customDomainProviderDetails = props.gatewayDetails.metadata.custom_domain_providers as CustomDomainDetails // eslint-disable-line
  const { data: hostedZones, loading: hostedZonesLoading, refetch: loadHostedZones } = useAllHostedZones({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      region: 'us-east-1'
    },
    lazy: true
  })
  const initialAccessPointDetails: AccessPoint = {
    cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    org_id: orgIdentifier, // eslint-disable-line
    metadata: {
      role: '',
      security_groups: [] // eslint-disable-line
    },
    type: 'aws',
    region: props.gatewayDetails.selectedInstances?.length ? props.gatewayDetails.selectedInstances[0].region : '',
    vpc: props.gatewayDetails.selectedInstances?.length
      ? props.gatewayDetails.selectedInstances[0].metadata
        ? props.gatewayDetails.selectedInstances[0].metadata['VpcID']
        : ''
      : ''
  }

  const [accessPointsList, setAccessPointsList] = useState<SelectOption[]>([])
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>()
  const { data: accessPoints, loading: accessPointsLoading, refetch } = useListAccessPoints({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })
  useEffect(() => {
    if (accessPoints?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      accessPoints?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setAccessPointsList(loaded)
  }, [accessPoints])

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

  const [accessPoint, setAccessPoint] = useState<AccessPoint>()
  const [openModal, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <CreateAccessPointWizard
        accessPoint={initialAccessPointDetails}
        closeModal={hideModal}
        setAccessPoint={setAccessPoint}
        refreshAccessPoints={refetch}
      />
    </Dialog>
  ))
  useEffect(() => {
    props.gatewayDetails.accessPointID = accessPoint?.id as string
    props.setGatewayDetails(props.gatewayDetails)
  }, [accessPoint])
  return (
    <Layout.Vertical spacing="medium" padding="medium" style={{ backgroundColor: 'var(--grey-100)' }}>
      <Heading level={3}>A DNS Link lets you to connect to the Rule by matching human-readable domain names</Heading>

      <Formik
        initialValues={{
          customURL: props.gatewayDetails.customDomains?.join(','),
          publicallyAccessible: accessDetails.dnsLink.public as string,
          dnsProvider: customDomainProviderDetails && customDomainProviderDetails.route53 ? 'route53' : 'others',
          route53Account: '',
          accessPoint: props.gatewayDetails.accessPointID
        }}
        onSubmit={values => alert(JSON.stringify(values))}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium">
              <FormInput.Text
                name="customURL"
                label={
                  <Layout.Horizontal spacing="small">
                    <Heading level={3} font={{ weight: 'light' }}>
                      Enter the URL currently used to access the instances
                    </Heading>
                    <Icon name="info"></Icon>
                  </Layout.Horizontal>
                }
                placeholder={'Custom URL (Example: qa.yourcompany.com)'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue('customURL', e.target.value)
                  props.gatewayDetails.customDomains = e.target.value.split(',')
                  props.setGatewayDetails(props.gatewayDetails)
                }}
              />

              <>
                <RadioGroup
                  inline={true}
                  label="Is the URL publicly accessible?"
                  name="publicallyAccessible"
                  onChange={e => {
                    formik.setFieldValue('publicallyAccessible', e.currentTarget.value)
                    if (e.currentTarget.value == 'yes') props.setHelpTextSection('public-dns')
                    else props.setHelpTextSection('private-dns')
                    accessDetails.dnsLink.public = e.currentTarget.value
                    props.gatewayDetails.metadata.access_details = accessDetails // eslint-disable-line
                    props.setGatewayDetails(props.gatewayDetails)
                  }}
                  selectedValue={formik.values.publicallyAccessible}
                >
                  <Radio label="Yes" value="yes" />
                  <Radio label="No" value="no" />
                </RadioGroup>
                <Layout.Vertical spacing="xsmall">
                  <FormInput.Select
                    name="accessPoint"
                    label={'Select Access Point'}
                    placeholder={'Select account'}
                    items={accessPointsList}
                    onChange={e => {
                      formik.setFieldValue('accessPoint', e.value)
                      props.gatewayDetails.accessPointID = e.value as string
                      props.setGatewayDetails(props.gatewayDetails)
                    }}
                    disabled={accessPointsLoading}
                  />
                  <Button minimal onClick={openModal} style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <Text color={Color.BLUE_500}>+ Create a New Access point</Text>
                  </Button>
                </Layout.Vertical>
                {formik.values.publicallyAccessible == 'yes' && formik.values.customURL ? (
                  <>
                    <Layout.Horizontal spacing="small">
                      <Heading level={3} font={{ weight: 'light' }}>
                        Select the DNS Provider
                      </Heading>
                      <Icon name="info"></Icon>
                    </Layout.Horizontal>
                    <RadioGroup
                      inline={true}
                      label=""
                      name="dnsProvider"
                      onChange={e => {
                        formik.setFieldValue('dnsProvider', e.currentTarget.value)
                        setDNSProvider(e.currentTarget.value)
                      }}
                      selectedValue={formik.values.dnsProvider}
                    >
                      <Radio label="Route53" value="route53" />
                      <Radio label="Others" value="others" />
                    </RadioGroup>
                    {formik.values.dnsProvider == 'route53' ? (
                      <>
                        <FormInput.Select
                          name="route53Account"
                          label={'Select Route53 account'}
                          placeholder={'Select account'}
                          items={hostedZonesList}
                          onChange={e => {
                            formik.setFieldValue('route53Account', e.value)
                            //eslint-disable-next-line
                            props.gatewayDetails.metadata.custom_domain_providers = {
                              route53: { hosted_zone_id: e.value as string } // eslint-disable-line
                            }
                            props.setGatewayDetails(props.gatewayDetails)
                          }}
                        />
                      </>
                    ) : null}
                  </>
                ) : formik.values.publicallyAccessible == 'no' ? (
                  <>
                    {/* <FormInput.Select
                      name="accessPoint"
                      label={'Select Access Point'}
                      placeholder={'Select account'}
                      items={accessPointsList}
                      onChange={e => {
                        formik.setFieldValue('accessPoint', e.value)
                        props.gatewayDetails.accessPointID = e.value as string
                        props.setGatewayDetails(props.gatewayDetails)
                      }}
                      disabled={accessPointsLoading}
                    />
                    <Layout.Horizontal padding="small">
                      <Button minimal onClick={openModal} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <Text color={Color.BLUE_500}>+ Create a New Access point</Text>
                      </Button>
                    </Layout.Horizontal> */}
                  </>
                ) : null}
              </>
            </Layout.Vertical>
          </FormikForm>
        )}
      ></Formik>
    </Layout.Vertical>
  )
}

export default DNSLinkSetup
