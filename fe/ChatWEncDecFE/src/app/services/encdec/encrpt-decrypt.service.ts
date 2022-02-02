import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';  
import { EncryptedWrapper } from 'src/app/models/encripted-wrapper.model';

@Injectable({
  providedIn: 'root'
})
export class EncrptDecryptService {
  private  SOURCE_OF_IV = "This phrase is the source of the initialization vector for CFB encrypt mode, just for demonstration purposes!";
  constructor() { }

  /**
   * 
   * @param passphrase: string - the secret passphrase 
   * @returns WordArray - the generated 256 bit key from the passphrase
   */
  generate256bitKey(passphrase: string): CryptoJS.lib.WordArray {
    let salt = CryptoJS.lib.WordArray.random(128 / 8);
    let options = { keySize: 256 / 32 }
    return CryptoJS.PBKDF2(passphrase, salt, options );
  }

  /**
   * 
   * https://cryptojs.gitbook.io/docs/#the-cipher-algorithms
   * CryptoJS supports AES-128, AES-192, and AES-256. 
   * It will pick the variant by the size of the key you pass in. 
   * If you use a passphrase, then it will generate a 256-bit key.
   * ( so I used passphrase instead of the function generate256bitKey )
   * 
   * @param plain: string - the plain text 
   * @param key: string - the passphrase 
   * @returns: EncryptedWrapper, contains the encrypted text/cipher text and the initialization vector
   */
  encrypt(plain: string, key: string): EncryptedWrapper {
    const _key = CryptoJS.enc.Utf8.parse(key);
    // _iv = CryptoJS.enc.Utf8.parse(key);
    const _iv = this.generate256bitKey(this.SOURCE_OF_IV);
    const options = { keySize: 16, iv: _iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.NoPadding };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(plain), _key, options);
    return new EncryptedWrapper(encrypted.toString(), _iv);
  }

  /**
   * 
   * @param encrypted : string - cipher text 
   * @param key : passphrase 
   * @param iv : CryptoJS.lib.WordArray - initialization vector
   * @returns string - plain text 
   */
  decrypt(encrypted: any, key: string, iv: CryptoJS.lib.WordArray): string {
    let _key = CryptoJS.enc.Utf8.parse(key);
    let _iv = iv;
    const options = { keySize: 16, iv: _iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.NoPadding };
    return CryptoJS.AES.decrypt(encrypted, _key, options).toString(CryptoJS.enc.Utf8);    
  }

  /**
   * 
   * @param text: string - crypted string 
   * @param key: passphrase 
   * @returns: string - HMAC-SHA1 digest 
   */
  createHMACSHA1Digest(text: string, key: string): string {
    let _key = CryptoJS.enc.Utf8.parse(key);
    return CryptoJS.HmacSHA1(text, _key).toString();
  }
  
}
