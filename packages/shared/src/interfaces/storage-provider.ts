export interface UploadResult {
  key: string
  url: string
  bucket: string
  size: number
  mimeType: string
  etag?: string
}

export interface StorageListOptions {
  prefix?: string
  maxKeys?: number
  delimiter?: string
}

export interface StorageListItem {
  key: string
  size: number
  lastModified: Date
  etag?: string
}

export interface StorageListResult {
  items: StorageListItem[]
  prefix?: string
  isTruncated: boolean
  nextContinuationToken?: string
}

export interface StorageProvider {
  readonly name: string

  upload(
    bucket: string,
    key: string,
    body: Buffer | ReadableStream | string,
    mimeType: string,
    options?: { metadata?: Record<string, string>; public?: boolean },
  ): Promise<UploadResult>

  download(bucket: string, key: string): Promise<Buffer>

  delete(bucket: string, key: string): Promise<void>

  exists(bucket: string, key: string): Promise<boolean>

  list(bucket: string, options?: StorageListOptions): Promise<StorageListResult>

  getUrl(bucket: string, key: string): Promise<string>

  getSignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>

  copy(sourceBucket: string, sourceKey: string, destBucket: string, destKey: string): Promise<void>

  createBucket(bucket: string): Promise<void>

  bucketExists(bucket: string): Promise<boolean>
}
