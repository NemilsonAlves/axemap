export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export const STORAGE_CONFIG = 'STORAGE_CONFIG';

export interface StorageConfig {
  type: 's3' | 'minio' | 'r2' | 'gcs'
  region?: string
  endpoint?: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl?: string
  forcePathStyle?: boolean
}
