import { pgTable, text, timestamp, bigserial, bigint, pgEnum, index } from "drizzle-orm/pg-core";
import { services } from "./services";
import { teams } from "./teams";

export const serviceOperationType = pgEnum("service_operation_type", [
  "provision",
  "reset",
  "restart",
]);
export const serviceOperationStatus = pgEnum("service_operation_status", [
  "pending",
  "success",
  "failed",
]);

export const serviceOperations = pgTable(
  "service_operations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),
    adminId: bigint("admin_id", { mode: "number" })
      .notNull()
      .references(() => teams.id),

    type: serviceOperationType("type").notNull(),
    status: serviceOperationStatus("status").notNull().default("pending"),
    resultMessage: text("result_message"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("service_operations_service_id_idx").on(table.serviceId),
    index("service_operations_admin_id_idx").on(table.adminId),
    index("service_operations_status_idx").on(table.status),
    index("service_operations_created_at_idx").on(table.createdAt),
  ],
);

export type ServiceOperation = typeof serviceOperations.$inferSelect;
export type NewServiceOperation = typeof serviceOperations.$inferInsert;
