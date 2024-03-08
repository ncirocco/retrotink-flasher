import { useCallback, useEffect, useState } from "react";
import { Firmware } from "../../entity/Firmware";
import useGetFirmwareFiles, {
  Device,
} from "../../hooks/api/useGetFirmwareFiles";
import styles from "./LoadFirmwareFile.module.scss";

interface Props {
  device: string;
  onLoadedFile: (lines: string[]) => void;
}

const deviceMap: { [key: string]: Device } = {
  "RT5X Bootloader": Device.rt5x,
};

const LoadFirmwareFile = ({ device, onLoadedFile }: Props) => {
  const deviceCode = deviceMap[device] ? deviceMap[device] : undefined;
  const { getFiles, loadFirmwareFile } = useGetFirmwareFiles();
  const [isLocalFile, setIsLocalFile] = useState(!deviceCode);
  const [showExperimental, setShowExperimental] = useState(false);
  const [isDownloadingFirmware, setIsDownloadingFirmware] = useState(false);
  const [firmware, setFirmware] = useState<Firmware[]>([]);

  useEffect(() => {
    getFiles(Device.rt5x).then(setFirmware);
  }, [getFiles]);

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

  const handleFirmwareChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!event.target.value) {
      return;
    }

    setIsDownloadingFirmware(true);
    onLoadedFile([]);

    loadFirmwareFile(event.target.value).then((text) => {
      onLoadedFile(text);
      setIsDownloadingFirmware(false);
    });
  };

  return (
    <div className={styles.loadFirmwareFile}>
      {isLocalFile ? (
        <>
          <p>
            Select the{" "}
            <a
              href="https://retrotink-llc.github.io/firmware/"
              target="_blank"
              rel="noopener noreferrer"
            >
              firmware
            </a>{" "}
            file to be flashed
            {deviceCode && (
              <>
                {" "}
                or select from the{" "}
                <button onClick={() => setIsLocalFile(false)}>
                  firmware list
                </button>
              </>
            )}
          </p>
          <input type="file" onChange={handleFileChange} accept=".hex" />
        </>
      ) : (
        <div>
          <p>
            Select the{" "}
            <a
              href="https://retrotink-llc.github.io/firmware/"
              target="_blank"
              rel="noopener noreferrer"
            >
              firmware version
            </a>{" "}
            to be flashed or use a{" "}
            <button onClick={() => setIsLocalFile(true)}>local file</button>
          </p>
          <select onChange={handleFirmwareChange}>
            <option value={""} key={"default"}>
              Select Firmware Version
            </option>
            {firmware
              .filter(({ experimental }) => experimental === showExperimental)
              .map(({ name, url }) => (
                <option value={url} key={url}>
                  {name}
                </option>
              ))}
          </select>
          <div>
            Stable{" "}
            <input
              type="radio"
              name="version"
              value="stable"
              checked={!showExperimental}
              onClick={() => setShowExperimental(false)}
              readOnly
            />
            - Experimental
            <input
              type="radio"
              name="version"
              value="experimental"
              checked={showExperimental}
              onClick={() => setShowExperimental(true)}
              readOnly
            />
          </div>
          {isDownloadingFirmware && (
            <p>Downloading Firmware File. Please Wait.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadFirmwareFile;
