import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { GetEncryptDataRequestDto, GetEncryptDataResponseDto } from './dto/get-encrypt-data.dto';
import { GetDecryptDataRequestDto, GetDecryptDataResponseDto } from './dto/get-decrypt-data.dto';

@ApiTags('Encryption/Decryption')
@Controller() // ทำให้ endpoint เป็น /get-encrypt-data และ /get-decrypt-data โดยตรง
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypt payload using AES and RSA' })
  @ApiResponse({ status: 200, description: 'Payload encrypted successfully', type: GetEncryptDataResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEncryptData(
    @Body() body: GetEncryptDataRequestDto,
  ): Promise<GetEncryptDataResponseDto> {
    try {
      // 1. Validate request payload (handled by DTO validation pipes)
      const payload = body.payload;

      // 2. Create AES key by Generate random string
      const aesKey = this.cryptoService.generateAesKey();

      // 3. For data2, encrypt payload with AES key
      const data2 = this.cryptoService.encryptAes(payload, aesKey);

      // 4. For data1, encrypt key from step2 with private key
      const data1 = this.cryptoService.encryptRsaWithPublicKey(aesKey);

      // 5. response data1, data2 with above api spec
      return {
        successful: true,
        error_code: null,
        data: {
          data1: data1,
          data2: data2,
        },
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return {
        successful: false,
        error_code: error.message || 'ENCRYPTION_FAILED',
        data: null,
      };
    }
  }

  @Post('get-decrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrypt data using RSA and AES' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully', type: GetDecryptDataResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDecryptData(
    @Body() body: GetDecryptDataRequestDto,
  ): Promise<GetDecryptDataResponseDto> {
    try {
      // 1. Validate request payload (handled by DTO validation pipes)
      const { data1, data2 } = body;

      // 2. Decrypt AES key with RSA public key
      const aesKey = this.cryptoService.decryptRsaWithPrivateKey(data1);

      // 3. Decrypt data2 with AES key
      const payload = this.cryptoService.decryptAes(data2, aesKey);

      // 4. Response payload with above api spec
      return {
        successful: true,
        error_code: null,
        data: {
          payload: payload,
        },
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      return {
        successful: false,
        error_code: error.message || 'DECRYPTION_FAILED',
        data: null,
      };
    }
  }
}