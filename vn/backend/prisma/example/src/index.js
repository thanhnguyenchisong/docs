const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['query'] });
const app = express();
app.use(express.json());

// ── Users ──

app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  res.json({ data, total, page, limit });
});

app.get('/api/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      profile: true,
      posts: { include: { tags: { include: { tag: true } } } },
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(user);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Email already exists' });
    res.status(400).json({ error: e.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(user);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).end();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    res.status(400).json({ error: e.message });
  }
});

// ── Posts ──

app.get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const where = {};
  if (req.query.published === 'true') where.published = true;
  if (req.query.tag) where.tags = { some: { tag: { name: req.query.tag } } };

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { author: { select: { id: true, name: true } }, tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where }),
  ]);
  res.json({ data, total, page, limit });
});

app.get('/api/posts/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { author: { select: { id: true, name: true } }, tags: { include: { tag: true } } },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.post('/api/posts', async (req, res) => {
  const { title, content, published, authorId, tagIds } = req.body;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId,
        tags: tagIds ? { create: tagIds.map(id => ({ tag: { connect: { id } } })) } : undefined,
      },
      include: { author: { select: { id: true, name: true } }, tags: { include: { tag: true } } },
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Tags ──

app.get('/api/tags', async (req, res) => {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
  });
  res.json(tags);
});

// ── Aggregate ──

app.get('/api/stats', async (req, res) => {
  const [userCount, postCount, publishedCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
  ]);
  res.json({ users: userCount, posts: postCount, publishedPosts: publishedCount });
});

// ── Start ──

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Prisma Example API: http://localhost:${PORT}`);
  console.log(`Endpoints: /api/users, /api/posts, /api/tags, /api/stats`);
});

process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
