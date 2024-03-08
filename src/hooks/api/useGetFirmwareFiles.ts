import axios from "axios";
import JSZip from "jszip";
import { useCallback } from "react";
import { Firmware } from "../../entity/Firmware";
import getFirmwareFiles from "../../services/getFirmwareFiles";

const ZIP_MIME = "application/zip";

export enum Device {
  rt5x = "rt5x",
}

const useGetFirmwareFiles = () => {
  const readAsTextAsync = (
    data: Blob
  ): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(e.target?.result ?? "");
      };

      reader.onerror = (_: ProgressEvent<FileReader>) => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(data);
    });
  };

  async function unzipFile(file: Blob): Promise<string> {
    const jsZip = new JSZip();
    const zipContents = await jsZip.loadAsync(file);

    const fileNames = Object.keys(zipContents.files);

    for (const fileName of fileNames) {
      const zipEntry = zipContents.files[fileName];

      if (!zipEntry.dir) {
        return await zipEntry.async("text");
      }
    }

    return "";
  }

  const getFiles = useCallback(async (device: Device): Promise<Firmware[]> => {
    const { data } = await getFirmwareFiles();

    if (!data[device]) {
      throw Error(`No firmware defined for device ${device}`);
    }

    return data[device];
  }, []);

  const loadFirmwareFile = useCallback(
    async (url: string): Promise<string[]> => {
      const { data } = await axios.get(url, { responseType: "blob" });

      const text =
        data.type === ZIP_MIME
          ? await unzipFile(data)
          : await readAsTextAsync(data);

      return (
        text
          ?.toString()
          .replace(/\r/g, "")
          .split("\n")
          .filter((line) => line.trim() !== "") ?? []
      );
    },
    []
  );

  return {
    getFiles,
    loadFirmwareFile,
  };
};

export default useGetFirmwareFiles;
