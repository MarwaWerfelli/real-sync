export interface SharedValue {
  id: string;
  value: number;
  createdBy: string;
  createdByEmail: string;
  timestamp: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}
