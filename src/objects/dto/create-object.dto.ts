import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateObjectDto {
  @ApiProperty({
    description: 'The title of the object (required)',
    example: 'My Important Document',
    minLength: 1,          // optional: enforce min length in docs
    maxLength: 200,        // optional
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Optional detailed description',
    example: 'This is a very detailed explanation of what this object represents...',
    maxLength: 2000,
  })
  description?: string;
}