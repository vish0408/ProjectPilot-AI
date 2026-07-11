import { Role } from "./Role";

export interface CurrentUser {
  name: string;
  email: string;
  role: Role;
  dept: string;
  institution: string;
  avatar: string;
  enrollment?: string;
  designation?: string;
}
