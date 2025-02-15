import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users",{
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const refreshTokenTables = pgTable("refresh_tokens",{
    id:uuid("id").primaryKey().defaultRandom(),
    userId:uuid("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
    token:text("token").notNull(),
});

export const tasks = pgTable("tasks",{
   id: uuid("id").primaryKey().defaultRandom(),
   title:text('title').notNull(),
   description:text('description'),
   hexColor:text("hex_color"),
   uid:uuid("uid").references(()=>users.id,{onDelete:"cascade"}),
   dueAt:timestamp("due_at").$defaultFn(()=> new Date(Date.now()+7*24*60*60*1000)),
   createdAt: timestamp("created_at").defaultNow(),
   updatedAt: timestamp("updated_at").defaultNow()
});

export type User  = typeof users.$inferSelect;
export type Tasks = typeof tasks.$inferInsert;
export type NewTask = typeof tasks.$inferInsert;
export type NewUser = typeof users.$inferInsert;