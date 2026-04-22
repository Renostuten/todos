export interface CurrentUser {
  userId: string;
  email: string;
  userName: string;
}

export interface SignupErrorResponse {
  error?: string;
  details?: string[] | string;
}
