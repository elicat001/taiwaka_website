import express, { Router, Request, Response } from "express";
import { drizzle } from "drizzle-orm/mysql2";
import { products, cartItems, orders } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// 初始化数据库连接
const db = drizzle(process.env.DATABASE_URL || "mysql://root:password@localhost:3306/taiwaka");

/**
 * 产品相关 API
 */

// 获取所有产品
router.get("/products", async (req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 获取单个产品
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(req.params.id)))
      .limit(1);
    
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// 创建产品（管理员）
router.post("/products", async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, specifications, stock } = req.body;
    
    const result = await db.insert(products).values({
      name,
      description,
      price,
      image,
      specifications,
      stock,
    });
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// 更新产品（管理员）
router.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, specifications, stock } = req.body;
    
    await db
      .update(products)
      .set({
        name,
        description,
        price,
        image,
        specifications,
        stock,
      })
      .where(eq(products.id, parseInt(req.params.id)));
    
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 删除产品（管理员）
router.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/**
 * 购物车相关 API
 */

// 获取购物车
router.get("/cart/:sessionId", async (req: Request, res: Response) => {
  try {
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, req.params.sessionId));
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// 添加到购物车
router.post("/cart", async (req: Request, res: Response) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    
    const result = await db.insert(cartItems).values({
      sessionId,
      productId,
      quantity,
    });
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// 删除购物车项目
router.delete("/cart/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(cartItems).where(eq(cartItems.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

/**
 * 订单相关 API
 */

// 创建订单
router.post("/orders", async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, totalPrice, items } = req.body;
    const orderNumber = `ORD-${Date.now()}`;
    
    const result = await db.insert(orders).values({
      orderNumber,
      customerName,
      customerEmail,
      totalPrice,
      items,
      status: "pending",
    });
    
    res.status(201).json({ id: result.insertId, orderNumber, ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// 获取所有订单（管理员）
router.get("/orders", async (req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
