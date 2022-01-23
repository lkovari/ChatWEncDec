import { CustomMessage } from "./custom-message.model";
import { IMessage } from "./message.interface"

export class Message implements IMessage {
    sender: string;
    content: string;
    isBroadcast: boolean;
    private _customMessage!: CustomMessage;
    get CustomMessage(): CustomMessage {
        this._customMessage = JSON.parse(this.content);
        return this._customMessage;
    }

    set CustomMessage(v: CustomMessage) {
        this._customMessage = v;
        this.content = JSON.stringify(v);
    }

    constructor(sender: string, /*customMessage: CustomMessage*/content: string, isBroadcast: boolean) {
        this.sender = sender;
        // this.content = JSON.stringify(customMessage);
        this.content = content;
        this.isBroadcast = isBroadcast;
    };
}