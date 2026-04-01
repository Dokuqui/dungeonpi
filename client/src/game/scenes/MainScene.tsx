import Phaser from 'phaser';
import { apiClient } from '../../lib/apiClient';
import { useWorldStore } from '../../store/useWorldStore';

export class MainScene extends Phaser.Scene {
    private player: Phaser.GameObjects.Rectangle | null = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private isMoving = false;

    constructor() {
        super('MainScene');
    }

    preload() {
        // next step
    }

    create() {
        const { width, height } = this.scale;

        this.player = this.add.rectangle(width / 2, height / 2, 32, 32, 0x8a0303);

        this.refreshWorld();

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        this.add.text(20, 20, "Dungeon Level 1", {
            fontFamily: 'MedievalSharp',
            fontSize: '24px',
            color: '#d4c4a1'
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
        } catch {
            console.error("The void hides the room details.");
        }
    }

    async move(direction: string) {
        this.isMoving = true;
        try {
            await apiClient('/characters/move', {
                method: 'POST',
                body: JSON.stringify({ direction }),
            });

            await this.refreshWorld();

            this.tweens.add({
                targets: this.player,
                scale: 1.2,
                duration: 100,
                yoyo: true,
                onComplete: () => { this.isMoving = false; }
            });
        } catch {
            this.isMoving = false;
        }
    }
}