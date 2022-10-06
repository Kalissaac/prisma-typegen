#!/usr/bin/env node

import generateTypes from './generateTypes.js'
import { access } from 'fs/promises'
import { constants } from 'fs'
import { exit } from 'process'

const argv = process.argv.slice(2)

if (argv.length < 1) {
  console.error('Output path is required')
  exit(1)
}

if (argv[0] === 'help' || argv[0] === '--help') {
  console.log(`@kalissaac/prisma-typegen
  Usage: <output path> [prisma schema file]

  Options:
    --declarationsOnly          Output type declarations only instead of full TypeScript file
    --generateInsertionTypes    Output interfaces for data to be inserted to a database
    --useType                   Use type instead of interface
  `)
  exit(0)
}

const outputPath = argv[0]

let schemaLocation: string
if (argv.length < 2 || argv[1] === '--declarationsOnly') {
  console.log('Looking for schema.prisma')
  try {
    await access('./schema.prisma', constants.R_OK)
    schemaLocation = './schema.prisma'
  } catch {
    try {
      await access('./prisma/schema.prisma', constants.R_OK)
      schemaLocation = './prisma/schema.prisma'
    } catch {
      console.error('Schema file is required and could not be found')
      exit(1)
    }
  }
} else {
  schemaLocation = argv[1]
}

const declarationsOnly = argv.includes('--declarationsOnly')
const generateInsertionTypes = argv.includes('--generateInsertionTypes')
const useType = argv.includes('--useType')

try {
  console.log('Generating types...')
  await generateTypes(schemaLocation, outputPath, declarationsOnly, generateInsertionTypes, useType)
  console.log('Done!')
} catch (e) {
  console.error(e)
  exit(1)
}
