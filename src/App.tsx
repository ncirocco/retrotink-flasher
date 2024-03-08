import styles from "./App.module.scss";

import Connect from "./components/Connect";
import FailedToConnect from "./components/FailedToConnect";
import Footer from "./components/Footer";
import LoadFirmwareFile from "./components/LoadFirmwareFile";
import NotBootloader from "./components/NotBootloader";
import useRetrotink, { Status } from "./hooks/useRetrotink";

const App = () => {
  const {
    device,
    status,
    lines,
    currentLine,
    connect,
    setLines,
    updateFirmware,
  } = useRetrotink();

  return (
    <>
      <main>
        <div className={styles.app}>
          <h1>RetroTINK Firmware Flasher</h1>

          {status === Status.waitingToConnect && (
            <Connect onConnect={connect} />
          )}
          {status === Status.failedToConnect && <FailedToConnect />}
          {status === Status.waitingFirmwareFile && !device && (
            <NotBootloader />
          )}
          {status !== Status.waitingToConnect && device && (
            <>
              <p>Detected: {device}</p>
              {status !== Status.erasing && status !== Status.flashing && (
                <>
                  <LoadFirmwareFile device={device} onLoadedFile={setLines} />
                  <div>
                    <button
                      onClick={updateFirmware}
                      disabled={status !== Status.waitingStartFlashing}
                    >
                      Update Firmware
                    </button>
                  </div>
                </>
              )}
              <div>
                {status === Status.erasing && (
                  <p>Erasing the previous firmware</p>
                )}
                {status === Status.flashing && (
                  <p>
                    Writing the new firmware {currentLine}/{lines.length}
                  </p>
                )}
                {status === Status.done && (
                  <p>
                    Firmware successfully updated. You can unplug your device
                    now.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default App;
