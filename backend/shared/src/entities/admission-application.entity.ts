import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum AdmissionStage {
  INQUIRY = "inquiry",
  APPLICATION = "application",
  DOCUMENT_UPLOAD = "document_upload",
  ASSESSMENT = "assessment",
  OFFER = "offer",
  PAYMENT = "payment",
  ONBOARDING = "onboarding",
  ENROLLED = "enrolled",
  WITHDRAWN = "withdrawn",
  REJECTED = "rejected",
}

export enum AdmissionCategory {
  GENERAL = "general",
  QUOTA = "quota",       // school-configured quota (RTE_IN, SEND_UK, IEP_US, etc.)
  SIBLING = "sibling",
  STAFF_WARD = "staff_ward",
  MANAGEMENT = "management",
  INTERNATIONAL = "international",
  OTHER = "other",
}

@Entity("admission_application")
@Index(["school_id", "application_number"], { unique: true })
@Index(["school_id", "stage"])
@Index(["school_id", "academic_year_id", "applying_for_class_id"])
export class AdmissionApplication extends XceliQosBaseEntity {
  @Column({ type: "varchar", length: 50 })
  application_number: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "uuid" })
  applying_for_class_id: string;

  @Column({ type: "enum", enum: AdmissionStage, default: AdmissionStage.INQUIRY })
  stage: AdmissionStage;

  @Column({ type: "enum", enum: AdmissionCategory, default: AdmissionCategory.GENERAL })
  category: AdmissionCategory;

  // Quota category free-form: RTE_IN | SEND_UK | IEP_US | EWS_IN | custom
  @Column({ type: "varchar", nullable: true })
  quota_category: string;

  // Applicant personal details
  @Column({ type: "varchar" })
  applicant_first_name: string;

  @Column({ type: "varchar" })
  applicant_last_name: string;

  @Column({ type: "date", nullable: true })
  date_of_birth: string;

  @Column({ type: "varchar", nullable: true })
  gender: string;

  // ISO 3166-1 alpha-2 nationality
  @Column({ type: "varchar", length: 2, nullable: true })
  nationality: string;

  // For international schools
  @Column({ type: "varchar", nullable: true })
  visa_status: string;

  @Column({ type: "varchar", nullable: true })
  passport_number: string;

  // Language preference
  @Column({ type: "varchar", nullable: true })
  preferred_language_of_instruction: string;

  // Guardian details
  @Column({ type: "varchar" })
  guardian_name: string;

  @Column({ type: "varchar" })
  guardian_email: string;

  @Column({ type: "varchar", nullable: true })
  guardian_phone: string;

  @Column({ type: "varchar", nullable: true })
  guardian_relationship: string;

  // Sibling in school
  @Column({ type: "boolean", default: false })
  sibling_in_school: boolean;

  @Column({ type: "uuid", nullable: true })
  sibling_student_id: string;

  // Previous school details
  @Column({ type: "varchar", nullable: true })
  previous_school_name: string;

  @Column({ type: "varchar", nullable: true })
  previous_school_country: string;

  @Column({ type: "varchar", nullable: true })
  previous_grade_completed: string;

  // Assessment score (if applicable)
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  assessment_score: number;

  @Column({ type: "date", nullable: true })
  assessment_date: string;

  // Offer details
  @Column({ type: "date", nullable: true })
  offer_date: string;

  @Column({ type: "date", nullable: true })
  offer_expiry_date: string;

  @Column({ type: "boolean", default: false })
  offer_accepted: boolean;

  @Column({ type: "timestamp", nullable: true })
  offer_responded_at: Date;

  // Payment
  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  admission_fee_amount: number;

  @Column({ type: "varchar", length: 3, nullable: true })
  admission_fee_currency: string;

  @Column({ type: "boolean", default: false })
  admission_fee_paid: boolean;

  // Onboarding — links to created student record
  @Column({ type: "uuid", nullable: true })
  created_student_id: string;

  // Rejection/withdrawal reason
  @Column({ type: "text", nullable: true })
  notes: string;

  // Stage history jsonb: [{ stage, changed_at, changed_by, notes }]
  @Column({ type: "jsonb", default: [] })
  stage_history: Record<string, any>[];

  // Framework-specific data: RTE verification, SEND assessment ref, etc.
  @Column({ type: "jsonb", default: {} })
  compliance_data: Record<string, any>;
}
