import { Module, Global } from '@nestjs/common';
import { STORAGE_PROVIDER, STORAGE_CONFIG, type StorageConfig } from './storage.constants';
import { S3StorageService } from './s3-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (config: StorageConfig) => {
        return new S3StorageService(config);
      },
      inject: [STORAGE_CONFIG],
    },
    {
      provide: STORAGE_CONFIG,
      useFactory: (): StorageConfig => ({
        type: (process.env.STORAGE_TYPE as StorageConfig['type']) || 'minio',
        region: process.env.STORAGE_REGION || 'auto',
        endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
        accessKeyId: process.env.STORAGE_ACCESS_KEY || 'axemap',
        secretAccessKey: process.env.STORAGE_SECRET_KEY || 'axemap_minio_dev',
        bucket: process.env.STORAGE_BUCKET || 'axemap',
        publicUrl: process.env.STORAGE_PUBLIC_URL,
        forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE !== 'false',
      }),
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
