import { IEncryptedWrapper } from "./encrypted-wrapper.interface";

export class EncryptedWrapper implements IEncryptedWrapper {
    encrypted: any;
    iv: CryptoJS.lib.WordArray;
    constructor(encrypted: any, iv: CryptoJS.lib.WordArray) {
        this.encrypted = encrypted;
        this.iv = iv;
    }
}