import axios from "axios";
import { FIRMWARE_URL } from "../constants/Env";

const getFirmwareFiles = () => axios.get(FIRMWARE_URL);

export default getFirmwareFiles;
