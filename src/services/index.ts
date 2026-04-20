import { createActorService } from './actor.js'
import { createCharacterService } from './character.js'
import { createRuleService } from './rule.js'
import { createSessionService } from './session.js'
import { createServiceRuntime } from './runtime.js'
import type { RecordStore } from '../store/types.js'

export function createServices(store: RecordStore) {
  const runtime = createServiceRuntime(store)

  return {
    actor: createActorService(runtime),
    character: createCharacterService(runtime),
    rule: createRuleService(runtime),
    session: createSessionService(runtime),
  }
}