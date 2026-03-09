export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface ITokenService {
  generateToken(userId: number): Promise<string>;
  verifyToken(token: string): Promise<any>;
}
