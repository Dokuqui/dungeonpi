import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/scenes/MainScene';

export default function Dungeon() {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstance = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainerRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: gameContainerRef.current,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            backgroundColor: '#050505',
            pixelArt: true,
            physics: { default: 'arcade' },
            scene: [MainScene],
        };

        gameInstance.current = new Phaser.Game(config);

        return () => {
            gameInstance.current?.destroy(true);
        };
    }, []);

    return (
        <div
            ref={gameContainerRef}
            className="phaser-container"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        />
    );
}