import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from './models/message.model';
import { WebSocketSubject } from 'rxjs/webSocket';
import { CustomMessage } from './models/custom-message.model';
import { EncrptDecryptService } from './services/encdec/encrpt-decrypt.service';
import { EncryptedWrapper } from './models/encripted-wrapper.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = "WebSocket ´Chat´ Example";
  private MSG_CONNECTION_MESSAGE = 'Connected'
  autoResize = false;
  participant = undefined;
  dataEntryForm!: FormGroup;
  userNameMinLength = 3;
  userNameMaxLength = 25;
  sentMessages: Message[] = [];
  webSocket$!: WebSocketSubject<Message>;
  currentUserName!: string;
  connectetButtonTitle = 'Connect';
  encryptKey!: string;
  decryptKeyDisabled = false;

  constructor(private formBuilder: FormBuilder, private encDecService: EncrptDecryptService) {
    this.dataEntryForm = this.formBuilder.group({
      userName: [null, {
        validators: [
          Validators.required, Validators.minLength(this.userNameMinLength),
          Validators.maxLength(this.userNameMaxLength)
        ], updateOn: 'blur'
      }],
      decryptKey: [{ value: null, disabled: this.decryptKeyDisabled }], updateOn: 'blur',
      message: [null]
    });
  }

  /**
   * 
   * @returns WebSocketSubject
   */
  webSocketConnect(): WebSocketSubject<any> {
    // create 
    let webSocket = new WebSocketSubject('ws://localhost:7777');
    // replace the button title "Connect" with "Connected"
    if (this.webSocket$) {
      this.connectetButtonTitle = 'Connected';
    }
    // generate 3ncrypt key
    this.encryptKey = this.generateSecretKey();
    return webSocket;
  }

  webSocketListener() {
    if (this.webSocket$) {
      this.webSocket$.subscribe((message: Message) => {
        const decryptKey = this.dataEntryForm.get('decryptKey')?.value;
        // skip Connected notification
        if (message.content !== this.MSG_CONNECTION_MESSAGE) {
          // parse message text to object
          const messageObject = <CustomMessage>JSON.parse(message.content);
          // is the decrypt key entered?
          if (decryptKey) {
            // create digest from received textMessage
            const digest = this.encDecService.createHMACSHA1Digest(messageObject.textMessage, decryptKey);
            // compare the digests
            if (digest === messageObject.hmacsha1) {
              // decrypt the message
              const decrypted = this.encDecService.decrypt(messageObject.textMessage, decryptKey, messageObject.iv);
              // store message to the message object 
              message.content = decrypted;
              // push message to sentMessages (which will display)
              this.sentMessages.push(message);
            } else {
              console.error('Message integrity check failed!');
            }
          } else {
              // skip message integrity check
              console.warn('Decrypt key not entered, therefore no integrity check and unable to decrypt the message');
              // push message without decrypt
              this.sentMessages.push(message);
          }
        } else {
          // "Connected" notification simply display
          this.sentMessages.push(message);
        }
      },
        (err) => console.error(err),
        () => console.info('Completed!')
      );
    } else {
      console.error('Unable to listening WebSocket!');
    }
  }

  ngOnInit(): void {

  }

  private generateSecretKey(): string {
    let numKey = (Math.random() * Number.MAX_SAFE_INTEGER);
    let strKey = btoa('' + numKey);
    console.log(`Decrypt key ${strKey}`);
    return strKey;
    // return 'Mjc4ODAxNDAxOTcyMTkxNy41';
  }

  /**
   * 
   * @param message: Message 
   * @returns string
   */
  extractMessage(message: Message): string {
    return message.sender + ' : ' + message.content;
  }

  /**
   * 
   * @param event Event
   */
  onBlurUserName(event: Event) {
    if (!this.webSocket$) {
      this.webSocket$ = this.webSocketConnect();
    }
    this.webSocketListener();
    console.log(`onBlurUserName ${event}.`);
  }

  /**
   * 
   * @param event Event
   */
  onSendMessage(event: Event) {
    this.currentUserName = this.dataEntryForm.get('userName')?.value;
    let textMessage = this.dataEntryForm.get('message')?.value;

    const encryptedWrapper = this.encDecService.encrypt(textMessage, this.encryptKey);
    const digest = this.encDecService.createHMACSHA1Digest(encryptedWrapper.encrypted, this.encryptKey);

    const customMessage = new CustomMessage(encryptedWrapper.encrypted, digest, encryptedWrapper.iv);
    const messageObject = JSON.stringify(customMessage);

    const messageTOMine = new Message(this.currentUserName, textMessage, true);
    const message = new Message(this.currentUserName, messageObject, true);

    this.sentMessages.push(messageTOMine);
    this.webSocket$.next(message);

    console.log(`onSendMessage ${textMessage} ${event}.`);
  }
}
