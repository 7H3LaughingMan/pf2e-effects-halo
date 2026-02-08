export class EffectTextureSpritesheet {
    static #spriteSize = 128;
    static #baseTextureSize = 2048;
    static #maxMemberCount = Math.pow(this.#baseTextureSize / this.#spriteSize, 2);

    static get spriteSize() {
        return this.#spriteSize;
    }

    static get baseTextureSize() {
        return this.#baseTextureSize;
    }

    static get maxMemberCount() {
        return this.#maxMemberCount;
    }

    #baseTextures: [PIXI.BaseRenderTexture, number][] = [];
    #textureCache: Map<string, PIXI.RenderTexture> = new Map();

    #createBaseRenderTexture(): PIXI.BaseRenderTexture {
        return new PIXI.BaseRenderTexture({
            width: EffectTextureSpritesheet.baseTextureSize,
            height: EffectTextureSpritesheet.baseTextureSize
        });
    }

    #getNextBaseRenderTexture(): [PIXI.BaseRenderTexture, number] {
        const lastIdx = this.#baseTextures.length - 1;
        const currentTexture = this.#baseTextures[lastIdx];
        if (!currentTexture || currentTexture[1] >= EffectTextureSpritesheet.maxMemberCount) {
            const baseRenderTexture = this.#createBaseRenderTexture();
            this.#baseTextures.push([baseRenderTexture, 1]);
            return [baseRenderTexture, 0];
        }
        this.#baseTextures[lastIdx][1] = currentTexture[1] + 1;
        return currentTexture;
    }

    addToCache(path: string, renderable: PIXI.Container): PIXI.RenderTexture {
        const existingTeture = this.#textureCache.get(path);
        if (existingTeture) {
            return existingTeture;
        }
        const [baseRenderTexture, textureCount] = this.#getNextBaseRenderTexture();

        const spriteSize = EffectTextureSpritesheet.spriteSize;
        const maxCols = EffectTextureSpritesheet.baseTextureSize / spriteSize;
        const col = textureCount % maxCols;
        const row = Math.floor(textureCount / maxCols);
        const frame = new PIXI.Rectangle(col * spriteSize, row * spriteSize, spriteSize, spriteSize);
        const renderTexture = new PIXI.RenderTexture(baseRenderTexture, frame);
        canvas.app.renderer.render(renderable, { renderTexture: renderTexture });
        this.#textureCache.set(path, renderTexture);
        return renderTexture;
    }

    getFromCache(path: string): PIXI.RenderTexture | undefined {
        return this.#textureCache.get(path);
    }
}
