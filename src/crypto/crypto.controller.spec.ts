import { Test, TestingModule } from '@nestjs/testing';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { GetEncryptDataRequestDto} from './dto/get-encrypt-data.dto';
import {GetDecryptDataRequestDto} from './dto/get-decrypt-data.dto'

describe('CryptoController', () => {
  let controller: CryptoController;
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [
        {
          provide: CryptoService,
          useValue: {
            generateAesKey: jest.fn(() => 'mockAesKey'),
            encryptAes: jest.fn((payload, key) => `encrypted_${payload}_with_${key}`),
            decryptAes: jest.fn((data, key) => `decrypted_${data}_with_${key}`),
            encryptRsaWithPublicKey: jest.fn((key) => `rsa_encrypted_${key}`),
            decryptRsaWithPrivateKey: jest.fn((encryptedKey) => `rsa_decrypted_${encryptedKey}`),
          },
        },
      ],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEncryptData', () => {
    it('should return encrypted data with successful response', async () => {
      const requestBody: GetEncryptDataRequestDto = { payload: 'test_payload' };
      const result = await controller.getEncryptData(requestBody);

      expect(service.generateAesKey).toHaveBeenCalled();
      expect(service.encryptAes).toHaveBeenCalledWith('test_payload', 'mockAesKey');
      expect(service.encryptRsaWithPublicKey).toHaveBeenCalledWith('mockAesKey');

      expect(result).toEqual({
        successful: true,
        error_code: null,
        data: {
          data1: 'rsa_encrypted_mockAesKey',
          data2: 'encrypted_test_payload_with_mockAesKey',
        },
      });
    });

    it('should return error response if encryption fails', async () => {
      jest.spyOn(service, 'encryptRsaWithPublicKey').mockImplementationOnce(() => {
        throw new Error('RSA encryption error');
      });

      const requestBody: GetEncryptDataRequestDto = { payload: 'test_payload' };
      const result = await controller.getEncryptData(requestBody);

      expect(result).toEqual({
        successful: false,
        error_code: 'RSA encryption error',
        data: null,
      });
    });
  });

  describe('getDecryptData', () => {
    it('should return decrypted payload with successful response', async () => {
      const requestBody: GetDecryptDataRequestDto = {
        data1: 'rsa_encrypted_aes_key',
        data2: 'aes_encrypted_payload',
      };
      const result = await controller.getDecryptData(requestBody);

      expect(service.decryptRsaWithPrivateKey).toHaveBeenCalledWith('rsa_encrypted_aes_key');
      expect(service.decryptAes).toHaveBeenCalledWith('aes_encrypted_payload', 'rsa_decrypted_rsa_encrypted_aes_key');

      expect(result).toEqual({
        successful: true,
        error_code: null,
        data: {
          payload: 'decrypted_aes_encrypted_payload_with_rsa_decrypted_rsa_encrypted_aes_key',
        },
      });
    });

    it('should return error response if decryption fails', async () => {
      jest.spyOn(service, 'decryptRsaWithPrivateKey').mockImplementationOnce(() => {
        throw new Error('RSA decryption error');
      });

      const requestBody: GetDecryptDataRequestDto = {
        data1: 'invalid_data1',
        data2: 'invalid_data2',
      };
      const result = await controller.getDecryptData(requestBody);

      expect(result).toEqual({
        successful: false,
        error_code: 'RSA decryption error',
        data: null,
      });
    });
  });
});