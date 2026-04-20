import { parseAtUri } from '../refs.js'
import type {
  BlobRefLike,
  RecordDraft,
  RecordStore,
  StoredRecord,
} from './types.js'
import { toStoredRecord } from './types.js'

function blobCid(blob: BlobRefLike): string | null {
  const cid = blob.ref?.$link
  return typeof cid === 'string' && cid.length > 0 ? cid : null
}

export class MemoryRecordStore implements RecordStore {
  private readonly records = new Map<string, StoredRecord<unknown>>()
  private readonly ownedBlobs = new Set<string>()

  async migrate(): Promise<void> {}

  async createRecord<T>(draft: RecordDraft<T>): Promise<StoredRecord<T>> {
    const record = toStoredRecord(draft)
    this.records.set(record.uri, record)
    return record
  }

  async updateRecord<T>(draft: RecordDraft<T>): Promise<StoredRecord<T>> {
    const record = toStoredRecord(draft)
    this.records.set(record.uri, record)
    return record
  }

  async getRecord<T>(uri: string): Promise<StoredRecord<T> | null> {
    const record = this.records.get(uri)
    return (record as StoredRecord<T> | undefined) ?? null
  }

  async listRecords<T>(
    collection: string,
    repoDid?: string,
  ): Promise<StoredRecord<T>[]> {
    return Array.from(this.records.values())
      .filter((record) => {
        return record.collection === collection && (repoDid === undefined || record.repoDid === repoDid)
      })
      .sort((left, right) => {
        if (left.updatedAt !== right.updatedAt) {
          return right.updatedAt.localeCompare(left.updatedAt)
        }

        if (left.createdAt !== right.createdAt) {
          return right.createdAt.localeCompare(left.createdAt)
        }

        if (left.repoDid !== right.repoDid) {
          return left.repoDid.localeCompare(right.repoDid)
        }

        return left.rkey.localeCompare(right.rkey)
      }) as StoredRecord<T>[]
  }

  async hasOwnedBlob(repoDid: string, blob: BlobRefLike): Promise<boolean> {
    const cid = blobCid(blob)
    return cid !== null && this.ownedBlobs.has(`${repoDid}:${cid}`)
  }

  async registerOwnedBlob(repoDid: string, blob: BlobRefLike): Promise<void> {
    const cid = blobCid(blob)
    if (!cid) {
      return
    }

    this.ownedBlobs.add(`${repoDid}:${cid}`)
  }

  seedRecord<T>(uri: string, value: T, createdAt: string, updatedAt: string): void {
    const parsed = parseAtUri(uri)
    this.records.set(uri, {
      uri,
      repoDid: parsed.repoDid,
      collection: parsed.collection,
      rkey: parsed.rkey,
      value,
      createdAt,
      updatedAt,
    })
  }
}