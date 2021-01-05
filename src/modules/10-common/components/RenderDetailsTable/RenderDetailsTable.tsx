import React from 'react'
import cx from 'classnames'
import { Container, Color, Layout, Text, IconName, Icon, Tag } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { tagsType } from '@common/utils/types'
import css from './RenderDetailsTable.module.scss'

export interface ActivityDetailsRowInterface {
  label: string
  value: string | string[] | tagsType | number | null | undefined
  iconData?: {
    text: string
    icon: IconName
    color?: string
  }
}

interface RenderDetailsSectionProps {
  title: string
  data: Array<ActivityDetailsRowInterface>
  className?: string
}

const renderTags = (tags: tagsType): React.ReactElement => {
  return (
    <Container>
      {Object.keys(tags).map(key => {
        const value = tags[key]
        return (
          <Tag className={css.tag} key={key}>
            {value ? `${key}:${value}` : key}
          </Tag>
        )
      })}
    </Container>
  )
}

export const RenderDetailsTable: React.FC<RenderDetailsSectionProps> = props => {
  const { getString } = useStrings()

  return (
    <Container className={cx(css.detailsSection, props.className)}>
      <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_700} padding={{ bottom: '10px' }}>
        {props.title}
      </Text>

      {props.data.map((item, index) => {
        if (item.value && (item.label === getString('tagsLabel') ? Object.keys(item.value).length : true)) {
          return (
            <Layout.Vertical
              className={css.detailsSectionRowWrapper}
              spacing="xsmall"
              padding={{ top: 'medium', bottom: 'medium' }}
              key={`${item.value}${index}`}
            >
              <Text font={{ size: 'small' }}>{item.label}</Text>
              {item.label === getString('tagsLabel') && typeof item.value === 'object' ? (
                renderTags(item.value as tagsType)
              ) : (
                <Layout.Horizontal spacing="small" className={css.detailsSectionRow}>
                  <Text inline color={item.value === 'encrypted' ? Color.GREY_350 : Color.BLACK}>
                    {item.value}
                  </Text>
                  {item.iconData?.icon ? (
                    <Layout.Horizontal spacing="small">
                      <Icon
                        inline={true}
                        name={item.iconData.icon}
                        size={14}
                        color={item.iconData.color}
                        title={item.iconData.text}
                      />
                      <Text inline>{item.iconData.text}</Text>
                    </Layout.Horizontal>
                  ) : null}
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          )
        }
      })}
    </Container>
  )
}
