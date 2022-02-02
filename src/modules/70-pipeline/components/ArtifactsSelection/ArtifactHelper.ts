/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'

import type { IconName } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { IdentifierSchema } from '@common/utils/Validation'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import { useStrings } from 'framework/strings'

import { StringUtils } from '@common/exports'
import type { ArtifactType } from './ArtifactInterface'

export const ArtifactIconByType: Record<ArtifactType, IconName> = {
  DockerRegistry: 'service-dockerhub',
  Gcr: 'service-gcp',
  Ecr: 'ecr-step',
  NexusRegistry: 'service-nexus',
  ArtifactoryRegistry: 'service-artifactory'
}
export const ArtifactTitleIdByType: Record<ArtifactType, StringKeys> = {
  DockerRegistry: 'dockerRegistry',
  Gcr: 'connectors.GCR.name',
  Ecr: 'connectors.ECR.name',
  NexusRegistry: 'connectors.nexus.nexusLabel',
  ArtifactoryRegistry: 'connectors.artifactory.artifactoryLabel'
}

export const ENABLED_ARTIFACT_TYPES: { [key: string]: ArtifactType } = {
  DockerRegistry: 'DockerRegistry',
  Gcr: 'Gcr',
  Ecr: 'Ecr',
  NexusRegistry: 'NexusRegistry',
  ArtifactoryRegistry: 'ArtifactoryRegistry'
}

export const ArtifactToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  DockerRegistry: Connectors.DOCKER,
  Gcr: Connectors.GCP,
  Ecr: Connectors.AWS,
  NexusRegistry: Connectors.NEXUS,
  ArtifactoryRegistry: Connectors.ARTIFACTORY
}

export const ArtifactConnectorLabelMap: Record<string, string> = {
  DockerRegistry: 'Docker Registry',
  Gcr: 'GCP',
  Ecr: 'AWS',
  NexusRegistry: 'Nexus',
  ArtifactoryRegistry: 'Artifactory'
}

export const allowedArtifactTypes: Array<ArtifactType> = [
  ENABLED_ARTIFACT_TYPES.DockerRegistry,
  ENABLED_ARTIFACT_TYPES.Gcr,
  ENABLED_ARTIFACT_TYPES.Ecr,
  ENABLED_ARTIFACT_TYPES.NexusRegistry,
  ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry
]

export const tagOptions: IOptionProps[] = [
  {
    label: 'Value',
    value: 'value'
  },
  {
    label: 'Regex',
    value: 'regex'
  }
]

export const repositoryPortOrServer: IOptionProps[] = [
  {
    label: 'Docker Repository Server',
    value: 'dockerRepositoryServer'
  },
  {
    label: 'Repository Port',
    value: 'repositoryPort'
  }
]

export const ArtifactIdentifierValidation = (
  artifactIdentifiers: string[],
  id: string | undefined,
  validationMsg: string
): { identifier: Yup.Schema<unknown> } => {
  const { getString } = useStrings()

  if (!id) {
    return {
      identifier: IdentifierSchema({
        requiredErrorMsg: getString('pipeline.artifactsSelection.validation.sidecarId')
      }).notOneOf(artifactIdentifiers, validationMsg)
    }
  }
  return {
    identifier: Yup.string()
      .trim()
      .required(getString('validation.identifierRequired'))
      .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
      .notOneOf(StringUtils.illegalIdentifiers)
  }
}
