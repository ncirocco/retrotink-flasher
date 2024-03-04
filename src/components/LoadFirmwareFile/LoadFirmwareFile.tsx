import { useCallback } from "react";
import styles from "./LoadFirmwareFile.module.scss";

interface Props {
  onLoadedFile: (lines: string[]) => void;
}

const LoadFirmwareFile = ({ onLoadedFile }: Props) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null;
      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result;
        onLoadedFile(
          text
            ?.toString()
            .split("\n")
            .filter((line) => line.trim() !== "") ?? []
        );
      };

      reader.readAsText(file);
    },
    [onLoadedFile]
  );

  return (
    <div className={styles.loadFirmwareFile}>
      <p>
        Select the{" "}
        <a
          href="https://retrotink-llc.github.io/firmware/"
          target="_blank"
          rel="noopener noreferrer"
        >
          firmware
        </a>{" "}
        file to be flashed:
      </p>
      <input type="file" onChange={handleFileChange} accept=".hex" />
    </div>
  );
};

export default LoadFirmwareFile;
