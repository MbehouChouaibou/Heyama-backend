import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateObjectDto } from './dto/create-object.dto';
import { ObjectDocument, StoredObject } from './schemas/object.schema';
import { S3Service } from '../s3/s3.service';
import type { Multer } from 'multer';

@Injectable()
export class ObjectsService {
  private readonly logger = new Logger(ObjectsService.name);

  constructor(
    @InjectModel(StoredObject.name)
    private readonly objectModel: Model<ObjectDocument>,
    private readonly s3: S3Service,
  ) {}

  /**
   * Creates a new object with required image upload to S3
   * @throws BadRequestException if file is missing or invalid
   * @throws InternalServerErrorException if S3 upload fails
   */
  async create(dto: CreateObjectDto, file?: Multer.File): Promise<ObjectDocument> {
    // Critical safety check – prevents undefined.buffer crash
    if (!file || !file.buffer) {
      this.logger.warn('Create attempt without file');
      throw new BadRequestException('Image file is required');
    }

    // Basic validation – only allow images
    if (!file.mimetype.startsWith('image/')) {
      this.logger.warn(`Invalid file type received: ${file.mimetype}`);
      throw new BadRequestException('Only image files are allowed (jpg, png, webp, etc.)');
    }

    try {
      this.logger.log(`Uploading file: ${file.originalname} (${file.size} bytes)`);

      const upload = await this.s3.upload(
        file.buffer,
        file.mimetype,
        file.originalname,
      );

      this.logger.log(`S3 upload successful → URL: ${upload.url}, Key: ${upload.key}`);

      const created = await this.objectModel.create({
        title: dto.title,
        description: dto.description ?? undefined, // clean optional field
        imageUrl: upload.url,
        s3Key: upload.key,
      });

      this.logger.debug(`Object created with ID: ${created._id}`);

      return created;
    } catch (error) {
      this.logger.error('Failed to create object', error);
      
      if (error instanceof BadRequestException) {
        throw error; // re-throw validation errors
      }
      
      // Wrap other errors (S3, DB, etc.)
      throw new InternalServerErrorException('Failed to create object – please try again later');
    }
  }

  async findAll(): Promise<ObjectDocument[]> {
    return this.objectModel
      .find()
      .sort({ createdAt: -1 }) // newest first
      .exec();
  }

  async findOne(id: string): Promise<ObjectDocument> {
    const found = await this.objectModel.findById(id).exec();
    if (!found) {
      throw new NotFoundException(`Object with ID ${id} not found`);
    }
    return found;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const doc = await this.objectModel.findByIdAndDelete(id).exec();
    
    if (!doc) {
      throw new NotFoundException(`Object with ID ${id} not found`);
    }

    // Clean up S3 if key exists
    if (doc.s3Key) {
      try {
        await this.s3.delete(doc.s3Key);
        this.logger.log(`S3 object deleted: ${doc.s3Key}`);
      } catch (err) {
        this.logger.warn(`Failed to delete S3 object ${doc.s3Key}`, err);
        // Do NOT fail the whole delete – orphan files are better than failed API
      }
    }

    return { deleted: true };
  }
}