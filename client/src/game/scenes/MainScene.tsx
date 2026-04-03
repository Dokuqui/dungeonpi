import Phaser from 'phaser';
import { apiClient } from '../../lib/apiClient';
import { useWorldStore } from '../../store/useWorldStore';

export class MainScene extends Phaser.Scene {
    private player: Phaser.GameObjects.Sprite | null = null;
    private roomGroup: Phaser.GameObjects.Group | null = null;
    private isMoving = false;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

    private readonly TILE_SCALE = 2.5;
    private readonly ROOM_SIZE = 10;
    private readonly TILE_PIXELS = 16 * 2.5;

    private gridX = 4;
    private gridY = 4;

    constructor() { super('MainScene'); }

    preload() {
        this.load.atlas(
            'dungeon',
            '/assets/dungeon_atlas.png',
            '/assets/dungeon_atlas.json'
        );

        this.load.spritesheet('floor', '/assets/atlas_floor-16x16.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.cameras.main.setBackgroundColor('#050505');
        this.cameras.main.roundPixels = true;

        this.drawRoom();

        this.player = this.add.sprite(this.getPixelX(this.gridX), this.getPixelY(this.gridY), 'dungeon', 'knight_m_idle_anim_f0.png')
            .setScale(this.TILE_SCALE)
            .setDepth(10);

        if (!this.anims.exists('hero_idle')) {
            this.anims.create({
                key: 'hero_idle',
                frames: this.anims.generateFrameNames('dungeon', {
                    prefix: 'knight_m_idle_anim_f',
                    suffix: '.png',
                    start: 0,
                    end: 3
                }),
                frameRate: 6,
                repeat: -1
            });
        }
        this.player.play('hero_idle');

        this.scale.on('resize', () => {
            this.drawRoom();
            if (this.player && !this.isMoving) {
                this.player.setPosition(this.getPixelX(this.gridX), this.getPixelY(this.gridY));
            }
        });

        this.refreshWorld();
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            
            this.input.keyboard.disableGlobalCapture(); 
        }
    }

    private getPixelX(gridX: number) {
        const startX = (this.scale.width / 2) - ((this.ROOM_SIZE * this.TILE_PIXELS) / 2);
        return startX + (gridX * this.TILE_PIXELS) + (this.TILE_PIXELS / 2);
    }

    private getPixelY(gridY: number) {
        const startY = (this.scale.height / 2) - ((this.ROOM_SIZE * this.TILE_PIXELS) / 2);
        return startY + (gridY * this.TILE_PIXELS) + (this.TILE_PIXELS / 2);
    }

    private drawRoom() {
        if (this.roomGroup) this.roomGroup.clear(true, true);
        this.roomGroup = this.add.group();

        const { width, height } = this.scale;
        const s16 = 16 * this.TILE_SCALE;

        const startX = (width / 2) - ((this.ROOM_SIZE * s16) / 2);
        const startY = (height / 2) - ((this.ROOM_SIZE * s16) / 2);

        for (let row = 0; row < this.ROOM_SIZE; row++) {
            for (let col = 0; col < this.ROOM_SIZE; col++) {
                this.roomGroup.add(this.add.image(startX + col * s16, startY + row * s16, 'floor', 2)
                    .setOrigin(0, 0).setScale(this.TILE_SCALE).setDepth(0));
            }
        }

        for (let row = 0; row < this.ROOM_SIZE; row++) {
            for (let col = 0; col < this.ROOM_SIZE; col++) {
                const x = startX + col * s16;
                const y = startY + row * s16;

                const isTop = row === 0;
                const isBottom = row === this.ROOM_SIZE - 1;
                const isLeft = col === 0;
                const isRight = col === this.ROOM_SIZE - 1;

                if (isTop) {
                    let key = 'wall_mid.png';
                    if (isLeft) key = 'wall_outer_top_left.png';
                    if (isRight) key = 'wall_outer_top_right.png';

                    this.roomGroup.add(this.add.image(x, y, 'dungeon', key).setOrigin(0, 0).setScale(this.TILE_SCALE).setDepth(5));
                }
                else if (isBottom) {
                    let key = 'wall_mid.png';
                    if (isLeft) key = 'wall_edge_bottom_left.png';
                    if (isRight) key = 'wall_edge_bottom_right.png';

                    this.roomGroup.add(this.add.image(x, y, 'dungeon', key).setOrigin(0, 0).setScale(this.TILE_SCALE).setDepth(15));
                }
                else if (isLeft) {
                    this.roomGroup.add(this.add.image(x, y, 'dungeon', 'wall_edge_left.png').setOrigin(0, 0).setScale(this.TILE_SCALE).setDepth(15));
                }
                else if (isRight) {
                    this.roomGroup.add(this.add.image(x + s16, y, 'dungeon', 'wall_edge_left.png')
                        .setOrigin(1, 0)
                        .setFlipX(true)
                        .setScale(this.TILE_SCALE)
                        .setDepth(15));
                }
            }
        }
    }

    async move(direction: string) {
        if (this.isMoving || !this.player) return;
        this.isMoving = true;

        let targetGridX = this.gridX;
        let targetGridY = this.gridY;

        if (direction === 'NORTH') targetGridY -= 1;
        if (direction === 'SOUTH') targetGridY += 1;
        if (direction === 'EAST') { targetGridX += 1; this.player.setFlipX(false); }
        if (direction === 'WEST') { targetGridX -= 1; this.player.setFlipX(true); }

        const hitWall = targetGridX <= 0 || targetGridX >= this.ROOM_SIZE - 1 || targetGridY <= 0 || targetGridY >= this.ROOM_SIZE - 1;

        if (hitWall) {
            this.cameras.main.fadeOut(200, 0, 0, 0);
            try {
                await apiClient('/characters/move', { method: 'POST', body: JSON.stringify({ direction }) });
                await this.refreshWorld();

                this.cameras.main.once('camerafadeoutcomplete', () => {
                    if (direction === 'NORTH') this.gridY = this.ROOM_SIZE - 2;
                    if (direction === 'SOUTH') this.gridY = 1;
                    if (direction === 'EAST') this.gridX = 1;
                    if (direction === 'WEST') this.gridX = this.ROOM_SIZE - 2;

                    this.player!.setPosition(this.getPixelX(this.gridX), this.getPixelY(this.gridY));
                    this.cameras.main.fadeIn(200, 0, 0, 0);
                    this.isMoving = false;
                });
            } catch {
                this.cameras.main.fadeIn(100, 0, 0, 0);
                this.bounceInPlace();
            }
        } else {
            this.gridX = targetGridX;
            this.gridY = targetGridY;
            this.tweens.add({
                targets: this.player,
                x: this.getPixelX(this.gridX),
                y: this.getPixelY(this.gridY),
                duration: 200, ease: 'Linear',
                onComplete: () => { this.isMoving = false; }
            });
        }
    }

    private bounceInPlace() {
        this.tweens.add({
            targets: this.player, y: this.player!.y - 10,
            duration: 100, yoyo: true, ease: 'Quad.easeOut',
            onComplete: () => { this.isMoving = false; }
        });
    }

    update() {
        if (this.isMoving || !this.cursors) return;
        if (this.cursors.up.isDown) this.move('NORTH');
        else if (this.cursors.down.isDown) this.move('SOUTH');
        else if (this.cursors.left.isDown) this.move('WEST');
        else if (this.cursors.right.isDown) this.move('EAST');
    }

    async refreshWorld() {
        try {
            const data = await apiClient('/world/look');
            useWorldStore.getState().setRoom(data);
        } catch { console.error("The void hides the room."); }
    }
}
