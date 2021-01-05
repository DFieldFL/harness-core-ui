import React from 'react'
import { Button, Layout, ButtonProps } from '@wings-software/uicore'
import i18n from './SubmitAndPreviousButtons.i18n'
import css from './SubmitAndPreviousButtons.module.scss'

export interface SubmitAndPreviousButtonProps {
  onNextClick?: () => void
  onPreviousClick?: () => void
  nextButtonProps?: ButtonProps
}

export function SubmitAndPreviousButtons(props: SubmitAndPreviousButtonProps): JSX.Element {
  const { onNextClick, onPreviousClick } = props
  return (
    <Layout.Horizontal className={css.main}>
      <Button
        text={i18n.previousLabel}
        style={{ marginRight: 'var(--spacing-small)' }}
        icon="chevron-left"
        onClick={() => onPreviousClick?.()}
      />
      <Button
        text={i18n.nextLabel}
        intent="primary"
        type="submit"
        rightIcon="chevron-right"
        onClick={() => onNextClick?.()}
        {...props.nextButtonProps}
      />
    </Layout.Horizontal>
  )
}
