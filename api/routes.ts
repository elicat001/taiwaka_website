import { Router, Request, Response, NextFunction } from "express";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  products,
  cartItems,
  orders,
  orderItems,
  customers,
  stockLogs,
} from "../drizzle/schema";
import { eq, desc, asc, like, and, or, gte, lte, sql, count } from "drizzle-orm";
import type {
  ProductInput,
  OrderInput,
  CartItemInput,
  PaginatedResponse,
} from "../types";

const router = Router();

// 数据库连接池
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || "mysql://root:password@localhost:3306/taiwaka",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = drizzle(pool);

// ============ 工具函数 ============

/**
 * 生成订单号
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TWK-${timestamp}-${random}`;
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证必填字段
 */
function validateRequired(data: object, fields: string[]): string | null {
  const record = data as Record<string, unknown>;
  for (const field of fields) {
    if (record[field] === undefined || record[field] === null || record[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

/**
 * 错误处理包装器
 */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============ 产品 API ============

/**
 * GET /products - 获取产品列表（支持分页、搜索、过滤）
 */
router.get("/products", asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    inStock,
    featured,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = "1",
    limit = "20",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
  const offset = (pageNum - 1) * limitNum;

  // 构建查询条件
  const conditions = [];

  // 只查询上架产品（前端）
  conditions.push(eq(products.isActive, 1));

  if (q) {
    conditions.push(
      or(
        like(products.name, `%${q}%`),
        like(products.description, `%${q}%`)
      )
    );
  }

  if (category) {
    conditions.push(eq(products.category, category as string));
  }

  if (minPrice) {
    conditions.push(gte(products.price, minPrice as string));
  }

  if (maxPrice) {
    conditions.push(lte(products.price, maxPrice as string));
  }

  if (inStock === "true") {
    conditions.push(gte(products.stock, 1));
  }

  if (featured === "true") {
    conditions.push(eq(products.featured, 1));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 排序
  const orderByColumn = sortBy === "price" ? products.price
    : sortBy === "name" ? products.name
    : products.createdAt;
  const orderByDirection = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  // 查询数据
  const [data, totalResult] = await Promise.all([
    db.select()
      .from(products)
      .where(whereClause)
      .orderBy(orderByDirection)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: count() })
      .from(products)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;

  const response: PaginatedResponse<typeof data[0]> = {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };

  res.json(response);
}));

/**
 * GET /products/:id - 获取单个产品
 */
router.get("/products/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid product ID" });
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (product.length === 0) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  res.json({ success: true, data: product[0] });
}));

/**
 * POST /products - 创建产品
 */
router.post("/products", asyncHandler(async (req: Request, res: Response) => {
  const input: ProductInput = req.body;

  // 验证必填字段
  const error = validateRequired(input, ["name", "price"]);
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  const result = await db.insert(products).values({
    name: input.name,
    description: input.description || null,
    price: String(input.price),
    category: input.category || "coffee",
    image: input.image || null,
    specifications: input.specifications || null,
    stock: input.stock || 0,
    featured: input.featured || 0,
    tag: input.tag || null,
    isActive: input.isActive ?? 1,
  });

  const insertId = (result[0] as { insertId: number }).insertId;

  // 记录初始库存
  if (input.stock && input.stock > 0) {
    await db.insert(stockLogs).values({
      productId: insertId,
      changeAmount: input.stock,
      reason: "initial",
      previousStock: 0,
      newStock: input.stock,
    });
  }

  res.status(201).json({
    success: true,
    data: { id: insertId, ...input },
    message: "Product created successfully",
  });
}));

/**
 * PUT /products/:id - 更新产品
 */
router.put("/products/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const input: Partial<ProductInput> = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid product ID" });
  }

  // 获取当前产品信息（用于库存变更记录）
  const currentProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (currentProduct.length === 0) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.price !== undefined) updateData.price = String(input.price);
  if (input.category !== undefined) updateData.category = input.category;
  if (input.image !== undefined) updateData.image = input.image;
  if (input.specifications !== undefined) updateData.specifications = input.specifications;
  if (input.featured !== undefined) updateData.featured = input.featured;
  if (input.tag !== undefined) updateData.tag = input.tag;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  // 库存变更需要记录日志
  if (input.stock !== undefined && input.stock !== currentProduct[0].stock) {
    updateData.stock = input.stock;

    await db.insert(stockLogs).values({
      productId: id,
      changeAmount: input.stock - (currentProduct[0].stock || 0),
      reason: "adjustment",
      previousStock: currentProduct[0].stock || 0,
      newStock: input.stock,
    });
  }

  await db.update(products).set(updateData).where(eq(products.id, id));

  res.json({
    success: true,
    data: { id, ...input },
    message: "Product updated successfully",
  });
}));

