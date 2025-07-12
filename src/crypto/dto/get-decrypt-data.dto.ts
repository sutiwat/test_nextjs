import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetDecryptDataRequestDto {
  @ApiProperty({ description: 'Encrypted AES key (RSA encrypted)', example: 'base64_string_of_data1' })
  @IsString()
  @IsNotEmpty()
  data1: string;

  @ApiProperty({ description: 'AES encrypted payload', example: 'base64_string_of_data2' })
  @IsString()
  @IsNotEmpty()
  data2: string;
}

export class GetDecryptDataResponseDto {
  @ApiProperty({ example: true })
  successful: boolean;

  @ApiProperty({ example: null, nullable: true })
  error_code: string | null;

  @ApiProperty({
    example: { payload: 'decrypted_message' },
    nullable: true,
  })
  data: {
    payload: string;
  } | null;
}