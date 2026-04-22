export const DEVICE_SESSION_REPOSITORY = 'DEVICE_SESSION_REPOSITORY';

export interface DeviceSessionData {
  familyId: string;
  userId: number;
  refreshTokenHash: string;
  fingerprint: string;
  isRevoked: boolean;
  expiresAt: Date;
}

export interface IDeviceSessionRepository {
  create(data: DeviceSessionData): Promise<void>;

  findByRefreshTokenHash(hash: string): Promise<DeviceSessionData | null>;

  revokeFamily(familyId: string): Promise<void>;

  updateHash(familyId: string, newHash: string): Promise<void>;
}
