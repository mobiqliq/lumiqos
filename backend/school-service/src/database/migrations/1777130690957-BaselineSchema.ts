import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineSchema1777130690957 implements MigrationInterface {
    name = 'BaselineSchema1777130690957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "board_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "board_name" character varying NOT NULL, "exam_buffer_days" integer NOT NULL DEFAULT '7', "revision_days" integer NOT NULL DEFAULT '14', "max_sessions_per_day" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1636b437b1255b668e371bc8e23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "flow_state_log" ALTER COLUMN "confidence" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "chronobio_config" ALTER COLUMN "primary_peak_start" SET DEFAULT '09:00'`);
        await queryRunner.query(`ALTER TABLE "chronobio_config" ALTER COLUMN "primary_peak_end" SET DEFAULT '11:00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chronobio_config" ALTER COLUMN "primary_peak_end" SET DEFAULT '11:00:00'`);
        await queryRunner.query(`ALTER TABLE "chronobio_config" ALTER COLUMN "primary_peak_start" SET DEFAULT '09:00:00'`);
        await queryRunner.query(`ALTER TABLE "flow_state_log" ALTER COLUMN "confidence" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP TABLE "board_config"`);
    }

}
