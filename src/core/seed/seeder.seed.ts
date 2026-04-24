import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';

import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../context/world/app/interface/room-repository.interface';
import {
  SPAWNER_REPOSITORY,
  type ISpawnerRepository,
} from '../../context/monsters/app/interface/spawner-repository.interface';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../context/auth/app/interface/user-repository.interface';
import {
  CHARACTER_REPOSITORY,
  type ICharacterRepository,
} from '../../context/characters/app/interface/character-repository.interface';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '../../context/auth/app/interface/password-hasher.interface';

import { Room } from '../../context/world/domain/room.class';
import { Spawner } from '../../context/monsters/domain/spawner.class';
import { AuthUser } from '../../context/auth/domain/class/auth-user.class';
import { Email } from '../../context/auth/domain/class/email.class';
import { Password } from '../../context/auth/domain/class/password.class';
import { Character } from '../../context/characters/domain/class/character.class';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  constructor(
    @Inject(ROOM_REPOSITORY) private readonly roomRepo: IRoomRepository,
    @Inject(SPAWNER_REPOSITORY)
    private readonly spawnerRepo: ISpawnerRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepo: ICharacterRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async onApplicationBootstrap() {
    console.log('[Seeder] Checking database state for foundational data...');

    // ==========================================
    // 1. SEED THE ADMIN ACCOUNT
    // ==========================================
    const adminEmail = 'admin@dungeon.com';
    let admin = await this.userRepo.findByEmail(adminEmail);

    if (!admin) {
      console.log('[Seeder] Forging the Master Admin...');
      const hashedPass = await this.passwordHasher.hash('admin123');

      const newAdmin = AuthUser.create(
        Email.create(adminEmail),
        Password.createFromHash(hashedPass),
      );
      newAdmin.makeAdmin();
      await this.userRepo.save(newAdmin);

      admin = await this.userRepo.findByEmail(adminEmail);

      if (admin && admin.id) {
        console.log('[Seeder] Forging the Admin Character...');
        const adminChar = Character.create(admin.id, 'DungeonMaster');
        await this.characterRepo.save(adminChar);
      }
    }

    // ==========================================
    // 2. SEED A TEST PLAYER ACCOUNT
    // ==========================================
    const playerEmail = 'player@dungeon.com';
    let player = await this.userRepo.findByEmail(playerEmail);

    if (!player) {
      console.log('[Seeder] Forging the Test Player...');
      const hashedPass = await this.passwordHasher.hash('player123');

      const newPlayer = AuthUser.create(
        Email.create(playerEmail),
        Password.createFromHash(hashedPass),
      );
      await this.userRepo.save(newPlayer);

      player = await this.userRepo.findByEmail(playerEmail);

      if (player && player.id) {
        const playerChar = Character.create(player.id, 'BraveKnight');
        await this.characterRepo.save(playerChar);
      }
    }

    // ==========================================
    // 3. SEED THE WORLD & MONSTERS
    // ==========================================
    const startRoom = await this.roomRepo.findByCoordinates(0, 0);

    if (!startRoom) {
      console.log('[Seeder] Forging the initial world map...');

      const tavern = Room.create(
        0,
        0,
        'The Prancing Pony Tavern',
        'A warm, safe tavern.',
      );
      await this.roomRepo.save(tavern);

      const entrance = Room.create(
        0,
        1,
        'Dark Forest',
        'The trees block out the sun.',
      );
      await this.roomRepo.save(entrance);

      const goblinSpawner = Spawner.create(0, 1, 'Goblin Scout', 30, 5);
      await this.spawnerRepo.save(goblinSpawner);

      console.log(
        '[Seeder] ✅ World successfully seeded! Tavern and Monsters created.',
      );
    } else {
      console.log('[Seeder] Database already populated. Startup complete.');
    }
  }
}
