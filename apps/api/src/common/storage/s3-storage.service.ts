import { Injectable, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, HeadBucketCommand, ListObjectsV2Command, CopyObjectCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageProvider, UploadResult, StorageListOptions, StorageListResult, StorageListItem } from '@axemap/shared';
import { STORAGE_CONFIG, type StorageConfig } from './storage.constants';

@Injectable()
export class S3StorageService implements StorageProvider {
  readonly name: string;
  private client: S3Client;
  private defaultBucket: string;
  private publicUrl?: string;
  private endpointUrl?: string;

  constructor(@Inject(STORAGE_CONFIG) config: StorageConfig) {
    this.name = config.type;
    this.defaultBucket = config.bucket;
    this.publicUrl = config.publicUrl?.replace(/\/+$/, '');
    this.endpointUrl = config.endpoint?.replace(/\/+$/, '');

    const endpoint = config.endpoint
      ? { endpoint: config.endpoint, forcePathStyle: config.forcePathStyle ?? true }
      : {};

    this.client = new S3Client({
      region: config.region || 'auto',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...endpoint,
    });
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer | string,
    mimeType: string,
    options?: { metadata?: Record<string, string>; public?: boolean },
  ): Promise<UploadResult> {
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
      Metadata: options?.metadata,
      ...(options?.public ? { ACL: 'public-read' } : {}),
    });

    const result = await this.client.send(cmd);

    return {
      key,
      url: await this.getUrl(bucket, key),
      bucket,
      size: typeof body === 'string' ? Buffer.byteLength(body) : body.length,
      mimeType,
      etag: result.ETag?.replace(/"/g, ''),
    };
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const result = await this.client.send(cmd);
    return Buffer.from(await result.Body!.transformToByteArray());
  }

  async delete(bucket: string, key: string): Promise<void> {
    const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await this.client.send(cmd);
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try {
      const cmd = new HeadObjectCommand({ Bucket: bucket, Key: key });
      await this.client.send(cmd);
      return true;
    } catch {
      return false;
    }
  }

  async list(bucket: string, options?: StorageListOptions): Promise<StorageListResult> {
    const cmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: options?.prefix,
      MaxKeys: options?.maxKeys,
      Delimiter: options?.delimiter,
    });

    const result = await this.client.send(cmd);

    const items: StorageListItem[] = (result.Contents || []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size!,
      lastModified: obj.LastModified!,
      etag: obj.ETag?.replace(/"/g, ''),
    }));

    return {
      items,
      prefix: options?.prefix,
      isTruncated: result.IsTruncated || false,
      nextContinuationToken: result.NextContinuationToken,
    };
  }

  async getUrl(bucket: string, key: string): Promise<string> {
    const base = this.publicUrl ?? this.endpointHost();
    return `${base}/${bucket}/${key}`;
  }

  async getSignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn });
  }

  async copy(sourceBucket: string, sourceKey: string, destBucket: string, destKey: string): Promise<void> {
    const cmd = new CopyObjectCommand({
      CopySource: `/${sourceBucket}/${sourceKey}`,
      Bucket: destBucket,
      Key: destKey,
    });
    await this.client.send(cmd);
  }

  async createBucket(bucket: string): Promise<void> {
    const cmd = new CreateBucketCommand({ Bucket: bucket });
    await this.client.send(cmd);
  }

  async bucketExists(bucket: string): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch (e: any) {
      if (e.name === 'NotFound') return false;
      throw e;
    }
  }

  async setBucketPublicRead(bucket: string): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };
    await this.client.send(
      new PutBucketPolicyCommand({ Bucket: bucket, Policy: JSON.stringify(policy) }),
    );
  }

  private endpointHost(): string {
    return this.endpointUrl || `http://localhost:9000`;
  }
}
