import React from 'react'
import { Color, Layout, Text, Container, FormInput, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/exports'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { ValueType } from '@secrets/components/TextReference/TextReference'
import { AuthTypes } from '@user-profile/utils/utils'
import type { SCMData } from './SourceCodeManagerForm'
import css from './Authentication.module.scss'

interface AuthenticationData {
  formikProps: FormikProps<SCMData>
  authOptions: SelectOption[]
}

const Authentication: React.FC<AuthenticationData> = ({ formikProps, authOptions }) => {
  const { getString } = useStrings()

  return (
    <>
      <Container width={400} padding={{ top: 'large' }}>
        <Layout.Horizontal flex className={css.authHeaderRow}>
          <Text inline font={{ size: 'medium' }} color={Color.BLACK_100}>
            {getString('authentication')}
          </Text>
          <FormInput.Select name="authType" items={authOptions} disabled={false} className={css.authTypeSelect} />
        </Layout.Horizontal>
        {formikProps.values.authType === AuthTypes.USERNAME_PASSWORD ? (
          <>
            <TextReference name="username" label={getString('username')} type={ValueType.TEXT} />
            <SecretInput name="password" label={getString('password')} />
          </>
        ) : null}
        {formikProps.values.authType === AuthTypes.USERNAME_TOKEN ? (
          <>
            <TextReference name="username" label={getString('username')} type={ValueType.TEXT} />
            <SecretInput name="accessToken" label={getString('connectors.git.accessToken')} />
          </>
        ) : null}
        {formikProps.values.authType === AuthTypes.SSH_KEY ? (
          <SecretInput name="sshKey" type="SSHKey" label={getString('SSH_KEY')} />
        ) : null}
        {formikProps.values.authType === AuthTypes.KERBEROS ? (
          <SecretInput name="kerberosKey" type="SSHKey" label={getString('kerberos')} />
        ) : null}
      </Container>
    </>
  )
}

export default Authentication
