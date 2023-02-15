# Chat Component
This component adds chat capabilities to the taro app you are creating.
# Setup
## Server
In your server.js file, ensure that you have added the chat component to the main engine instance with a call to:
	taro.addComponent(TaroChatComponent);

## Client
Make sure that the files the chat component relies on have been added to your client's file list. The files are:

./taro/engine/components/chat/TaroChatClient.js
./taro/engine/components/chat/TaroChatComponent.js

After starting the network component, add the chat component to the main engine instance with a call to:
	taro.addComponent(TaroChatComponent);