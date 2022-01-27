/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import set from 'lodash-es/set'
import { Button, Layout, StepProps, Heading, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { DelegateSetupDetails, GenerateKubernetesYamlUsingNgTokenQueryParams } from 'services/portal'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useGenerateKubernetesYamlUsingNgToken } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { K8sDelegateWizardData } from '../DelegateSetupStep/DelegateSetupStep'

import css from '../CreateK8sDelegate.module.scss'

const k8sFileName = 'harness-delegate.yml'

const Stepk8ReviewScript: React.FC<StepProps<K8sDelegateWizardData>> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { mutate: downloadYaml } = useGenerateKubernetesYamlUsingNgToken({
    queryParams: {
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      fileFormat: 'text/plain'
    } as GenerateKubernetesYamlUsingNgTokenQueryParams
  })
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const [generatedYaml, setGeneratedYaml] = React.useState<string>()

  const onGenYaml = async (): Promise<void> => {
    const data = props?.prevStepData?.delegateYaml || {}
    set(data, 'delegateType', 'KUBERNETES')
    const response = await downloadYaml(data as DelegateSetupDetails)
    setGeneratedYaml(response as any)
  }

  React.useEffect(() => {
    if (props?.prevStepData?.generatedYaml) {
      setGeneratedYaml(props?.prevStepData?.generatedYaml)
    } else {
      onGenYaml()
    }
  }, [])

  const onDownload = (): void => {
    if (linkRef?.current) {
      const content = new Blob([generatedYaml as BlobPart], { type: 'data:text/plain;charset=utf-8' })
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = k8sFileName
      linkRef.current.click()
    }
  }
  return (
    <>
      <Layout.Horizontal>
        <Layout.Vertical padding="xlarge" spacing="medium">
          <div className={css.collapseDiv}>
            <YamlBuilder
              entityType="Delegates"
              fileName={k8sFileName}
              isReadOnlyMode={true}
              isEditModeSupported={false}
              existingYaml={generatedYaml}
              showSnippetSection={false}
              width="568px"
              height="462px"
              theme="DARK"
            />
          </div>
          <Layout.Horizontal padding="small">
            <Button
              id="stepReviewScriptDownloadYAMLButton"
              icon="arrow-down"
              text={getString('delegates.downloadYAMLFile')}
              className={css.downloadButton}
              onClick={() => {
                onDownload()
              }}
              outlined
            />
          </Layout.Horizontal>
          <Layout.Horizontal padding="small">
            <Button
              id="stepReviewScriptBackButton"
              text={getString('back')}
              icon="chevron-left"
              onClick={() => props.previousStep?.(props?.prevStepData)}
              margin={{ right: 'small' }}
            />
            <Button
              id="stepReviewScriptContinueButton"
              type="submit"
              intent="primary"
              text={getString('continue')}
              rightIcon="chevron-right"
              onClick={() => {
                const nextData = props?.prevStepData as K8sDelegateWizardData
                set(nextData, 'generatedYaml', generatedYaml)
                props.nextStep?.(nextData)
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical spacing="medium">
          <Layout.Horizontal padding="medium">
            <Heading level={2} style={{ color: '#22272D', fontWeight: 600 }}>
              {getString('delegate.reviewScript.configProxySettings')}
            </Heading>
          </Layout.Horizontal>
          <Layout.Vertical padding="small">
            <Text lineClamp={3} width={514} font="small">
              {getString('delegate.reviewScript.descriptionProxySettings')}
            </Text>
            <Text lineClamp={3} width={514} font="small">
              {getString('delegates.reviewScript.docLinkBefore')}
              <a
                rel="noreferrer"
                href="https://ngdocs.harness.io/article/5ww21ewdt8-configure-delegate-proxy-settings"
                target="_blank"
              >
                {getString('delegates.reviewScript.docLink')}
              </a>
              {getString('delegates.reviewScript.docLinkAfter')}
            </Text>
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Horizontal>
      <a
        className="hide"
        ref={linkRef}
        // ref={hiddenRedirectLink => (this.hiddenRedirectLink = hiddenRedirectLink)}
        target={'_blank'}
      />
    </>
  )
}

export default Stepk8ReviewScript
