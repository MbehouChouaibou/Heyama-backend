import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ObjectDocument = StoredObject & Document;

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class StoredObject {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  s3Key: string;

  @Prop()
  createdAt: Date;
}

export const ObjectSchema = SchemaFactory.createForClass(StoredObject);
