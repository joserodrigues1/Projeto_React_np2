import { MigrationInterface, QueryRunner } from 'typeorm';

export class Setup1765146679250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    CREATE OR REPLACE FUNCTION trigger_updated_at()
    RETURNS TRIGGER AS
    $BODY$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
    COMMENT ON FUNCTION trigger_updated_at() IS 'Trigger function to update the updated_at timestamp on row update';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
