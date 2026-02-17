import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ example: 'This is the content...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
