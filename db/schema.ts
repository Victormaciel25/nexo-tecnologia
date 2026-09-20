import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  service: text("service").notNull(),
  cep: text("cep").notNull(),
  street: text("street").notNull(),
  number: text("number").notNull(),
  district: text("district").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  message: text("message").notNull(),
  consent: integer("consent", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
});
