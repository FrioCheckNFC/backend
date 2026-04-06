import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsToTickets1710955011000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTitle = await this.columnExists(queryRunner, 'tickets', 'title');
    if (!hasTitle) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "title" VARCHAR(200) DEFAULT ''`,
      );
    }

    const hasDescription = await this.columnExists(
      queryRunner,
      'tickets',
      'description',
    );
    if (!hasDescription) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "description" TEXT DEFAULT ''`,
      );
    }

    const hasResolvedById = await this.columnExists(
      queryRunner,
      'tickets',
      'resolved_by_id',
    );
    if (!hasResolvedById) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "resolved_by_id" UUID NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTitle = await this.columnExists(queryRunner, 'tickets', 'title');
    if (hasTitle) {
      await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "title"`);
    }

    const hasDescription = await this.columnExists(
      queryRunner,
      'tickets',
      'description',
    );
    if (hasDescription) {
      await queryRunner.query(
        `ALTER TABLE "tickets" DROP COLUMN "description"`,
      );
    }

    const hasResolvedById = await this.columnExists(
      queryRunner,
      'tickets',
      'resolved_by_id',
    );
    if (hasResolvedById) {
      await queryRunner.query(
        `ALTER TABLE "tickets" DROP COLUMN "resolved_by_id"`,
      );
    }
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
