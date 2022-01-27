/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { Layout, Card, Icon, Text, IconName, Button, useModalHook, ButtonVariation } from '@wings-software/uicore'
import { merge } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { ProvisionerTypes } from '../Common/ProvisionerConstants'

import css from './InfraProvisioning.module.scss'

const provisionerTypes: { name: string; icon: IconName; iconColor?: string; enabled: boolean }[] = [
  {
    name: ProvisionerTypes.Terraform,
    icon: 'terraform-apply-new',
    iconColor: '#5C4EE5',
    enabled: true
  },
  {
    name: ProvisionerTypes.CloudFormation,
    icon: 'cloudformation',
    enabled: false
  },
  {
    name: ProvisionerTypes.ARM,
    icon: 'arm',
    enabled: false
  },
  {
    name: ProvisionerTypes.Script,
    icon: 'script',
    enabled: false
  }
]

interface ChooseProvisionerProps {
  onSubmit: any
  onClose: any
}
const useChooseProvisioner = (props: ChooseProvisionerProps) => {
  const { getString } = useStrings()
  const [provData, setProvData] = React.useState()

  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true
  }
  const ProvDialog = (): JSX.Element => (
    <Dialog
      onClose={() => {
        props.onClose()
        hideModal()
      }}
      enforceFocus={false}
      className={cx(Classes.DIALOG, css.chooseProvisionerDialog)}
      {...modalProps}
    >
      <Layout.Vertical spacing="large">
        <div className={css.provisionerText}>{getString('cd.chooseProvisionerText')}</div>
        <Layout.Horizontal height={120}>
          {provisionerTypes.map((type: { name: string; icon: IconName; enabled: boolean; iconColor?: string }) => {
            const iconProps = {
              name: type.icon as IconName,
              size: 26
            }
            if (type.iconColor) {
              merge(iconProps, { color: type.iconColor })
            }
            return (
              <div key={type.name} className={css.squareCardContainer}>
                <Card
                  disabled={!type.enabled}
                  interactive={true}
                  selected={type.name === ProvisionerTypes.Terraform}
                  cornerSelected={type.name === ProvisionerTypes.Terraform}
                  className={cx({ [css.disabled]: !type.enabled }, css.squareCard)}
                >
                  <Icon {...iconProps} />
                </Card>
                <Text
                  style={{
                    fontSize: '12px',
                    color: type.enabled ? 'var(--grey-900)' : 'var(--grey-350)',
                    textAlign: 'center'
                  }}
                >
                  {type.name}
                </Text>
              </div>
            )
          })}
        </Layout.Horizontal>
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('cd.setUpProvisionerBtnText')}
          className={css.provisionerBtnText}
          onClick={() => {
            props.onSubmit(provData)
            hideModal()
          }}
        />
      </Layout.Vertical>
    </Dialog>
  )
  const [showModal, hideModal] = useModalHook(() => <ProvDialog />, [provData])

  const open = (data?: any) => {
    setProvData(data)
    showModal()
  }
  return {
    showModal: (data: any) => open(data),
    hideModal
  }
}

export default useChooseProvisioner
