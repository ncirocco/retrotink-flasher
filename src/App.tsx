import { useCallback, useEffect, useState } from "react";
import styles from "./App.module.scss";
import { processLine } from "./helpers/file";
import {
  CMD,
  Message,
  decodeDevice,
  decodeMessage,
  sendCmd,
} from "./helpers/serial";

import chrome from "./assets/chrome.png";
import edge from "./assets/edge.png";
import opera from "./assets/opera.png";

function App() {
  const [isBrowserCompatible, setIsBrowserCompatible] = useState(true);
  const [port, setPort] = useState<SerialPort>();
  const [device, setDevice] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setIsBrowserCompatible("serial" in navigator);
  }, []);

  useEffect(() => {
    if (!port || device) {
      return;
    }

    sendCmd(port, new Uint8Array([CMD.GetVer]));
  }, [port, device]);

  useEffect(() => {
    if (!isProcessing || !port) {
      return;
    }

    if (currentLine === lines.length) {
      setIsProcessing(false);
      setIsDone(true);
      sendCmd(port, new Uint8Array([CMD.JumpApp]));

      return;
    }

    processLine(lines[currentLine]).then((tx) => sendCmd(port, tx));
  }, [currentLine, isProcessing, port, lines]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null;
      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result;
        setLines(text?.toString().split("\n") ?? []);
      };

      reader.readAsText(file);
    },
    []
  );

  const handleConnect = async () => {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    setPort(port);

    // const { usbProductId, usbVendorId } = port.getInfo();
    // console.log(usbProductId, usbVendorId);

    const reader = port.readable.getReader();

    let done, value;

    do {
      ({ value, done } = await reader.read());
      if (done) {
        continue;
      }

      handleCmd(decodeMessage(value));
    } while (!done);

    reader.releaseLock();
  };

  const handleCmd = useCallback(async ({ cmd, payload }: Message) => {
    if (cmd === undefined) {
      // console.error("undefined command");
      return;
    }

    if (cmd === CMD.GetVer) {
      setDevice(decodeDevice(payload));
      return;
    }

    if (cmd === CMD.Erase) {
      setIsErasing(false);
      setIsProcessing(true);
      return;
    }

    if (cmd === CMD.Write) {
      setCurrentLine((prev) => prev + 1);

      return;
    }

    console.error("Unhandled command", cmd, payload);
  }, []);

  const handleUpdateFirmware = useCallback(async () => {
    if (!port) {
      return;
    }
    setIsErasing(true);
    setIsDone(false);
    await sendCmd(port, new Uint8Array([CMD.Erase]));
  }, [port]);

  return (
    <div className={styles.app}>
      <h1>RetroTINK Firmware Flasher</h1>

      {!port && (
        <>
          <p>
            <span>⚠️</span> This is a third party utility that is not maintained
            by the official RetroTINK team. Use at your own risk.{" "}
            <span>⚠️</span>
          </p>
          <p>
            Notice: Firmware updates erase saved profiles and reset the device
            to default settings.
          </p>
          {isBrowserCompatible ? (
            <button onClick={handleConnect}>Connect RetroTink</button>
          ) : (
            <div>
              <p>
                <h2>
                  <span>⛔</span>This browser is not compatible.<span>⛔</span>
                </h2>
                <p>Please use one of the following browsers:</p>
                <li>
                  <ul>
                    <a
                      href="https://www.google.com/chrome/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={chrome} alt="chrome" />
                    </a>
                  </ul>
                  <ul>
                    <a
                      href="https://www.microsoft.com/edge"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={edge} alt="edge" />
                    </a>
                  </ul>
                  <ul>
                    <a
                      href="https://www.opera.com/download"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={opera} alt="opera" />
                    </a>
                  </ul>
                </li>
              </p>
            </div>
          )}
        </>
      )}

      {port && !device && (
        <div>
          Can't access device. Please make sure its in bootloader mode and try
          again.
        </div>
      )}

      {port && device && (
        <>
          <p>Detected: {device}</p>
          <div>
            <p>Select the firmware file to be flashed:</p>
            <input type="file" onChange={handleFileChange} accept=".hex" />
          </div>
          <div>
            <button
              onClick={handleUpdateFirmware}
              disabled={isErasing || isProcessing || lines.length === 0}
            >
              Update Firmware
            </button>

            {isErasing && <p>Erasing the previous firmware.</p>}
            {isProcessing && (
              <p>
                Writing firmware {currentLine}/{lines.length - 1}
              </p>
            )}
            {isDone && <p>Done. You can use your device now!</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
