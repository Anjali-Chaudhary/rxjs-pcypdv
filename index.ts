import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

interface Client {
  sendMessage: (message: string) => void;

  onMessage: (callback: (message: string, clientName: string) => void) => void;
}

type RecordMap = { [recordName: string]: Client };

class RecordTracker {
  constructor(private recordMap: RecordMap) {}

  public initialize(): void {
    Object.keys(this.recordMap).forEach(i => {
      setTimeout(() => {
        this.sendMsg(this.recordMap[i], i).subscribe({
          next(res) {
            if (res === "sent") {
              this.getReply(this.recordMap[i], i);
            }
          },
          error(error) {
            delete this.recordMap[i];
          }
          // complete() {}
        });
        //   .then(res => {
        //     if (res === "sent") {
        //       this.getReply(this.recordMap[i], i);
        //     }
        //   })
        //   .catch(res => {
        //     delete this.recordMap[i];
        //   });
      }, 10000);
    });
  }

  public sendMsg(client: Client, index: string) {
    const observable = new Observable(observer => {
      console.log("Message sent to " + index);

      try {
        client.sendMessage("ping");

        observer.next("sent");
      } catch (e) {
        console.log("Error while sending message to " + index);

        observer.error("Error while sending message to " + index);
      }
      //observer.complete();
    });
    return observable;
  }
10
  public getReply(client: Client, index: string) {
    setTimeout(() => {
      client.onMessage((message: string, client: string) => {
        console.log("Message received from " + index + " = " + message);

        if (message !== "pong") {
          console.log("Removing the client " + index);

          delete this.recordMap[index];
        }
      });
    }, 3000);
  }

  public getRecordMap(): RecordMap {
    return { ...this.recordMap };
  }
}

//Assuming the system sends null if the user doesn't responds in 3 seconds

let clients: RecordMap = {
  Cl1: {
    sendMessage(message: string) {},

    onMessage(messageHandler: Function) {
      messageHandler("pong", "Cl1");
    }
  },

  Cl2: {
    sendMessage(message: string) {
      //throw "Message bus not found";
    },

    onMessage(messageHandler: Function) {
      messageHandler(null, "Cl2");
    }
  },

  Cl3: {
    sendMessage(message: string) {},

    onMessage(messageHandler: Function) {
      messageHandler(null, "Cl3");
    }
  },

  Cl4: {
    sendMessage(message: string) {},

    onMessage(messageHandler: Function) {
      messageHandler("hello", "Cl4");
    }
  }
};

new RecordTracker(clients).initialize();