/**
 * DELETE /products/:id - 删除产品（软删除）
 */
router.delete("/products/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid product ID" });
  }

  // 软删除：设置 isActive = 0
  await db.update(products).set({ isActive: 0 }).where(eq(products.id, id));

  res.json({ success: true, message: "Product deleted successfully" });
}));

// ============ 购物车 API ============

/**
 * GET /cart/:sessionId - 获取购物车（含产品详情）
 */
router.get("/cart/:sessionId", asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  // 联表查询获取产品详情
  const items = await db
    .select({
      cartItem: cartItems,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sessionId));

  // 转换为前端格式
  const cartData = items.map(({ cartItem, product }) => ({
    cartItemId: cartItem.id,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    product: product,
  }));

  res.json({ success: true, data: cartData });
}));

/**
 * POST /cart - 添加到购物车（支持合并数量）
 */
router.post("/cart", asyncHandler(async (req: Request, res: Response) => {
  const input: CartItemInput = req.body;

  const error = validateRequired(input, ["sessionId", "productId"]);
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  // 检查产品是否存在且有库存
  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, input.productId), eq(products.isActive, 1)))
    .limit(1);

  if (product.length === 0) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  if ((product[0].stock || 0) < (input.quantity || 1)) {
    return res.status(400).json({ success: false, error: "Insufficient stock" });
  }

  // 检查是否已在购物车中
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.sessionId, input.sessionId),
        eq(cartItems.productId, input.productId)
      )
    )
    .limit(1);

  if (existingItem.length > 0) {
    // 更新数量
    const newQuantity = existingItem[0].quantity + (input.quantity || 1);

    if ((product[0].stock || 0) < newQuantity) {
      return res.status(400).json({ success: false, error: "Insufficient stock" });
    }

    await db
      .update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existingItem[0].id));

    res.json({
      success: true,
      data: { id: existingItem[0].id, quantity: newQuantity },
      message: "Cart updated",
    });
  } else {
    // 新增
    const result = await db.insert(cartItems).values({
      sessionId: input.sessionId,
      productId: input.productId,
      quantity: input.quantity || 1,
    });

    const cartInsertId = (result[0] as { insertId: number }).insertId;

    res.status(201).json({
      success: true,
      data: { id: cartInsertId, ...input },
      message: "Added to cart",
    });
  }
}));

/**
 * PUT /cart/:id - 更新购物车数量
 */
router.put("/cart/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { quantity } = req.body;

  if (isNaN(id) || !quantity || quantity < 1) {
    return res.status(400).json({ success: false, error: "Invalid parameters" });
  }

  // 获取购物车项和产品信息
  const item = await db
    .select({ cartItem: cartItems, product: products })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.id, id))
    .limit(1);

  if (item.length === 0) {
    return res.status(404).json({ success: false, error: "Cart item not found" });
  }

  if ((item[0].product?.stock || 0) < quantity) {
    return res.status(400).json({ success: false, error: "Insufficient stock" });
  }

  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));

  res.json({ success: true, message: "Quantity updated" });
}));

/**
 * DELETE /cart/:id - 删除购物车项目
 */
router.delete("/cart/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid cart item ID" });
  }

  await db.delete(cartItems).where(eq(cartItems.id, id));

  res.json({ success: true, message: "Removed from cart" });
}));

/**
 * DELETE /cart/session/:sessionId - 清空购物车
 */
router.delete("/cart/session/:sessionId", asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));

  res.json({ success: true, message: "Cart cleared" });
}));

// ============ 订单 API ============

/**
 * POST /orders - 创建订单（含事务处理和库存扣减）
 */
