import React from 'react'
import cx from 'classnames'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import css from './TemplatesGridView.module.scss'

export const TemplatesGridView: React.FC<TemplatesViewProps> = (props): JSX.Element => {
  const { data, selectedIdentifier, gotoPage, onSelect, onPreview, onOpenEdit, onOpenSettings, onDelete } = props

  return (
    <Layout.Vertical height={'100%'}>
      <Container style={{ flexGrow: 1 }}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.content || []}
          renderItem={(template: TemplateSummaryResponse) => (
            <TemplateCard
              template={template}
              onSelect={onSelect}
              className={cx({ [css.selectedTemplate]: template.identifier === selectedIdentifier })}
              onPreview={onPreview}
              onOpenEdit={onOpenEdit}
              onOpenSettings={onOpenSettings}
              onDelete={onDelete}
            />
          )}
          keyOf={(item: TemplateSummaryResponse) => item.identifier}
        />
      </Container>
      <Pagination
        itemCount={data?.totalElements || /* istanbul ignore next */ 0}
        pageSize={data?.size || /* istanbul ignore next */ 10}
        pageCount={data?.totalPages || /* istanbul ignore next */ -1}
        pageIndex={data?.number || /* istanbul ignore next */ 0}
        gotoPage={gotoPage}
      />
    </Layout.Vertical>
  )
}
