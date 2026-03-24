import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAttachmentsTableSchema1710955010000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Use raw SQL to add all missing columns directly
    const hasAzureUrl = await this.columnExists(
      queryRunner,
      'attachments',
      'azure_blob_url',
    );
    if (!hasAzureUrl) {
      await queryRunner.query(
        `ALTER TABLE "attachments" ADD COLUMN "azure_blob_url" VARCHAR(500) NULL`,
      );
    }

    const hasDescription = await this.columnExists(
      queryRunner,
      'attachments',
      'description',
    );
    if (!hasDescription) {
      await queryRunner.query(
        `ALTER TABLE "attachments" ADD COLUMN "description" VARCHAR(500) NULL`,
      );
    }

    const hasMetadata = await this.columnExists(
      queryRunner,
      'attachments',
      'metadata',
    );
    if (!hasMetadata) {
      await queryRunner.query(
        `ALTER TABLE "attachments" ADD COLUMN "metadata" JSON NULL`,
      );
    }

    const hasMimeType = await this.columnExists(
      queryRunner,
      'attachments',
      'mime_type',
    );
    if (!hasMimeType) {
      await queryRunner.query(
        `ALTER TABLE "attachments" ADD COLUMN "mime_type" VARCHAR(100) NULL`,
      );
    }

    const hasFileSizeBytes = await this.columnExists(
      queryRunner,
      'attachments',
      'file_size_bytes',
    );
    if (!hasFileSizeBytes) {
      await queryRunner.query(
        `ALTER TABLE "attachments" ADD COLUMN "file_size_bytes" INTEGER NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP COLUMN IF EXISTS "azure_blob_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP COLUMN IF EXISTS "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP COLUMN IF EXISTS "metadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP COLUMN IF EXISTS "mime_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP COLUMN IF EXISTS "file_size_bytes"`,
    );
  }

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`,
    );
    return result.length > 0;
  }
}
