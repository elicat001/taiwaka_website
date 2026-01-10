import {
  int,
  mysqlTable,
  text,
  varchar,
  decimal,
  timestamp,
  json,
  index,
  unique,
  mysqlEnum
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * 产品分类枚举
 */
export const productCategoryEnum = mysqlEnum("category", ["coffee", "merchandise", "equipment"]);

/**
 * 订单状态枚举
 */
export const orderStatusEnum = mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]);

/**
 * 产品表 - 存储所有咖啡产品信息
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default("coffee"),
  image: varchar("image", { length: 500 }),
  specifications: json("specifications"), // 存储规格信息 {origin, roastLevel, flavor, etc}
  stock: int("stock").notNull().default(0),
  featured: int("featured").default(0), // 是否为推荐产品
  tag: varchar("tag", { length: 50 }), // LIMITED, SEASONAL, NEW 等标签
  isActive: int("isActive").notNull().default(1), // 是否上架
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // 索引优化查询性能
  categoryIdx: index("category_idx").on(table.category),
  featuredIdx: index("featured_idx").on(table.featured),
  isActiveIdx: index("is_active_idx").on(table.isActive),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * 客户表 - 存储客户信息
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * 购物车项目表 - 带外键约束
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // 索引优化
  sessionIdx: index("session_idx").on(table.sessionId),
  productIdx: index("product_idx").on(table.productId),
  // 防止同一会话重复添加同一产品
  uniqueSessionProduct: unique("unique_session_product").on(table.sessionId, table.productId),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * 订单表 - 主订单信息
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  shippingAddress: text("shippingAddress"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  note: text("note"), // 订单备注
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  customerEmailIdx: index("customer_email_idx").on(table.customerEmail),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("order_created_at_idx").on(table.createdAt),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * 订单项目表 - 规范化存储订单明细
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(), // 快照：下单时的产品名
  productImage: varchar("productImage", { length: 500 }), // 快照：下单时的产品图片
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // 快照：下单时的价格
  quantity: int("quantity").notNull().default(1),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("order_idx").on(table.orderId),
  productIdx: index("order_product_idx").on(table.productId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * 库存变动记录表 - 追踪库存变化
 */
export const stockLogs = mysqlTable("stock_logs", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  changeAmount: int("changeAmount").notNull(), // 正数为入库，负数为出库
  reason: varchar("reason", { length: 100 }).notNull(), // order, adjustment, return 等
  referenceId: int("referenceId"), // 关联的订单ID或其他
  previousStock: int("previousStock").notNull(),
  newStock: int("newStock").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("stock_product_idx").on(table.productId),
  createdAtIdx: index("stock_created_at_idx").on(table.createdAt),
}));

export type StockLog = typeof stockLogs.$inferSelect;
export type InsertStockLog = typeof stockLogs.$inferInsert;

/**
 * 表关系定义
 */
export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  stockLogs: many(stockLogs),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const stockLogsRelations = relations(stockLogs, ({ one }) => ({
  product: one(products, {
    fields: [stockLogs.productId],
    references: [products.id],
  }),
}));
