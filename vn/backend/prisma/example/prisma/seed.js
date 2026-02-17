const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Tags
  const tagJS = await prisma.tag.upsert({ where: { name: 'javascript' }, update: {}, create: { name: 'javascript' } });
  const tagTS = await prisma.tag.upsert({ where: { name: 'typescript' }, update: {}, create: { name: 'typescript' } });
  const tagPrisma = await prisma.tag.upsert({ where: { name: 'prisma' }, update: {}, create: { name: 'prisma' } });

  // Users + Posts
  const an = await prisma.user.upsert({
    where: { email: 'an@example.com' },
    update: {},
    create: {
      name: 'Nguyen Van An',
      email: 'an@example.com',
      role: 'admin',
      profile: { create: { bio: 'Full-stack developer' } },
      posts: {
        create: [
          {
            title: 'Getting Started with Prisma',
            content: 'Prisma is a next-generation ORM for Node.js and TypeScript.',
            published: true,
            tags: { create: [{ tag: { connect: { id: tagPrisma.id } } }, { tag: { connect: { id: tagTS.id } } }] },
          },
          {
            title: 'Advanced Prisma Queries',
            content: 'Learn about filtering, pagination, and relations.',
            published: true,
            tags: { create: [{ tag: { connect: { id: tagPrisma.id } } }] },
          },
        ],
      },
    },
  });

  const binh = await prisma.user.upsert({
    where: { email: 'binh@example.com' },
    update: {},
    create: {
      name: 'Tran Binh',
      email: 'binh@example.com',
      posts: {
        create: {
          title: 'JavaScript Tips',
          content: 'Useful tips for JavaScript developers.',
          published: true,
          tags: { create: [{ tag: { connect: { id: tagJS.id } } }] },
        },
      },
    },
  });

  console.log('Seeded:', { an: an.id, binh: binh.id, tags: [tagJS.id, tagTS.id, tagPrisma.id] });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
