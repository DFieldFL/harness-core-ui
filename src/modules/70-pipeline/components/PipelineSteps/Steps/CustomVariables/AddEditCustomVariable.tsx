import React from 'react'
import * as Yup from 'yup'
import { Dialog, Classes } from '@blueprintjs/core'
import { Button, Formik, FormikForm, FormInput } from '@wings-software/uicore'

import type { NGVariable } from 'services/cd-ng'
import { useStrings } from 'framework/exports'

import { getVaribaleTypeOptions } from './CustomVariableUtils'
import i18n from './CustomVariables.i18n'

export interface VariableState {
  variable: NGVariable
  index: number
}

export interface AddEditCustomVariableProps {
  selectedVariable: VariableState | null
  setSelectedVariable(variable: VariableState | null): void
  addNewVariable(variable: NGVariable): void
  updateVariable(index: number, variable: NGVariable): void
}

export default function AddEditCustomVariable(props: AddEditCustomVariableProps): React.ReactElement {
  const { selectedVariable, setSelectedVariable, addNewVariable, updateVariable } = props
  const { getString } = useStrings()

  function closeModal(): void {
    setSelectedVariable(null)
  }

  return (
    <Dialog isOpen={!!selectedVariable} title={i18n.addVariable} onClose={closeModal}>
      <Formik
        initialValues={selectedVariable?.variable}
        enableReinitialize
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(i18n.validation.name)
        })}
        onSubmit={data => {
          if (data && selectedVariable) {
            if (selectedVariable.index === -1) {
              addNewVariable(data)
            } else {
              updateVariable(selectedVariable.index, data)
            }
            closeModal()
          }
        }}
      >
        {({ submitForm }) => (
          <>
            <div className={Classes.DIALOG_BODY}>
              <FormikForm>
                <FormInput.Text name="name" label={i18n.variableName} placeholder={i18n.variableName} />
                <FormInput.Select
                  name="type"
                  items={getVaribaleTypeOptions(getString)}
                  label={i18n.type}
                  placeholder={i18n.type}
                />
              </FormikForm>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <Button intent="primary" text={i18n.save} onClick={submitForm} /> &nbsp; &nbsp;
              <Button text={i18n.cancel} onClick={() => closeModal()} />
            </div>
          </>
        )}
      </Formik>
    </Dialog>
  )
}
