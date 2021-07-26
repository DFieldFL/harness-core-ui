import React from 'react'
import { Layout, Button, Text, Select, SelectOption } from '@wings-software/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import css from './COGatewayAccess.module.scss'

enum OS {
  Mac = 'Mac',
  Windows = 'Windows',
  Linux = 'Linux'
}

const dropdownOptions: SelectOption[] = [
  {
    label: OS.Mac,
    value:
      'https://lightwing-downloads.s3-ap-southeast-1.amazonaws.com/harness-autostopping-cli-downloads/harness_1.0.0_darwin_amd64.zip'
  },
  {
    label: OS.Windows,
    value:
      'https://lightwing-downloads.s3-ap-southeast-1.amazonaws.com/harness-autostopping-cli-downloads/harness_1.0.0_windows_amd64.zip'
  },
  {
    label: OS.Linux,
    value:
      'https://lightwing-downloads.s3-ap-southeast-1.amazonaws.com/harness-autostopping-cli-downloads/harness_1.0.0_linux_amd64.zip'
  }
]

const SSHSetup: React.FC = () => {
  const [assetLink, setAssetLink] = React.useState<SelectOption | null>(null)

  const { getString } = useStrings()

  React.useEffect(() => {
    const defaultOs = navigator.appVersion.includes(OS.Mac.valueOf())
      ? OS.Mac
      : navigator.appVersion.includes(OS.Windows.valueOf())
      ? OS.Windows
      : navigator.appVersion.includes(OS.Linux.valueOf())
      ? OS.Linux
      : null

    if (defaultOs) {
      setAssetLink(dropdownOptions.find(item => item.label === defaultOs) as SelectOption)
    }
  }, [])

  const downloadAsset = () => {
    const linkEl: HTMLAnchorElement = document.createElement('a')
    linkEl.href = assetLink?.value as string
    linkEl.click()
  }

  const handleOsSelectChange = (option: SelectOption) => {
    setAssetLink(option)
  }

  return (
    <Layout.Vertical spacing="medium" padding="medium" className={css.sshSetupContainer}>
      <Text className={css.text}>
        {getString('ce.co.sshSetup')}
        <span>
          <a
            href=" https://ngdocs.harness.io/article/7025n9ml7z-create-autostopping-rules-aws#setup_access_using_ssh_rdp"
            target="_blank"
          >
            Read More
          </a>
        </span>
      </Text>
      <Layout.Horizontal className={css.infoSection}>
        <div className={css.selectContainer}>
          <Select items={dropdownOptions} onChange={handleOsSelectChange} value={assetLink} name={'sshOs'} />
        </div>
        <Button
          style={{
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid var(--blue-700)',
            color: 'var(--blue-700)',
            width: '130px',
            marginLeft: 'var(--spacing-large)',
            fontSize: 12
          }}
          onClick={downloadAsset}
          disabled={_isEmpty(assetLink)}
        >
          {'Download CLI'}
        </Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SSHSetup
