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
        the official RetroTINK team. This software is still on beta. Use at your
        own risk. <span>⚠️</span>
      </p>
      <p>
        Notice: Firmware updates erase saved profiles and reset the device to
        default settings.
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
