import { useCallback, useEffect, useRef, useState } from "react";
import { processLine } from "../helpers/file";
import {
  CMD,
  CTRL,
  Message,
  decodeDevice,
  decodeMessage,
  sendCmd,
} from "../helpers/serial";

const ERR_NO_DEVICE_SELECTED =
  "Failed to execute 'requestPort' on 'Serial': No port selected by the user.";

const ERR_DEVICE_DISCONECTED = "The device has been lost.";

export enum Status {
  waitingToConnect,
  failedToConnect,
  waitingFirmwareFile,
  waitingStartFlashing,
  erasing,
  flashing,
  done,
}

const useRetrotink = () => {
  const [device, setDevice] = useState("");
  // This state variable is used to render the currently processed line on the screen
  const [currentLine, setCurrentLine] = useState(0);
  const [status, setStatus] = useState(Status.waitingToConnect);

  const currentLineRef = useRef(0);
  const portRef = useRef<SerialPort>();
  const linesRef = useRef<string[]>([]);
  const incomingMsgRef = useRef<Uint8Array>(new Uint8Array([]));

  useEffect(() => {
    if (!portRef.current || status !== Status.waitingFirmwareFile) {
      return;
    }

    sendCmd(portRef.current, new Uint8Array([CMD.GetVer]));
  }, [status]);

  const setLines = useCallback((lines: string[]) => {
    linesRef.current = lines;
    setStatus(
      lines.length > 0
        ? Status.waitingStartFlashing
        : Status.waitingFirmwareFile
    );
  }, []);

  // This function handles how to behave when a message sent by the Retrotink is received
  const handleCmd = useCallback(async ({ cmd, payload }: Message) => {
    const port = portRef.current;
    if (!port) {
      throw Error("No port available to write");
    }

    if (cmd === CMD.GetVer) {
      setDevice(decodeDevice(payload));
      return;
    }

    // When Retrotink aknowledges the succesful erase
    // send the first line of the firmware
    if (cmd === CMD.Erase) {
      setStatus(Status.flashing);
      processLine(linesRef.current[currentLineRef.current]).then((tx) =>
        sendCmd(port, tx)
      );

      return;
    }

    // On each write aknowledgement send the next line
    // of the firmware to be written
    if (cmd === CMD.Write) {
      currentLineRef.current += 1;

      // If there are no more lines of firmware to write
      // restart the Retrotink
      if (currentLineRef.current >= linesRef.current.length) {
        setStatus(Status.done);
        sendCmd(port, new Uint8Array([CMD.JumpApp]));

        return;
      }

      setCurrentLine(currentLineRef.current);

      processLine(linesRef.current[currentLineRef.current]).then((tx) =>
        sendCmd(port, tx)
      );

      return;
    }

    console.error("Unhandled command", cmd, payload);
  }, []);

  const connect = useCallback(async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({
        baudRate: 115200,
        flowControl: "hardware",
      });
      portRef.current = port;
      setStatus(Status.waitingFirmwareFile);

      const reader = port.readable.getReader();
      let done, value;
      do {
        // Wait for the Retrotink to send a message
        ({ value, done } = await reader.read());
        if (done) {
          continue;
        }

        const incomingMsg = new Uint8Array([
          ...incomingMsgRef.current,
          ...value,
        ]);

        // Sometimes the Retrotink splits a message in multiple requests. This logic
        // appends the incoming bytes until a END_OF_TRANSMISION is received
        // to ensure that the whole message is processed
        if (incomingMsg[incomingMsg.length - 1] === CTRL.END_OF_TRANSMISION) {
          incomingMsgRef.current = new Uint8Array([]);
          handleCmd(decodeMessage(incomingMsg));
        } else {
          incomingMsgRef.current = incomingMsg;
        }
      } while (!done);

      reader.releaseLock();
    } catch (e) {
      if (
        e instanceof DOMException &&
        [ERR_DEVICE_DISCONECTED, ERR_NO_DEVICE_SELECTED].includes(e.message)
      ) {
        // If the user closed the prompt window without selecting any device
        // do not show an error
        setStatus(Status.waitingToConnect);
        return;
      }

      console.error(e);
      setStatus(Status.failedToConnect);
    }
  }, [handleCmd]);

  // Starts the firmware update by erasing the data in the device
  const updateFirmware = useCallback(async () => {
    const port = portRef.current;
    if (!port) {
      return;
    }

    setStatus(Status.erasing);
    await sendCmd(port, new Uint8Array([CMD.Erase]));
  }, []);

  return {
    device,
    status,
    currentLine,
    lines: linesRef.current,
    connect,
    setLines,
    updateFirmware,
  };
};

export default useRetrotink;
