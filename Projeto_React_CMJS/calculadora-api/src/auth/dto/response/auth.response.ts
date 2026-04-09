export class AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
