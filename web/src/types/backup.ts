import type { IUser } from "./user";

export type IBackup = Record<string, string | null>;

export interface IBackupResponse {
  backup: IBackup;
  user: IUser;
}