import BrowserNotSupported from "../BrowserNotSupported";
import styles from "./Connect.module.scss";

interface Props {
  onConnect: () => void;
}

const Connect = ({ onConnect }: Props) => {
  const isBrowserCompatible = "serial" in navigator;

  return (
    <div className={styles.connect}>
      <p>
        <span>⚠️</span> This is a third party utility that is not maintained by
        the official RetroTINK team. Use at your own risk. <span>⚠️</span>
      </p>
      <p>
        To enter flashing mode, press and hold the Menu button while connecting
        the RetroTink to your PC.
        <br />
        After 2-3 seconds, release the button. The indicator light should turn
        red, signaling that the device is in flashing mode.
      </p>
      <p>
        Notice: Applying firmware updates erases saved profiles and resets the
        device to its default settings.
      </p>
      {isBrowserCompatible ? (
        <button onClick={onConnect}>Connect RetroTink</button>
      ) : (
        <BrowserNotSupported />
      )}
    </div>
  );
};

export default Connect;
