import React from 'react'
import { Layout, Tag } from '@wings-software/uikit'

import i18n from './SavedConnectorDetails.i18n'
import css from './SavedConnectorDetails.module.scss'

interface SavedConnectorDetailsProps {
  connector: any
}
const getSchema = (props: SavedConnectorDetailsProps) => {
  const { connector } = props
  return [
    {
      label: i18n.connectorName,
      value: connector?.name
    },
    {
      label: i18n.description,
      value: connector?.description
    },
    {
      label: i18n.identifier,
      value: connector?.identifier
    },
    {
      label: i18n.tags,
      value: connector?.tags
    },
    {
      label: i18n.connectionMode,
      value: connector?.delegateMode
    },
    {
      label: i18n.delegateName,
      value: connector?.inheritConfigFromDelegate
    }
  ]
}

const renderTags = (value: string[]) => {
  return (
    <Layout.Horizontal spacing="small">
      {value.map((tag, index) => {
        return (
          <Tag minimal={true} key={tag + index}>
            {tag}
          </Tag>
        )
      })}
    </Layout.Horizontal>
  )
}

const SavedConnectorDetails = (props: SavedConnectorDetailsProps) => {
  const connectorDetailsSchema = getSchema(props)

  return (
    <>
      {connectorDetailsSchema.map((item, index) => {
        if (item.value) {
          return (
            <Layout.Vertical spacing="small" className={css.details} key={index}>
              <span className={css.label}>{item.label}</span>
              {item.label === i18n.tags && typeof item.value === 'object' ? (
                renderTags(item.value)
              ) : (
                <span className={css.value}>{item.value}</span>
              )}
            </Layout.Vertical>
          )
        }
      })}
    </>
  )
}
export default SavedConnectorDetails
