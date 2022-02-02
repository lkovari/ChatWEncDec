import { ICustomMessage } from "./custom-message.interface";

export class CustomMessage implements ICustomMessage {
    textMessage: string;
    hmacsha1: any;
    iv: CryptoJS.lib.WordArray;
    constructor(textMessage: string, hmacsha1: any, iv: CryptoJS.lib.WordArray) {
        this.textMessage = textMessage;
        this.hmacsha1 = hmacsha1;
        this.iv = iv;
    };    
}
