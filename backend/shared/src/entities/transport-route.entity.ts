import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum DistanceUnit {
  KM = "km",
  MILES = "miles"
}

export enum TransportRouteStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

@Entity("transport_route")
@Index(["school_id", "route_code"], { unique: true })
export class TransportRoute extends XceliQosBaseEntity {
  @Column({ type: "varchar" })
  route_code: string;

  @Column({ type: "varchar" })
  route_name: string;

  // Stops as ordered jsonb array: [{ stop_order, label, lat, lng, arrival_time }]
  @Column({ type: "jsonb", default: [] })
  stops: Record<string, any>[];

  @Column({ type: "varchar", default: DistanceUnit.KM })
  distance_unit: string;

  @Column({ type: "decimal", precision: 8, scale: 3, nullable: true })
  total_distance: number;

  // Vehicle info
  @Column({ type: "varchar", nullable: true })
  vehicle_registration: string;

  @Column({ type: "varchar", nullable: true })
  driver_name: string;

  @Column({ type: "varchar", nullable: true })
  driver_contact_encrypted: string; // encrypted — never expose raw

  // Fee
  @Column({ type: "boolean", default: false })
  fee_enabled: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  fee_amount: number;

  @Column({ type: "varchar", default: "USD" })
  fee_currency: string; // ISO 4217

  @Column({ type: "varchar", default: TransportRouteStatus.ACTIVE })
  status: string;

  // Academic year scoping
  @Column({ type: "uuid", nullable: true })
  academic_year_id: string;

  // Morning / afternoon / both
  @Column({ type: "varchar", nullable: true })
  shift: string;

  @Column({ type: "int", nullable: true })
  capacity: number;
}
