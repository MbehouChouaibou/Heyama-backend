import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import type { Multer } from 'multer';

@ApiTags('objects')
@Controller('objects')
export class ObjectsController {
  constructor(private readonly svc: ObjectsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))     // ← changed to 'file' (most common convention)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create new object with required image',
    description: 'Requires a file upload (image) along with title and optional description',
  })
  @ApiBadRequestResponse({ description: 'Missing required image file or invalid data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Beautiful Apartment in Yaoundé',
        },
        description: {
          type: 'string',
          example: '3 bedrooms, fully furnished, great view...',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, etc.) – required',
        },
      },
      required: ['title', 'file'],
    },
  })
  async create(
    @Body() dto: CreateObjectDto,
    @UploadedFile() file?: Multer.File,
  ) {
    // Safety check – very important to avoid undefined.buffer crash
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Optional but recommended: basic content-type validation
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed (jpg, png, webp, etc.)');
    }

    return this.svc.create(dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all objects (sorted by newest first)' })
  async findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one object by ID' })
  async findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete object by ID (also removes from S3)' })
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}