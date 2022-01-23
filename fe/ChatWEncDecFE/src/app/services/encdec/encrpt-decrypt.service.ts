import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';  

@Injectable({
  providedIn: 'root'
})
export class EncrptDecryptService {

  constructor() { }

  encrypt(plain: string, key: string): any {
    const _key = CryptoJS.enc.Utf8.parse(key);
    const _iv = CryptoJS.enc.Utf8.parse(key);
    const options = { keySize: 16, iv: _iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.NoPadding };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(plain), _key, options);
    return encrypted.toString();
  }

  decrypt(encrypted: any, key: string): string {
    let _key = CryptoJS.enc.Utf8.parse(key);
    let _iv = CryptoJS.enc.Utf8.parse(key);
    const options = { keySize: 16, iv: _iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.NoPadding };
    return CryptoJS.AES.decrypt(encrypted, _key, options).toString(CryptoJS.enc.Utf8);    
  }

  createHMACSHA1Digest(crypted: string, key: string): string {
    let _key = CryptoJS.enc.Utf8.parse(key);
    return CryptoJS.HmacSHA1(crypted, _key).toString();
  }

  
}
