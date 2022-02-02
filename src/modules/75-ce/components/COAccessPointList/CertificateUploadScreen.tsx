/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import { Button, Formik, FormikForm, FormInput, Heading, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import { useToaster } from '@common/exports'
import type { AccessPointScreenMode } from '@ce/types'
import uploadFileImage from './images/file-multiple-outline.svg'
import css from './CertificateUploadScreen.module.scss'

export interface CertificateData {
  name: string
  password: string
  content: string
}

type FormValues = Omit<CertificateData, 'content'>

interface CertificateUploadProps {
  onSubmit: (details: CertificateData) => void
  editableFieldsMap: Record<string, boolean>
  mode: AccessPointScreenMode
}

const CertificateUpload: React.FC<CertificateUploadProps> = props => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [fileContent, setFileContent] = useState<string>()
  const [fileName, setFileName] = useState<string>('Drag and drop your file here or Browse')
  const isEditMode = props.mode === 'edit'

  const handleFileUpload = async (event: React.FormEvent<HTMLInputElement>) => {
    try {
      const file = (event.target as any).files[0]
      const content = await Utils.toBase64(file)
      setFileContent(content)
      setFileName(file.name)
    } catch (e) {
      showError(e)
    }
  }

  const handleSubmit = (values: FormValues) => {
    props.onSubmit({ ...values, content: fileContent as string })
  }

  return (
    <div>
      <Heading level={2}>{getString('ce.uploadCertiHeader')}</Heading>
      <div className={css.fileInputContainer}>
        <div className={css.inputInfo}>
          {!fileContent && <img src={uploadFileImage} />}
          <Text>{fileName}</Text>
        </div>
        <input
          type={'file'}
          accept={'.pfx'}
          onChange={handleFileUpload}
          disabled={isEditMode && !props.editableFieldsMap['content']}
        />
      </div>
      <Formik
        formName={'azureCertificateUpload'}
        initialValues={{ name: '', password: '' }}
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(),
          password: Yup.string().required()
        })}
      >
        {({ isValid, submitForm }) => (
          <FormikForm className={css.uploadForm}>
            <FormInput.Text
              name={'name'}
              label={getString('name')}
              disabled={isEditMode && !props.editableFieldsMap['name']}
            />
            <FormInput.Text
              name={'password'}
              inputGroup={{ type: 'password' }}
              label={getString('password')}
              disabled={isEditMode && !props.editableFieldsMap['password']}
            />
            <Button text={'Done'} intent={'primary'} disabled={!isValid || !fileContent} onClick={submitForm} />
          </FormikForm>
        )}
      </Formik>
    </div>
  )
}
export default CertificateUpload
