export interface ICustomMessage {
    textMessage: string;
    hmacsha1: any;
    iv: CryptoJS.lib.WordArray;
}