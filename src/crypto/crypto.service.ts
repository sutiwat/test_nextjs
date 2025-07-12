import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as CryptoJS from 'crypto-js'; //AES
import { publicEncrypt, privateDecrypt, constants } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CryptoService {
    private publicKey: string;
    private privateKey: string;

    constructor() {
        try {
            const keyDir = path.resolve(process.cwd(), 'keys');
            this.privateKey = fs.readFileSync(path.join(keyDir, 'private.key'), 'utf8');
            this.publicKey = fs.readFileSync(path.join(keyDir, 'public.key'), 'utf8');
        } catch (error) {
            console.error('Failed to load RSA keys:', error);
            throw new InternalServerErrorException('Server configuration error: RSA keys not found.');
        }
    }

    /**
     * Generate Key AES
     * @return {string}
     */
    generateAesKey(): string {
        const key = CryptoJS.lib.WordArray.random(128 / 8);
        return key.toString(CryptoJS.enc.Base64);
    }

    /**
     * Encrypt Data with AES
     * @param data 
     * @param aesKey
     * @return {string}
     */
    encryptAes(data: string, aesKey: string): string {
        const key = CryptoJS.enc.Base64.parse(aesKey);
        const encrypted = CryptoJS.AES.encrypt(data, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    }

    /**
     * Decrpt AES
     * @param encryptData
     * @param aesKey
     * @return {string}
     */
    decryptAes(encryptData: string, aesKey: string): string {
        const key = CryptoJS.enc.Base64.parse(aesKey);
        const decrypted = CryptoJS.AES.decrypt(encryptData, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * encryption with RSA Key
     * @param aesKey 
     * @returns {string}
     */
    encryptRsaWithPublicKey(aesKey: string): string {
        try {
            // use rsa public key encrypt
            const encrypted = publicEncrypt(
                {
                    key: this.publicKey,
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                Buffer.from(aesKey, 'utf8'),
            );
            return encrypted.toString('base64');

        } catch (error) {
            console.error('RSA encryption error:', error);
            throw new InternalServerErrorException('Failed to encrypt AES key with RSA.');
        }
    }

    /**
     * Decrypt AES with RSA key
     * @param encryptAeskey 
     * @return {string} 
     */
    decryptRsaWithPrivateKey(encryptedAesKey: string): string {
        try {
            // use private key rsa for decryp
            const decrypted = privateDecrypt(
                {
                    key: this.privateKey,
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                Buffer.from(encryptedAesKey, 'base64'),
            );
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('RSA decryption error:', error);
            throw new InternalServerErrorException('Failed to decrypt AES key with RSA.');
        }
    }
}