router.post("/orders", asyncHandler(async (req: Request, res: Response) => {
  const input: OrderInput = req.body;

  // 验证必填字段
  const error = validateRequired(input, ["customerName", "customerEmail", "items"]);
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  if (!isValidEmail(input.customerEmail)) {
    return res.status(400).json({ success: false, error: "Invalid email format" });
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return res.status(400).json({ success: false, error: "Order must have at least one item" });
  }

  // 获取连接进行事务处理
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const txDb = drizzle(connection);

    // 1. 验证所有产品并计算总价
    const productIds = input.items.map(item => item.productId);
    const productsData = await txDb
      .select()
      .from(products)
      .where(and(
        sql`${products.id} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
        eq(products.isActive, 1)
      ));

    const productMap = new Map(productsData.map(p => [p.id, p]));
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if ((product.stock || 0) < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const price = parseFloat(product.price);
      const subtotal = price * item.quantity;
      totalPrice += subtotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: item.quantity,
        subtotal: subtotal.toFixed(2),
      });
    }

    // 2. 创建或查找客户
    let customerId: number | null = null;
    const existingCustomer = await txDb
      .select()
      .from(customers)
      .where(eq(customers.email, input.customerEmail))
      .limit(1);

    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
    } else {
      const customerResult = await txDb.insert(customers).values({
        email: input.customerEmail,
        name: input.customerName,
        phone: input.customerPhone || null,
        address: input.shippingAddress || null,
      });
      customerId = (customerResult[0] as { insertId: number }).insertId;
    }

    // 3. 创建订单
    const orderNumber = generateOrderNumber();
    const orderResult = await txDb.insert(orders).values({
      orderNumber,
      customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone || null,
      shippingAddress: input.shippingAddress || null,
      totalPrice: totalPrice.toFixed(2),
      status: "pending",
      note: input.note || null,
    });

    const orderId = (orderResult[0] as { insertId: number }).insertId;

    // 4. 创建订单项目
    for (const itemData of orderItemsData) {
      await txDb.insert(orderItems).values({
        orderId,
        ...itemData,
      });
    }

    // 5. 扣减库存并记录日志
    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      const previousStock = product.stock || 0;
      const newStock = previousStock - item.quantity;

      await txDb
        .update(products)
        .set({ stock: newStock })
        .where(eq(products.id, item.productId));

      await txDb.insert(stockLogs).values({
        productId: item.productId,
        changeAmount: -item.quantity,
        reason: "order",
        referenceId: orderId,
        previousStock,
        newStock,
      });
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        orderNumber,
        totalPrice: totalPrice.toFixed(2),
        status: "pending",
      },
      message: "Order created successfully",
    });
  } catch (err) {
    await connection.rollback();
    const message = err instanceof Error ? err.message : "Failed to create order";
    res.status(400).json({ success: false, error: message });
  } finally {
    connection.release();
  }
}));

/**
 * GET /orders - 获取订单列表（管理员）
 */
router.get("/orders", asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    customerEmail,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = "1",
    limit = "20",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];

  if (status) {
    conditions.push(eq(orders.status, status as string));
  }

  if (customerEmail) {
    conditions.push(eq(orders.customerEmail, customerEmail as string));
  }

  if (startDate) {
    conditions.push(gte(orders.createdAt, new Date(startDate as string)));
  }

  if (endDate) {
    conditions.push(lte(orders.createdAt, new Date(endDate as string)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByColumn = sortBy === "totalPrice" ? orders.totalPrice : orders.createdAt;
  const orderByDirection = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  const [data, totalResult] = await Promise.all([
    db.select()
      .from(orders)
      .where(whereClause)
      .orderBy(orderByDirection)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: count() })
      .from(orders)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;

  res.json({
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}));

/**
 * GET /orders/:id - 获取订单详情
 */
router.get("/orders/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid order ID" });
  }

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (order.length === 0) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  // 获取订单项目
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  res.json({
    success: true,
    data: {
      ...order[0],
      items,
    },
  });
}));

/**
 * PUT /orders/:id/status - 更新订单状态
 */
router.put("/orders/:id/status", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid order ID" });
  }

  const validStatuses = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }

  // 如果取消订单，需要恢复库存
  if (status === "cancelled") {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const txDb = drizzle(connection);

      const order = await txDb
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Order not found");
      }

      if (order[0].status === "cancelled") {
        throw new Error("Order already cancelled");
      }

      // 获取订单项目并恢复库存
      const items = await txDb
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id));

      for (const item of items) {
        const product = await txDb
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product.length > 0) {
          const previousStock = product[0].stock || 0;
          const newStock = previousStock + item.quantity;

          await txDb
            .update(products)
            .set({ stock: newStock })
            .where(eq(products.id, item.productId));

          await txDb.insert(stockLogs).values({
            productId: item.productId,
            changeAmount: item.quantity,
            reason: "return",
            referenceId: id,
            previousStock,
            newStock,
          });
        }
      }

      await txDb.update(orders).set({ status }).where(eq(orders.id, id));
      await connection.commit();

      res.json({ success: true, message: "Order cancelled and stock restored" });
    } catch (err) {
      await connection.rollback();
      const message = err instanceof Error ? err.message : "Failed to cancel order";
      res.status(400).json({ success: false, error: message });
    } finally {
      connection.release();
    }
  } else {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    res.json({ success: true, message: "Order status updated" });
  }
}));

// ============ 客户 API ============

/**
 * GET /customers - 获取客户列表
 */
router.get("/customers", asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
  const offset = (pageNum - 1) * limitNum;

  const [data, totalResult] = await Promise.all([
    db.select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(limitNum)
      .offset(offset),
    db.select({ count: count() }).from(customers),
  ]);

  const total = totalResult[0]?.count || 0;

  res.json({
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}));

/**
 * GET /customers/:id - 获取客户详情（含订单历史）
 */
router.get("/customers/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid customer ID" });
  }

  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (customer.length === 0) {
    return res.status(404).json({ success: false, error: "Customer not found" });
  }

  // 获取客户订单历史
  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt));

  res.json({
    success: true,
    data: {
      ...customer[0],
      orders: customerOrders,
    },
  });
}));

// ============ 库存 API ============

/**
 * GET /stock/logs/:productId - 获取产品库存变动记录
 */
router.get("/stock/logs/:productId", asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);

  if (isNaN(productId)) {
    return res.status(400).json({ success: false, error: "Invalid product ID" });
  }

  const logs = await db
    .select()
    .from(stockLogs)
    .where(eq(stockLogs.productId, productId))
    .orderBy(desc(stockLogs.createdAt));

  res.json({ success: true, data: logs });
}));

/**
 * POST /stock/adjust - 手动调整库存
 */
router.post("/stock/adjust", asyncHandler(async (req: Request, res: Response) => {
  const { productId, amount, reason = "adjustment" } = req.body;

  if (!productId || amount === undefined) {
    return res.status(400).json({ success: false, error: "Missing productId or amount" });
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (product.length === 0) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  const previousStock = product[0].stock || 0;
  const newStock = previousStock + amount;

  if (newStock < 0) {
    return res.status(400).json({ success: false, error: "Stock cannot be negative" });
  }

  await db.update(products).set({ stock: newStock }).where(eq(products.id, productId));

  await db.insert(stockLogs).values({
    productId,
    changeAmount: amount,
    reason,
    previousStock,
    newStock,
  });

  res.json({
    success: true,
    data: { productId, previousStock, newStock },
    message: "Stock adjusted successfully",
  });
}));

// ============ 统计 API ============

/**
 * GET /stats/dashboard - 获取仪表盘统计
 */
router.get("/stats/dashboard", asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    pendingOrders,
    lowStockProducts,
  ] = await Promise.all([
    db.select({ count: count() }).from(products).where(eq(products.isActive, 1)),
    db.select({ count: count() }).from(orders),
    db.select({ count: count() }).from(customers),
    db.select({ count: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ count: count() }).from(products).where(and(eq(products.isActive, 1), lte(products.stock, 10))),
  ]);

  // 计算总销售额
  const salesResult = await db
    .select({ total: sql<string>`COALESCE(SUM(${orders.totalPrice}), 0)` })
    .from(orders)
    .where(eq(orders.status, "completed"));

  res.json({
    success: true,
    data: {
      totalProducts: totalProducts[0]?.count || 0,
      totalOrders: totalOrders[0]?.count || 0,
      totalCustomers: totalCustomers[0]?.count || 0,
      pendingOrders: pendingOrders[0]?.count || 0,
      lowStockProducts: lowStockProducts[0]?.count || 0,
      totalSales: salesResult[0]?.total || "0",
    },
  });
}));

// ============ 错误处理中间件 ============

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

export default router;
