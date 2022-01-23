import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from './models/message.model';
import { WebSocketSubject } from 'rxjs/webSocket';
import { debounceTime, map } from 'rxjs/operators';
import { CustomMessage } from './models/custom-message.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  title = "Chat With Encryprion / Decription";
  autoResize = false;
  participant = undefined;
  dataEntryForm!: FormGroup;
  userNameMinLength = 3;
  userNameMaxLength = 25;
  sentMessages: Message[] = [];
  webSocket$!: WebSocketSubject<Message>;
  currentUserName!: string;
  connectetButtonTitle = 'Connect';

  constructor(private formBuilder: FormBuilder) {
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
          this.sentMessages.push(message);
        },
        (err) => console.error(err),
        () => console.info('Completed!')
      );
    }
  }

  ngOnInit(): void {
    
  }  

  extractMessage(message: Message): string {
    return message.sender + ' : ' + message.content;
  }

  onSendMessage(event: Event) {
    this.currentUserName = this.dataEntryForm.get('userName')?.value;
    let textMessage = this.dataEntryForm.get('message')?.value;

    // const customMessage = new CustomMessage(textMessage, null);    
    const message = new Message(this.currentUserName, textMessage, true);

    // this.sentMessages.push(message);
    this.webSocket$.next(message);

    console.log(`Message send ${textMessage}.`);
  }

  onConnect(event: Event) {
    this.webSocketConnect();
  }
}
