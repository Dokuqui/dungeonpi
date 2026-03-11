import { Role } from './role.enum';
import { Permission } from './permission.enum';

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.PLAYER]: [Permission.PLAY_GAME, Permission.SEND_MESSAGE],

  [Role.ADMIN]: [
    Permission.PLAY_GAME,
    Permission.SEND_MESSAGE,
    Permission.KICK_PLAYER,
    Permission.MUTE_PLAYER,
    Permission.CREATE_ROOM,
    Permission.SPAWN_MONSTER,
  ],

  [Role.GAME_MASTER]: [
    Permission.PLAY_GAME,
    Permission.SEND_MESSAGE,
    Permission.SPAWN_MONSTER,
  ],
};
