import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectSchema, StoredObject } from './schemas/object.schema';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: StoredObject.name, schema: ObjectSchema }])],
  controllers: [ObjectsController],
  providers: [ObjectsService, S3Service],
})
export class ObjectsModule {}
