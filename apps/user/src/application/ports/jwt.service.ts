export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface JwtService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}