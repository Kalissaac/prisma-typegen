import { Command, flags } from '@oclif/command'
import generateTypes from './generateTypes'
import cli from 'cli-ux'
import { access } from 'fs/promises'
import { constants } from 'fs'

class PrismaTypegen extends Command {
  static description = `Generates full types (including relations) for TypeScript from a Prisma schema
e.g. npx @kalissaac/prisma-typegen ./interfaces/prisma ./schema.prisma`

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }

  static args = [
    {
      name: 'outputPath',
      required: true,
      description: 'Path to output the generated types (the index.d.ts file)',
    },
    {
      name: 'schema',
      required: false,
      description: 'Path to the schema file (schema.prisma)',
    }
  ]

  async run () {
    const { args } = this.parse(PrismaTypegen)

    let outputPath = args.outputPath
    let schemaLocation = args.schema

    if (!outputPath) {
      this.error('Output path is required')
    }
    if (!schemaLocation) {
      cli.action.start('Looking for schema.prisma')
      try {
        await access('./schema.prisma', constants.R_OK)
        schemaLocation = './schema.prisma'
      } catch {
        try {
          await access('./prisma/schema.prisma', constants.R_OK)
          schemaLocation = './prisma/schema.prisma'
        } catch {
          this.error('Schema file is required and could not be found')
        }
      }
      cli.action.stop()
    }

    try {
      cli.action.start('Generating types')
      await generateTypes(schemaLocation, outputPath)
      cli.action.stop()
      this.log('Done!')
    } catch (e) {
      cli.action.stop()
      this.error(e as string)
    }
  }
}

export = PrismaTypegen
