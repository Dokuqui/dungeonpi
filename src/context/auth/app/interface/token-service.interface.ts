import { Role } from '../../domain/enum/role.enum';

export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ExpectedJwtPayload {
  sub: number;
  role: Role;
  typ: 'access' | 'refresh';
  iat: number;
  exp: number;
  v: number;
  fgp: string;
}

export interface ITokenService {
  generateTokenPair(
    userId: number,
    role: Role,
    tokenVersion: number,
    fingerprint: string,
  ): Promise<TokenPair>;

  verifyToken(
    token: string,
    currentFingerprint: string,
  ): Promise<ExpectedJwtPayload>;
}
