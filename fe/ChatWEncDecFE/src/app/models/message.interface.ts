import { ICustomMessage } from "./custom-message.interface";

export interface IMessage {
    sender: string;
    content: string;
    isBroadcast: boolean;
}
