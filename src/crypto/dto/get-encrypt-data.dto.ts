import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class GetEncryptDataRequestDto {
  @ApiProperty({
    description: 'Payload to be encrypted',
    minLength: 0,
    maxLength: 2000,
    example: 'This is a secret message.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  payload: string;
}

export class GetEncryptDataResponseDto {
  @ApiProperty({ example: true })
  successful: boolean;

  @ApiProperty({ example: null, nullable: true })
  error_code: string | null;

  @ApiProperty({
    example: { data1: 'encrypted_key', data2: 'encrypted_payload' },
    nullable: true,
  })
  data: {
    data1: string;
    data2: string;
  } | null;
}