/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import fs from 'fs'
import path from 'path'

import yaml from 'yaml'
import _ from 'lodash'
import chalk from 'chalk'
import textTable from 'text-table'

import { getLayers } from '../utils/HarnessModulesUtils.cjs'

const REFERENCE_REGEX = /\{\{\s*\$\.(.+?)\s*\}\}/g
const VALID_KEY_REGEX = /^[A-Za-z0-9_]+$/

const onlyNew = process.argv.includes('--new-only') // TODO: remove this after migration

const errors = []
const valuesMap = new Map()
const moduleLayers = getLayers()

// TODO: remove this after migration
const oldStrings = await fs.promises.readFile(path.resolve(process.cwd(), 'src/strings/strings.en.yaml'), 'utf-8')
const oldParsedContent = yaml.parse(oldStrings)

const values = {
  ...(onlyNew ? {} : oldParsedContent || {}) // TODO: remove this after migration
}

function validateReferences(str, path, restricedModules = [], isOld) {
  const REFERENCE_REGEX1 = /\{\{\s*\$\.(.+?)\s*\}\}/g

  let match = null

  while ((match = REFERENCE_REGEX1.exec(str))) {
    const [, ref] = match
    console.log(ref)

    restricedModules.forEach(mod => {
      if (ref.startsWith(mod)) {
        errors.push([chalk.red('error'), `"${path}" has reference to restricted module "${mod}": "${ref}"`])
      }
    })

    const refValue = _.get(values, ref)

    if (typeof refValue !== 'string') {
      errors.push([chalk.red('error'), `"${path}" has incorrect reference: "${ref}"`])
    } else if (refValue.match(REFERENCE_REGEX)) {
      errors.push([
        chalk.red('error'),
        `"${path}" is referring "${ref}" which in turn is a reference to "${refValue}". This is not allowed`
      ])
    }
  }
}

function validateStrings(data, parentPath = [], restricedModules = [], isOld) {
  if (!data) {
    errors.push([
      chalk.red('error'),
      `No data found for path ${parentPath.join('.')}`
    ])
    return
  }
  Object.entries(data).forEach(([key, value]) => {
    const strPath = [...parentPath, key].join('.')

    if (!isOld && !VALID_KEY_REGEX.test(key)) {
      errors.push([
        chalk.red('error'),
        `Only A-Z, a-z, 0-9 and _ allowed in key name: key: "${key}", path: "${strPath}"`
      ])
    }

    if (typeof value === 'string') {
      // only variable values
      if (value.includes('{{') && value.includes('}}')) {
        validateReferences(value, strPath, restricedModules)
        return
      }

      if (valuesMap.has(value)) {
        const existingPath = valuesMap.get(value)
        errors.push([
          chalk.red('error'),
          `"${strPath}" has duplicate value of "${value}". Please use "${existingPath}" instead or extract the value to a common place.`
        ])
      } else {
        valuesMap.set(value, strPath)
      }
    } else if (Array.isArray(value)) {
      errors.push([chalk.red('error'), `Array is not supported in strings YAML file. Path: "${strPath}"`])
    } else {
      validateStrings(value, [...parentPath, key], restricedModules, isOld)
    }
  })
}

for (const [i, layer] of moduleLayers.entries()) {
  for (const { moduleRef, dirName, moduleName } of layer) {
    console.log(chalk.bold(`Analyzing "${moduleName}" module...`))
    const content = await fs.promises.readFile(
      path.resolve(process.cwd(), `src/modules/${dirName}/strings/strings.en.yaml`),
      'utf-8'
    )
    const parsedContent = yaml.parse(content) || {}
    const restrictedModules = _.flatten(moduleLayers.slice(i))
      .map(mod => mod.moduleRef)
      .filter(mod => mod !== moduleRef)
      .map(mod => `${mod}.`)

    values[moduleRef] = parsedContent
    validateStrings(parsedContent, [moduleRef], restrictedModules)
  }
}

console.log(chalk.bold(`Analyzing old strings...`))
validateStrings(oldParsedContent, [], [], true)

if (errors.length > 0) {
  console.log(chalk.red(`\n❌ ${errors.length} issues found\n`))
  console.log(textTable(errors))
  process.exit(1)
} else {
  console.log(chalk.green(`\n✅  0 issues found`))
}
