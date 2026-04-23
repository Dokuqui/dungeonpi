import { Room } from '../../domain/room.class';

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';

export interface IRoomRepository {
  save(room: Room): Promise<void>;
  findByCoordinates(x: number, y: number): Promise<Room | null>;
}
