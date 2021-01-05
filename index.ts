import { Observable, Observer } from "rxjs";
interface Client {
  sendMessage: (message: string) => void;
  onMessage: (callback: (message: string, clientName: string) => void) => void;
}
type RecordMap = { [recordName: string]: Client };
class RecordTracker {
  constructor(private recordMap: RecordMap) {}
  public initialize(): void {
    Object.keys(this.recordMap).forEach(this.sendMessageToClient.bind(this));
  }
  private sendMessageToClient(client: string): void {
    const recordMap = this.recordMap;
    const waitTimeInMs = 10000;
    const getReply = this.getReply.bind(this);
    setTimeout(() => {
      this.sendMessage(this.recordMap[client], client).subscribe({
        next(response: string) {
          if (response === "message sent") {
            getReply(recordMap[client], client);
          }
        }
      });
    }, waitTimeInMs);
  }
  public sendMessage(client: Client, index: string) {
    const observable = new Observable((observer: Observer<string>) => {
      console.log("Message sent to " + index);
      try {
        client.sendMessage("ping");
        observer.next("message sent");
      } catch (e) {}
    });
    return observable;
  }
  public getReply(client: Client, index: string) {
    const recordMap = this.recordMap;
    const waitTimeInMs = 3000;
    setTimeout(() => {
      client.onMessage((message: string, client: string) => {
        console.log("Reply from " + index + " = " + message);
        if (message !== "pong") {
          console.log("Removing " + index);
          delete recordMap[index];
        }
      });
    }, waitTimeInMs);
  }
}
//Assuming, system will send null if the user doesn't responds in 3 seconds
let clients: RecordMap = {
  Client1: {
    sendMessage(message: string) {},
    onMessage(messageHandler: Function) {
      messageHandler("pong", "Client1");
    }
  },
  Client2: {
    sendMessage(message: string) {},
    onMessage(messageHandler: Function) {
      messageHandler(null, "Client2");
    }
  },
  Client3: {
    sendMessage(message: string) {},
    onMessage(messageHandler: Function) {
      messageHandler("hey", "Client3");
    }
  }
};
new RecordTracker(clients).initialize();
