import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}
  async create(createArticleDto: CreateArticleDto) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { title: createArticleDto.title },
    });
    if (existingArticle) {
      throw new ConflictException({
        message: 'Conflict Operation',
        error: `Article with title ${createArticleDto.title} already exist`,
      });
    }
    return this.prisma.article.create({ data: createArticleDto });
  }

  findDrafts() {
    return this.prisma.article.findMany({
      where: { published: false },
      include: { author: true },
    });
  }

  findAll() {
    return this.prisma.article.findMany({
      where: { published: true },
      include: { author: true },
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!article) {
      throw new NotFoundException({
        message: 'Resource Not Found',
        error: `Article with id ${id} does not exist.`,
      });
    }
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      return new NotFoundException({
        message: 'Not Found',
        error: `Article with id ${id} does not exist`,
      });
    }
    return this.prisma.article.update({
      where: { id },
      include: { author: true },
      data: updateArticleDto,
    });
  }

  async remove(id: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      return new NotFoundException({
        message: 'Not Found',
        error: `Article with id ${id} does not exist`,
      });
    }
    return this.prisma.article.delete({ where: { id } });
  }
}
