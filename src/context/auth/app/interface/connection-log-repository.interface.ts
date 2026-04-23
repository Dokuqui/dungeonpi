export const CONNECTION_LOG_REPOSITORY = 'CONNECTION_LOG_REPOSITORY';

export interface ConnectionLogData {
  userId: number | null;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAIL' | 'SUSPICIOUS';
}

export interface IConnectionLogRepository {
  create(data: ConnectionLogData): Promise<void>;
}
