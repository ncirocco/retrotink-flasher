import styles from "./BrowserNotSupported.module.scss";

import chrome from "./../../assets/chrome.png";
import edge from "./../../assets/edge.png";
import opera from "./../../assets/opera.png";

const BrowserNotSupported = () => (
  <div className={styles.browserNotSupported}>
    <p>
      <h2>
        <span>⛔</span> This browser is not compatible since it doesn't support
        the{" "}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"
          target="_blank"
          rel="noopener noreferrer"
        >
          Serial API
        </a>{" "}
        <span>⛔</span>
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
);

export default BrowserNotSupported;
