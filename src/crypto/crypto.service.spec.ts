import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import * as CryptoJS from 'crypto-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs.readFileSync to prevent actual file system access during tests
jest.mock('fs', () => ({
  readFileSync: jest.fn((filePath: string) => {
    if (filePath.includes('private.key')) {
      return `-----BEGIN RSA PRIVATE KEY-----
      MockPrivateKeyContent
      -----END RSA PRIVATE KEY-----`;
    }
    if (filePath.includes('public.key')) {
      return `-----BEGIN PUBLIC KEY-----
      MockPublicKeyContent
      -----END PUBLIC KEY-----`;
    }
    return '';
  }),
}));

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAesKey', () => {
    it('should generate a base64 encoded AES key', () => {
      const key = service.generateAesKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      // Basic check for base64 format (should not contain non-base64 characters)
      expect(key).toMatch(/^[a-zA-Z0-9+/=]+$/);
    });
  });

  describe('AES Encryption/Decryption', () => {
    const testPayload = 'hello world';
    const testAesKey = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Base64);

    it('should encrypt data with AES and decrypt it back to original', () => {
      const encrypted = service.encryptAes(testPayload, testAesKey);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toEqual(testPayload); // Should not be the same as original

      const decrypted = service.decryptAes(encrypted, testAesKey);
      expect(decrypted).toEqual(testPayload);
    });
  });

  describe('RSA Encryption/Decryption', () => {
    let cryptoService: CryptoService;

    beforeEach(() => {
      cryptoService = new CryptoService();

      // Set RSA KEY
      cryptoService['publicKey'] = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG7CzJI1Lo/TZs2A0rDeI7BNXYxm
kGIsSRvlcH+3k0nAbaIYOwqyi0UieqQLNGd3GlhXupA84ajANkCPZf+/UiZTYGqN
HfVhC7OoeiW9R3XKXFGWs7QsYSilZxSBD32av2+jB+MHmueVo1luwZmnYIlmLu7F
Za/stvrQtzMnKaabAgMBAAE=
-----END PUBLIC KEY-----`;

      cryptoService['privateKey'] = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgG7CzJI1Lo/TZs2A0rDeI7BNXYxmkGIsSRvlcH+3k0nAbaIYOwqy
i0UieqQLNGd3GlhXupA84ajANkCPZf+/UiZTYGqNHfVhC7OoeiW9R3XKXFGWs7Qs
YSilZxSBD32av2+jB+MHmueVo1luwZmnYIlmLu7FZa/stvrQtzMnKaabAgMBAAEC
gYBDzZ4bttCtHPWmwcC4oxPn3kRxKWwjnQaYPClVFdTlZhX3D6w9DTVyefvnpjBL
Uj7fa7z6hTqC6j+L3/zJxZ4MpQf6ecOV+TJtrPzRu3gRVHrXEvFWNLthnLpVJ3fk
DIzTp6nuB8DUbcJ1LAbwOC2tQGUPPta8UWwLao0EiaPHAQJBAMdw6naarVxfllll
W6XPWug6D50d+s7b3+BFaOSdkudHb5mO+n7mdG9n7aEJvp0vLogzczi/Xs0xip+J
46PfexsCQQCOK9rqvrqCAXR70/+U90Rmr4LAAZ6naLh7V4BZXhGLvcgZDrEfjzPg
t9HIKn7SFCv8PtsOAxvPCQDJ2/O7AbqBAkEAjYObekjKle7lWc1HuGFnWbxI8+0f
18PAGPxnL0B3yk+v6j+/kmenWp1dyZSGgjXGSLJpIWz4sZRjjkxjEBY03QJAZGjY
zl4yP0tjx2js43rXlmZyw8ThFn9Be+tKvNNRNQ6uWfQkaJOtIhLxWJuawih5AEgs
UfMkGs7S/b4Yn4UTAQJBAKQs/2FWC77eGSzyqRCVRyRFCKrd8T7QHIGd36Rl5ZE9
INK/8T/QmkRvs94Y4CraS2Ky0BEhGgCU2xRJ5PrfjrI=
-----END RSA PRIVATE KEY-----`;
    });

    it('should encrypt and decrypt text correctly', () => {
      const plainText = 'Hello RSA!';
      const encrypted = cryptoService.encryptRsaWithPublicKey(plainText);
      const decrypted = cryptoService.decryptRsaWithPrivateKey(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it('should throw error on invalid ciphertext', () => {
      expect(() => {
        cryptoService.decryptRsaWithPrivateKey('invalid_cipher');
      }).toThrow();
    });
  });

});