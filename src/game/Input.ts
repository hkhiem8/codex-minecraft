export class Input {
  private keys = new Set<string>();
  private justPressed = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  consumePress(code: string): boolean {
    const has = this.justPressed.has(code);
    this.justPressed.delete(code);
    return has;
  }

  endFrame(): void {
    this.justPressed.clear();
  }
}
