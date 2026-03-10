import { Role } from '../../domain/role.enum';

export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface ITokenService {
  generateToken(userId: number, role: Role): Promise<string>;
  verifyToken(token: string): Promise<any>;
}
