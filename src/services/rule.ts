import type {
  AppCeruliaCoreCharacterSheetSchema,
  AppCeruliaRuleCreateSheetSchema,
  AppCeruliaRuleGetSheetSchema,
  AppCeruliaRuleListSheetSchemas,
} from '@cerulia/protocol'
import { accepted } from '../ack.js'
import { COLLECTIONS } from '../constants.js'
import { loadSchema, createTypedRecord } from './shared.js'
import type { ServiceRuntime } from './runtime.js'

export function createRuleService(runtime: ServiceRuntime) {
  return {
    async createSheetSchema(
      callerDid: string,
      input: AppCeruliaRuleCreateSheetSchema.InputSchema,
    ) {
      const createdAt = runtime.now()
      const rkey = runtime.nextOpaque()
      const schemaRef = `at://${callerDid}/${COLLECTIONS.characterSheetSchema}/${rkey}`
      const record = {
        $type: COLLECTIONS.characterSheetSchema,
        baseRulesetNsid: input.baseRulesetNsid,
        schemaVersion: input.schemaVersion,
        title: input.title,
        ownerDid: callerDid,
        createdAt,
        fieldDefs: input.fieldDefs,
      } satisfies AppCeruliaCoreCharacterSheetSchema.Main

      await createTypedRecord(runtime, {
        repoDid: callerDid,
        collection: COLLECTIONS.characterSheetSchema,
        rkey,
        value: record,
        createdAt,
        updatedAt: createdAt,
      })

      return accepted([schemaRef])
    },

    async getSheetSchema(
      schemaRef: string,
    ): Promise<AppCeruliaRuleGetSheetSchema.OutputSchema> {
      const record = await loadSchema(runtime, schemaRef)
      return {
        characterSheetSchema: record.value,
      }
    },

    async listSheetSchemas(
      rulesetNsid: string | undefined,
      limit: string | undefined,
      cursor: string | undefined,
    ): Promise<AppCeruliaRuleListSheetSchemas.OutputSchema> {
      const { paginate } = await import('../pagination.js')
      const records = await runtime.store.listRecords<AppCeruliaCoreCharacterSheetSchema.Main>(
        COLLECTIONS.characterSheetSchema,
      )
      const filtered = records
        .filter((record) => !rulesetNsid || record.value.baseRulesetNsid === rulesetNsid)
        .sort((left, right) => left.value.title.localeCompare(right.value.title))

      const page = paginate(filtered, limit, cursor)
      return {
        items: page.items.map((record) => ({
          $type: 'app.cerulia.rule.listSheetSchemas#sheetSchemaListItem',
          schemaRef: record.uri,
          baseRulesetNsid: record.value.baseRulesetNsid,
          schemaVersion: record.value.schemaVersion,
          title: record.value.title,
        })),
        cursor: page.cursor,
      }
    },
  }
}