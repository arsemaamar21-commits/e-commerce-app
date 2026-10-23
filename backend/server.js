const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const catalogSeed = require('./catalog-seed');

const app = express();
const scrypt = promisify(crypto.scrypt);
if (process.env.NODE_ENV === 'production' && !process.env.TOKEN_SECRET) {
  throw new Error('TOKEN_SECRET must be configured in production');
}
const tokenSecret = process.env.TOKEN_SECRET || 'development-only-change-this-secret';
const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));

const productSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true, trim: true },
  stock: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ title: 'text', description: 'text', category: 'text' });
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  }],
  total: { type: Number, required: true, min: 0 },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['chapa', 'telebirr', 'card'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

function createToken(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return res.status(401).json({ error: 'Invalid session' });
  const expected = crypto.createHmac('sha256', tokenSecret).update(payload).digest();
  const provided = Buffer.from(signature, 'base64url');
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  try {
    req.auth = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (req.auth.exp < Date.now()) return res.status(401).json({ error: 'Session expired' });
  } catch {
    return res.status(401).json({ error: 'Invalid session' });
  }
  User.findById(req.auth.id)
    .then((user) => {
      if (!user) return res.status(401).json({ error: 'Account no longer exists' });
      req.auth.role = user.role;
      next();
    })
    .catch(next);
}

function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'admin') return res.status(403).json({ error: 'Administrator access required' });
  next();
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

app.get('/', (_req, res) => res.send('Backend Server is running successfully!'));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Name, valid email, and password (at least 8 characters) are required' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'Email is already registered' });
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  const role = adminEmail && normalizedEmail === adminEmail ? 'admin' : 'customer';
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: `${salt}:${hash.toString('hex')}`, role });
  res.status(201).json({ user: publicUser(user), token: createToken(user) });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const [salt, savedHash] = user.passwordHash.split(':');
  const candidate = await scrypt(String(req.body.password || ''), salt, 64);
  const expected = Buffer.from(savedHash, 'hex');
  if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ user: publicUser(user), token: createToken(user) });
}));

app.get('/api/auth/me', requireAuth, asyncRoute(async (req, res) => {
  const user = await User.findById(req.auth.id);
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  res.json({ user: publicUser(user) });
}));

app.patch('/api/auth/me', requireAuth, asyncRoute(async (req, res) => {
  const updates = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) updates.name = req.body.name.trim();
  if (typeof req.body.email === 'string' && /^\S+@\S+\.\S+$/.test(req.body.email)) updates.email = req.body.email.trim().toLowerCase();
  const user = await User.findByIdAndUpdate(req.auth.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ error: 'Account not found' });
  res.json({ user: publicUser(user) });
}));

app.get('/api/products', asyncRoute(async (req, res) => {
  const filter = { active: true };
  if (req.query.category && req.query.category !== 'ALL') filter.category = String(req.query.category);
  if (req.query.q) filter.$text = { $search: String(req.query.q) };
  const sort = req.query.sort === 'price-asc' ? { price: 1 } : req.query.sort === 'price-desc' ? { price: -1 } : { createdAt: -1 };
  res.json(await Product.find(filter).sort(sort).limit(100));
}));

app.post('/api/products', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  res.status(201).json(await Product.create(req.body));
}));

app.patch('/api/products/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

app.delete('/api/products/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product archived' });
}));

app.get('/api/orders', requireAuth, asyncRoute(async (req, res) => {
  const filter = req.auth.role === 'admin' ? {} : { customer: req.auth.id };
  res.json(await Order.find(filter).populate('customer', 'name email').sort({ createdAt: -1 }));
}));

