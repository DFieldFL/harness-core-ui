import { Color, Heading, Layout, Container } from '@wings-software/uikit'
import React from 'react'
import css from './ExtendedPageHeader.module.scss'

export interface ExtendedPageHeaderProps {
  title: React.ReactNode
  rowOneContent: React.ReactNode
  rowTwoContent: React.ReactNode
  rowThreeContent?: React.ReactNode | null
  toolbar?: React.ReactNode
}

/**
 * PageExtendedHeader implements a consistent header for a page header in which title is rendered on
 * the left followed by rowOneContent component/s,
 * then rowTwoContent bellow and toolbar on the right.
 * then rowThreeContent
 * It also has a consistent box-shadow styling.
 */
export const ExtendedPageHeader: React.FC<ExtendedPageHeaderProps> = ({
  title,
  rowOneContent,
  rowTwoContent,
  rowThreeContent = null,
  toolbar
}) => {
  return (
    <Layout.Vertical className={css.container} spacing="small" padding={{ top: 'medium' }}>
      <Layout.Horizontal className={css.row} spacing="medium">
        <Heading level={1} color={Color.GREY_800}>
          {title}
        </Heading>
        {rowOneContent}
      </Layout.Horizontal>

      <Layout.Horizontal className={css.row} spacing="xsmall">
        {rowTwoContent}
        {toolbar && <Container className={css.toolbar}>{toolbar}</Container>}
      </Layout.Horizontal>

      {rowThreeContent && (
        <Layout.Horizontal className={css.row} spacing="xsmall">
          {rowThreeContent}
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}
