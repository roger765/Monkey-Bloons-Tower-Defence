import Phaser from 'phaser'

export function showCashPopup(scene: Phaser.Scene, x: number, y: number, amount: number): void {
  const label = scene.add.text(x, y - 20, `+$${amount}`, {
    fontSize: '13px',
    color: '#ffee44',
    stroke: '#000000',
    strokeThickness: 3,
    fontStyle: 'bold',
  })
  label.setOrigin(0.5, 1)
  label.setDepth(200)

  scene.tweens.add({
    targets: label,
    y: y - 60,
    alpha: 0,
    duration: 1200,
    ease: 'Power1',
    onComplete: () => label.destroy(),
  })
}
