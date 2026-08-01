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
  isFirstLogin?: boolean;
  phoneNumber?: string | null;
  employeeId?: string | null;
  collegeId?: string | null;
  collegeName?: string | null;
}
