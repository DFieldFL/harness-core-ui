import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import {
  Button,
  Color,
  Formik,
  FormikForm,
  FormInput,
  Icon,
  Layout,
  Radio,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { AccessPoint, useAllHostedZones } from 'services/lw'
import helpTextIcon from './images/OthersHelpText.svg'
import css from './COGatewayAccess.module.scss'

interface LBFormStepFirstProps {
  loadBalancer?: AccessPoint
  handleSubmit?: (formValues: FormVal) => void
  cloudAccountId: string | undefined
  createMode?: boolean
  handleCancel?: () => void
  handleCloudConnectorChange?: (connectorId: string) => void
  isSaving?: boolean
}

export interface FormVal {
  hostedZoneId: string
  dnsProvider: string
  customDomainPrefix: string
  lbName: string
}

const LBFormStepFirst: React.FC<LBFormStepFirstProps> = props => {
  const { loadBalancer, handleSubmit, cloudAccountId, createMode, handleCancel, isSaving } = props
  const { getString } = useStrings()
  const { showError, showWarning } = useToaster()
  const [showOthersInfo, setShowOthersInfo] = useState<boolean>(!loadBalancer?.metadata?.dns?.route53)
  const [route53HostedZones, setRoute53HostedZones] = useState<SelectOption[]>([])

  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const {
    data: hostedZones,
    loading: hostedZonesLoading,
    error: fetchHostedZonesError,
    refetch: refetchHostedZones
  } = useAllHostedZones({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId as string, // eslint-disable-line
      region: 'us-east-1',
      domain: loadBalancer?.host_name || '', // eslint-disable-line
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    !!cloudAccountId && refetchHostedZones()
  }, [cloudAccountId])

  useEffect(() => {
    if (hostedZonesLoading) return
    if (fetchHostedZonesError) {
      showError((fetchHostedZonesError.data as any).errors?.join('\n') || fetchHostedZonesError.message)
      return
    }
    if (hostedZones?.response?.length == 0) {
      if (loadBalancer?.name) {
        showWarning(getString('ce.co.accessPoint.hostedZone.noResult'))
      }
      return
    }
    const loadedhostedZones: SelectOption[] =
      hostedZones?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setRoute53HostedZones(loadedhostedZones)
  }, [hostedZones, hostedZonesLoading, hostedZonesLoading])

  const getHostedZoneName = (hzId: string) => {
    const zone = route53HostedZones.find(_item => _item.value === hzId)
    return zone
      ? `.${zone.label
          .split('.')
          .filter(_i => _i)
          .join('.')}`
      : ''
  }

  const onSubmit = (values: FormVal) => {
    const updatedValues = {
      ...values,
      ...(values.dnsProvider === 'route53' && {
        customDomainPrefix: values.customDomainPrefix + getHostedZoneName(values.hostedZoneId)
      })
    }
    handleSubmit?.(updatedValues)
  }

  return (
    <Formik
      initialValues={{
        hostedZoneId: loadBalancer?.metadata?.dns?.route53?.hosted_zone_id as string,
        dnsProvider: !showOthersInfo ? 'route53' : 'others',
        customDomainPrefix: '',
        lbName: loadBalancer?.name || ''
      }}
      formName="lbFormFirst"
      onSubmit={onSubmit}
      render={({ submitForm, values, setFieldValue }) => (
        <FormikForm>
          <Layout.Vertical>
            <FormInput.Text name="lbName" label="Provide a name for the Load balancer" className={css.lbNameInput} />
            <Text color={Color.GREY_400} className={css.configInfo}>
              The Application Load Balancer does not have a domain name associated with it. The rule directs traffic to
              resources through the Load balancer. Hence the Load balancer requires a domain name to be accessed by th
              rule
            </Text>
            <Layout.Horizontal style={{ minHeight: 330 }}>
              <div className={css.configFormWrapper}>
                <Text color={Color.GREY_500} className={css.configFormHeader}>
                  Select your preferred DNS provider and perform the mapping
                </Text>
                <Layout.Horizontal flex={{ alignItems: 'center' }} style={{ marginBottom: 'var(--spacing-medium)' }}>
                  <Radio
                    label={'Route 53'}
                    checked={values.dnsProvider === 'route53'}
                    className={css.radioBtn}
                    onClick={() => {
                      setFieldValue('dnsProvider', 'route53')
                      setShowOthersInfo(false)
                    }}
                  ></Radio>
                  <FormInput.Select
                    name="hostedZoneId"
                    placeholder={getString('ce.co.accessPoint.select.route53zone')}
                    items={route53HostedZones}
                    style={{ width: '70%', marginBottom: 0 }}
                    disabled={hostedZonesLoading || values.dnsProvider === 'others'}
                  />
                </Layout.Horizontal>
                <Radio
                  label={'Others'}
                  checked={values.dnsProvider === 'others'}
                  className={css.radioBtn}
                  onClick={() => {
                    setFieldValue('dnsProvider', 'others')
                    setShowOthersInfo(true)
                  }}
                  style={{ marginBottom: 'var(--spacing-medium)' }}
                ></Radio>
                <Layout.Horizontal className={css.customDomainContainer}>
                  <FormInput.Text name={'customDomainPrefix'} label={'Enter Domain name'} style={{ flex: 2 }} />
                  {values.hostedZoneId && (
                    <Text font={{ weight: 'bold', size: 'medium' }}>{getHostedZoneName(values.hostedZoneId)}</Text>
                  )}
                </Layout.Horizontal>
              </div>
              {showOthersInfo && (
                <div className={css.othersHelpTextContainer}>
                  <Layout.Horizontal>
                    <img src={helpTextIcon} />
                    <Text className={css.helpTextHeader}>
                      Help: When using Other DNS providers like goDaddy, Hostigator, etc.
                    </Text>
                  </Layout.Horizontal>
                  <hr></hr>
                  <Text>To map your custom domain to hostname, you need to:</Text>
                  <ol type={'1'}>
                    <li>Add a CNAME record with your Custom domain, qa.yourcompany.co as the host</li>
                    <li>
                      Point the record to your Harness domain, 27-nginx-test-1.gateway.harness.io. The CNAME record
                      should look like this
                    </li>
                    <li>
                      Save your settings. It may take a full day for the settings to propagate across the global Domain
                      Name System.
                    </li>
                  </ol>
                </div>
              )}
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Horizontal>
            {isSaving && <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />}
            {!isSaving && (
              <Button
                intent="primary"
                text={createMode ? 'Continue' : 'Save'}
                rightIcon={createMode ? 'chevron-right' : undefined}
                onClick={submitForm}
                disabled={
                  !values.lbName || values.dnsProvider === 'others'
                    ? !values.customDomainPrefix
                    : !values.customDomainPrefix || !values.hostedZoneId
                }
                className={css.saveBtn}
              ></Button>
            )}
            {!createMode && <Button intent="none" text={'Cancel'} onClick={handleCancel}></Button>}
          </Layout.Horizontal>
        </FormikForm>
      )}
      validationSchema={Yup.object().shape({
        lbName: Yup.string().required('Name is a required field'),
        hostedZoneId: Yup.string().when('dnsProvider', {
          is: 'others',
          then: Yup.string(),
          otherwise: Yup.string().required('Select Rout53 hosted zone')
        })
      })}
    ></Formik>
  )
}

export default LBFormStepFirst
