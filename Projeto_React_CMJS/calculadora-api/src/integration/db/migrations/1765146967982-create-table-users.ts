import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsers1765146967982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users
      (
        id         UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
        name       VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) > 2),
        email      VARCHAR(100) NOT NULL UNIQUE CHECK (char_length(trim(email)) > 4),
        password   VARCHAR(60)  NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

      CREATE OR REPLACE TRIGGER trigger_updated_at
        BEFORE UPDATE
        ON users
        FOR EACH ROW
      EXECUTE FUNCTION trigger_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS users;
    `);
  }
}
