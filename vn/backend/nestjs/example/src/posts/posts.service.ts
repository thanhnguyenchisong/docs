import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async create(dto: CreatePostDto, authorId: number) {
    return this.prisma.post.create({
      data: { ...dto, authorId },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async remove(id: number) {
    try {
      await this.prisma.post.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException(`Post #${id} not found`);
      throw e;
    }
  }
}
