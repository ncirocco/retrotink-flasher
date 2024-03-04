import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>
        Kudos to{" "}
        <a
          href="https://www.retrotink.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          RetroTINK
        </a>{" "}
        for their outstanding upscaler devices and to{" "}
        <a
          href="https://github.com/rmull/tinkup"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tinkup
        </a>{" "}
        for the reference code used in this tool
      </div>
      <div>
        Check the code on{" "}
        <a
          href="https://github.com/ncirocco/retrotink-flasher"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
