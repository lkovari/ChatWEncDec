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
  title = "WebSocket Chat Example With Enc/Dec feature";
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
  secretKey!: string;

  constructor(private formBuilder: FormBuilder, private encDecService: EncrptDecryptService) {
    this.dataEntryForm = this.formBuilder.group({
      userName: [ null, { validators: [
        Validators.required, Validators.minLength(this.userNameMinLength),
        Validators.maxLength(this.userNameMaxLength)
      ], updateOn: 'blur' } ],
      message: [ null ], 
      updateOn: 'blur'
    });
  }

  
  webSocketConnect() {
    if (!this.webSocket$) {
      this.webSocket$ = new WebSocketSubject('ws://localhost:7777');
      if (this.webSocket$) {
        this.connectetButtonTitle = 'Connected';
      }
      this.webSocket$.pipe(
        map((mess: Message) => {
          return mess;
        })
      );
      this.webSocket$.subscribe((message: Message) => {
          if (message.content !== this.MSG_CONNECTION_MESSAGE) {
            const messageObject = JSON.parse(message.content);
            
            const digest = this.encDecService.createHMACSHA1Digest(messageObject.textMessage, this.secretKey);            
            if (digest === messageObject.hmacsha1) {
              const decrypted = this.encDecService.decrypt(messageObject.textMessage, this.secretKey);
              message.content = decrypted;
              this.sentMessages.push(message);
            }
          } else {
            this.sentMessages.push(message);
          }
        },
        (err) => console.error(err),
        () => console.info('Completed!')
      );
      this.secretKey = this.generateSecretKey();
    }
  }

  ngOnInit(): void {
    
  }  

  private generateSecretKey(): string {
    let numKey = (Math.random() * Number.MAX_SAFE_INTEGER);
    let strKey = btoa('' + numKey);
    // return strKey;
    return 'Mjc4ODAxNDAxOTcyMTkxNy41';
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

    const encryptedText = this.encDecService.encrypt(textMessage, this.secretKey);
    const digest = this.encDecService.createHMACSHA1Digest(encryptedText, this.secretKey);
    
    const customMessage = new CustomMessage(encryptedText, digest);    
    const messageObject = JSON.stringify(customMessage);

    const messageTOMine = new Message(this.currentUserName, textMessage, true);
    const message = new Message(this.currentUserName, messageObject, true);

    this.sentMessages.push(messageTOMine);
    this.webSocket$.next(message);

    console.log(`Message send ${textMessage}.`);
  }
}
