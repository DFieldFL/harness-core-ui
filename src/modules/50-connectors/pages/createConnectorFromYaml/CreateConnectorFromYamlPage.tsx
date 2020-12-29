import React, { useState, useEffect } from 'react'
import { Container, Button } from '@wings-software/uikit'
import { parse } from 'yaml'
import { useHistory, useParams } from 'react-router-dom'

import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { PageBody } from '@common/components/Page/PageBody'
import { PageHeader } from '@common/components/Page/PageHeader'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useCreateConnector, useGetYamlSnippetMetadata, useGetYamlSchema, useGetYamlSnippet } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import routes from '@common/RouteDefinitions'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/exports'
import i18n from './CreateConnectorFromYaml.i18n'

const CreateConnectorFromYamlPage: React.FC = () => {
  const { accountId } = useParams()
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const [snippetYaml, setSnippetYaml] = React.useState<string>()
  const { getString } = useStrings()

  const handleCreate = async (): Promise<void> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let jsonData
    try {
      jsonData = parse(yamlData || '')
    } catch (err) {
      showError(err.message)
    }

    if (yamlData && jsonData) {
      try {
        const { status } = await createConnector(jsonData as any)
        if (status !== 'ERROR') {
          showSuccess(i18n.successfullyCreated)
          history.push(
            routes.toResourcesConnectorDetails({ connectorId: jsonData.connector?.['identifier'], accountId })
          )
        } else {
          showError(getString('somethingWentWrong'))
        }
      } catch (err) {
        showError(err?.message)
      }
    }
  }

  const { data: snippet, refetch } = useGetYamlSnippet({
    identifier: '',
    requestOptions: { headers: { accept: 'application/json' } },
    lazy: true
  })

  useEffect(() => {
    setSnippetYaml(snippet?.data)
  }, [snippet])

  const onSnippetCopy = async (identifier: string): Promise<void> => {
    await refetch({
      pathParams: {
        identifier
      }
    })
  }

  const { data: snippetData, loading } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Connectors')
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    requestOptions: { headers: { accept: 'application/json' } }
  })

  const { data: connectorSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Connectors'
    }
  })

  return (
    <>
      <PageHeader title={i18n.title} />
      <PageBody>
        <Container padding="xlarge">
          {loading ? (
            <PageSpinner />
          ) : (
            <YAMLBuilder
              fileName={i18n.newConnector}
              entityType="Connectors"
              bind={setYamlHandler}
              showIconMenu={true}
              snippets={snippetData?.data?.yamlSnippets}
              schema={connectorSchema?.data || ''}
              onSnippetCopy={onSnippetCopy}
              snippetYaml={snippetYaml}
            />
          )}
          <Button text="Create" intent="primary" margin={{ top: 'xlarge' }} onClick={handleCreate} />
        </Container>
      </PageBody>
    </>
  )
}

export default CreateConnectorFromYamlPage
