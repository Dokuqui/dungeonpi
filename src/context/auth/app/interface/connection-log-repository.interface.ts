export const CONNECTION_LOG_REPOSITORY = 'CONNECTION_LOG_REPOSITORY';

export interface IConnectionLogRepository {
  create(data: {
    userId: number | null;
    ipAddress: string;
    userAgent: string;
    status: 'SUCCESS' | 'FAIL' | 'SUSPICIOUS';
  }): Promise<void>;
}
