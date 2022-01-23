import { ICustomMessage } from "./custom-message.interface";

export class CustomMessage implements ICustomMessage {
    textMessage: string;
    hmacsha1: any;
    constructor(textMessage: string, hmacsha1: any) {
        this.textMessage = textMessage;
        this.hmacsha1 = hmacsha1;
    };    
}
