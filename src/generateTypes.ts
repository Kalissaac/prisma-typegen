import { getDMMF } from '@prisma/sdk'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import type { DMMF } from '@prisma/generator-helper';

interface TypeTransfer {
  models: Model[]
  enums: Enum[]
}

interface Model {
  name: string
  fields: {
    name: string
    typeAnnotation: string,
    required: boolean,
    isArray: boolean
  }[]
}

interface Enum {
  name: string
  values: string[]
}

export default async function generateTypes (schemaPath: string, outputPath: string) {
  const dmmf = await getDMMF({ datamodelPath: schemaPath })
  let types = distillDMMF(dmmf)
  types = convertPrismaTypesToJSTypes(types)
  const fileContents = createTypeFileContents(types)
  writeToFile(fileContents, outputPath)
}

function distillDMMF (dmmf: DMMF.Document): TypeTransfer {
  const types: TypeTransfer = {
    models: [],
    enums: []
  }

  dmmf.datamodel.enums.forEach(prismaEnum => {
    types.enums.push({
      name: prismaEnum.name,
      values: prismaEnum.values.map(e => e.name)
    })
  })

  dmmf.datamodel.models.forEach(model => {
    types.models.push({
      name: model.name,
      fields: model.fields.map(f => ({
        name: f.name,
        typeAnnotation: f.type,
        required: f.isRequired,
        isArray: f.isList
      }))
    })
  })

  return types
}

const PrismaTypesMap = new Map([
  ['String', 'string'],
  ['Boolean', 'boolean'],
  ['Int', 'number'],
  ['BigInt', 'number'],
  ['Float', 'number'],
  ['Decimal', 'number'],
  ['DateTime', 'Date'],
  ['Json', 'any'],
  ['Bytes', 'Buffer']
])

function convertPrismaTypesToJSTypes (types: TypeTransfer): TypeTransfer {
  const models = types.models.map(model => {
    const fields = model.fields.map(field => ({
      ...field,
      typeAnnotation: PrismaTypesMap.get(field.typeAnnotation) || field.typeAnnotation
    }))

    return {
      ...model,
      fields
    }
  })

  return {
    ...types,
    models
  }
}

function createTypeFileContents (types: TypeTransfer): string {
  let fileContents = `// AUTO GENERATED FILE BY @kalissaac/prisma-typegen
// DO NOT EDIT

${types.enums.map(prismaEnum => `
export enum ${prismaEnum.name} {
${prismaEnum.values.map(value => `    ${value},`).join('\n')}
}`).join('\n')}

${types.models.map(model => `
export interface ${model.name} {
${model.fields.map(field => `    ${field.name}${field.required ? '' : '?'}: ${field.typeAnnotation}${field.isArray ? '[]' : ''},`).join('\n')}
}`).join('\n')}
`
  return fileContents
}

async function writeToFile (contents: string, outputPath: string) {
  try {
    await mkdir(outputPath, { recursive: true })
    await writeFile(join(outputPath, 'index.d.ts'), contents, {
      encoding: 'utf8'
    })
  } catch (e) {
    console.error(e)
  }
}
