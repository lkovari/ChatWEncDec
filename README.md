# ChatWEncDec

Chat prototype with AES 256 CFB encryption / decryption and HMAC-SHA1 integrity check of the messages.
Usage:

Prerequisities:
Run the server
- npm install
- npm run start
Run the client
- npm install
- ng serve

Start two client (localhost:4200) for example Client A, and Client B
Set the name (updateOn: blur was used) of both client
At Client A, Copy the Decrypt key from the console and paste it into the "Decrypt key:" input field of Client B
At Client B, Copy the Decrypt key from the console and paste it into the "Decrypt key:" input field of Client A

This example not prepared to use multiple participants!
Just implemented to show AES encryption and decription with HMAC-SHA1 integrity check.