app.post('/api/orders', requireAuth, asyncRoute(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!Array.isArray(items) || !items.length || !shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.city || !shippingAddress?.street) {
    return res.status(400).json({ error: 'Order items and complete shipping address are required' });
  }
  if (!['chapa', 'telebirr', 'card'].includes(paymentMethod)) return res.status(400).json({ error: 'Unsupported payment method' });
  const quantities = new Map();
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Each item must include a valid product and quantity' });
    }
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, active: true });
  if (products.length !== quantities.size) return res.status(400).json({ error: 'One or more products are unavailable' });
  const orderItems = products.map((product) => ({ product: product.id, title: product.title, quantity: quantities.get(product.id), unitPrice: product.price }));
  const reserved = [];
  for (const item of orderItems) {
    const product = await Product.findOneAndUpdate(
      { _id: item.product, active: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );
    if (!product) {
      await Promise.all(reserved.map((entry) => Product.updateOne({ _id: entry.product }, { $inc: { stock: entry.quantity } })));
      return res.status(409).json({ error: `Insufficient stock for ${item.title}` });
    }
    reserved.push(item);
  }
  const total = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  try {
    const order = await Order.create({ customer: req.auth.id, items: orderItems, total, shippingAddress, paymentMethod });
    res.status(201).json(order);
  } catch (err) {
    await Promise.all(reserved.map((entry) => Product.updateOne({ _id: entry.product }, { $inc: { stock: entry.quantity } })));
    throw err;
  }
}));

app.patch('/api/orders/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const transitions = {
    Pending: ['Approved', 'Cancelled'],
    Approved: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
  };
  if (!Object.values(transitions).flat().includes(req.body.status)) return res.status(400).json({ error: 'Invalid order status' });
  const existing = await Order.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Order not found' });
  if (!transitions[existing.status]?.includes(req.body.status)) return res.status(409).json({ error: 'That order status transition is not allowed' });
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: existing.status },
    { status: req.body.status },
    { new: true },
  ).populate('customer', 'name email');
  if (!order) return res.status(409).json({ error: 'Order status changed; refresh and try again' });
  if (req.body.status === 'Cancelled' && existing.status !== 'Cancelled') {
    await Promise.all(existing.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })));
  }
  res.json(order);
}));

app.get('/api/admin/summary', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [users, products, orders, revenue, bestSellers] = await Promise.all([
    User.countDocuments(), Product.countDocuments({ active: true }), Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', title: { $first: '$items.title' }, units: { $sum: '$items.quantity' } } },
      { $sort: { units: -1 } }, { $limit: 5 },
    ]),
  ]);
  res.json({ users, products, orders, revenue: revenue[0]?.total || 0, bestSellers });
}));

app.get('/api/admin/users', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  res.json(await User.find({}, 'name email role createdAt').sort({ createdAt: -1 }));
}));

app.patch('/api/admin/users/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  if (!['customer', 'admin'].includes(req.body.role)) return res.status(400).json({ error: 'Invalid user role' });
  if (req.params.id === req.auth.id && req.body.role !== 'admin') return res.status(400).json({ error: 'You cannot remove your own administrator access' });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
}));

app.use((err, _req, res, _next) => {
  if (err.code === 11000) return res.status(409).json({ error: 'A record with that value already exists' });
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/estore-ai')
  .then(async () => {
    if (await Product.countDocuments() === 0) {
      await Product.insertMany([
        { category: 'ELECTRONICS', title: 'High-Performance Laptop', description: 'Powerful laptop for programming, gaming, and professional work.', price: 45000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', stock: 12 },
        { category: 'ELECTRONICS', title: 'Latest Smartphone Pro', description: 'Advanced camera, fast processor, and all-day battery life.', price: 32000, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', stock: 18 },
        { category: 'VEHICLES', title: 'Mountain Bicycle', description: 'Sturdy and durable bike for mountain trails and city commuting.', price: 15000, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800', stock: 9 },
        { category: 'AUTOMOTIVE', title: 'Smart Car Dash Cam & GPS', description: 'HD night vision car camera for safety and route tracking.', price: 6500, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c351?w=800', stock: 25 },
      ]);
    }
    const existingSeedTitles = new Set(await Product.distinct('title', { title: { $in: catalogSeed.map((product) => product.title) } }));
    const missingSeedProducts = catalogSeed.filter((product) => !existingSeedTitles.has(product.title));
    if (missingSeedProducts.length) await Product.insertMany(missingSeedProducts);
    await Product.bulkWrite(catalogSeed.map((product) => ({
      updateOne: {
        filter: { title: product.title },
        update: { $set: { image: product.image } },
      },
    })));
    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });