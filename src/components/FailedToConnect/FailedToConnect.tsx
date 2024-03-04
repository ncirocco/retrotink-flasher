import styles from "./FailedToConnect.module.scss";

const FailedToConnect = () => {
  return (
    <div className={styles.failedToConnect}>
      <p>
        <span>🚨</span>
        Could not open a connection with the device
        <span>🚨</span>
      </p>
      <p>
        If you are on Linux, try running the following command on console and
        then try again.
      </p>
      <p>sudo setfacl -m u:$(whoami):rw /dev/ttyUSB0</p>
    </div>
  );
};

export default FailedToConnect;
