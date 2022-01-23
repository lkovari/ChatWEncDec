import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from './models/message.model';
import { WebSocketSubject } from 'rxjs/webSocket';
import { debounceTime, map } from 'rxjs/operators';
import { CustomMessage } from './models/custom-message.model';
import { EncrptDecryptService } from './services/encdec/encrpt-decrypt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
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
      userName: [ null, { validators: [
        Validators.required, Validators.minLength(this.userNameMinLength),
        Validators.maxLength(this.userNameMaxLength)
      ], updateOn: 'blur' } ],
      decryptKey: [ {value: null, disabled: this.decryptKeyDisabled} ], updateOn: 'blur',
      message: [ null ]
    });
  }

  
  webSocketConnect() {
    // if not connected to the server then connecting
    if (!this.webSocket$) {
      // create 
      this.webSocket$ = new WebSocketSubject('ws://localhost:7777');
      // replace the button title "Connect" with "Connected"
      if (this.webSocket$) {
        this.connectetButtonTitle = 'Connected';
      }
      /* former tought, in the map handling the enc/dec etc.
      this.webSocket$.pipe(
        map((mess: Message) => {
          return mess;
        })
      );
      */
      // listening WebSocket messages
      this.webSocket$.subscribe((message: Message) => {
        const decryptKey = this.dataEntryForm.get('decryptKey')?.value;
        // skip Connected notification
        if (message.content !== this.MSG_CONNECTION_MESSAGE) {
          // parse message text to object
          const messageObject = JSON.parse(message.content);
          // create digest from received textMessage
          const digest = this.encDecService.createHMACSHA1Digest(messageObject.textMessage, decryptKey);            
          // compare the digests
          if (digest === messageObject.hmacsha1) {
            // decrypt the message
            const decrypted = this.encDecService.decrypt(messageObject.textMessage, decryptKey);
            // store message to the message object 
            message.content = decrypted;
            // push message to sentMessages (which will display)
            this.sentMessages.push(message);
          } else {

          }
        } else {
          // "Connected" notification simply display
          this.sentMessages.push(message);
        }
      },
      (err) => console.error(err),
      () => console.info('Completed!')
    );
    this.encryptKey = this.generateSecretKey();
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

  extractMessage(message: Message): string {
    return message.sender + ' : ' + message.content;
  }

  onBlurUserName(event: Event) {
    this.webSocketConnect();
  }

  onSendMessage(event: Event) {
    this.currentUserName = this.dataEntryForm.get('userName')?.value;
    let textMessage = this.dataEntryForm.get('message')?.value;

    const encryptedText = this.encDecService.encrypt(textMessage, this.encryptKey);
    const digest = this.encDecService.createHMACSHA1Digest(encryptedText, this.encryptKey);
    
    const customMessage = new CustomMessage(encryptedText, digest);    
    const messageObject = JSON.stringify(customMessage);

    const messageTOMine = new Message(this.currentUserName, textMessage, true);
    const message = new Message(this.currentUserName, messageObject, true);

    this.sentMessages.push(messageTOMine);
    this.webSocket$.next(message);

    console.log(`Message send ${textMessage}.`);
  }
}
