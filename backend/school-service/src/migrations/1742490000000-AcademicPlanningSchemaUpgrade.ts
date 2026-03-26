import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AcademicPlanningSchemaUpgrade1742490000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update Syllabus
        await queryRunner.query(`ALTER TABLE "syllabus" ADD "total_topics" integer NOT NULL DEFAULT 0`);

        // 2. Update Exam
        await queryRunner.query(`ALTER TABLE "exam" ADD "start_date" date`);
        await queryRunner.query(`ALTER TABLE "exam" ADD "end_date" date`);
        await queryRunner.query(`ALTER TABLE "exam" ADD "exam_type_id" uuid`);

        // 3. Create PlanningDay
        await queryRunner.createTable(new Table({
            name: "planning_day",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "school_id",
                    type: "varchar"
                },
                {
                    name: "academic_year_id",
                    type: "varchar"
                },
                {
                    name: "date",
                    type: "date"
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["WORKING", "HOLIDAY", "EXAM", "REVISION"]
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        await queryRunner.createIndex("planning_day", new TableIndex({
            name: "IDX_PLANNING_DAY_SCHOOL_YEAR_DATE",
            columnNames: ["school_id", "academic_year_id", "date"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("planning_day", "IDX_PLANNING_DAY_SCHOOL_YEAR_DATE");
        await queryRunner.dropTable("planning_day");
        await queryRunner.query(`ALTER TABLE "exam" DROP COLUMN "exam_type_id"`);
        await queryRunner.query(`ALTER TABLE "exam" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "exam" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "syllabus" DROP COLUMN "total_topics"`);
    }
}
