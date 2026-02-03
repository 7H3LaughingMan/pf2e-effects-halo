import { EffectTextureSpritesheet } from "effect-texture-spritesheet.ts";
import { TokenPF2e } from "foundry-pf2e";
import { getFlag, MODULE } from "foundry-pf2e/utilities";

type TokenEffects = PIXI.Container & {
    bg: PIXI.Graphics;
    overlay: PIXI.Sprite | null;
};

type TokenInfo = {
    gridSize: number;
    gridSizeX: number;
    gridSizeY: number;
    iconRadius: number;
    tokenRadius: number;
    tokenTileFactor: number;
};

function updateIconSize(effectIcon: PIXI.Sprite, size: number) {
    effectIcon.width = size;
    effectIcon.height = size;
}

function polar_to_cartesian(theta: number) {
    return { x: Math.cos(theta), y: Math.sin(theta) };
}

function calculateOffsets(i: number, data: TokenInfo) {
    let row = 1;
    let rowData = tokenRow(data, row);
    while (i >= rowData.rowMax) {
        i -= rowData.rowMax;
        row += 1;
        rowData = tokenRow(data, row);
    }
    const ratio = i / rowData.rowMax;
    const initialRotation = (0.5 + (1 / rowData.rowMax) * Math.PI) * Math.PI;
    const theta = ratio * 2 * Math.PI + initialRotation;
    return { offset: rowData.offset, theta };
}

function updateIconPosition(effectIcon: PIXI.DisplayObject, i: number, data: TokenInfo) {
    const { offset, theta } = calculateOffsets(i, data);
    const { x, y } = polar_to_cartesian(theta);
    const hexNudgeX = data.gridSizeX > data.gridSizeY ? Math.abs(data.gridSizeX - data.gridSizeY) / 2 : 0;
    const hexNudgeY = data.gridSizeY > data.gridSizeX ? Math.abs(data.gridSizeY - data.gridSizeX) / 2 : 0;
    effectIcon.position.x = hexNudgeX + ((x * offset + 1) / 2) * data.tokenTileFactor * data.gridSize;
    effectIcon.position.y = hexNudgeY + ((-1 * y * offset + 1) / 2) * data.tokenTileFactor * data.gridSize;
}

export function updateEffectScales(token: TokenPF2e) {
    (token.effects as TokenEffects).bg.visible = false;
    const tokenData = tokenInfo(token);

    let i = 0;
    for (const effectIcon of token.effects.children) {
        if (effectIcon === (token.effects as TokenEffects).bg) continue;
        if (effectIcon === (token.effects as TokenEffects).overlay) continue;
        if (!(effectIcon instanceof PIXI.Sprite)) continue;

        effectIcon.anchor.set(0.5);

        updateIconSize(effectIcon, tokenData.iconRadius * 2);
        updateIconPosition(effectIcon, i, tokenData);
        i++;
    }
}

function tokenRow(data: TokenInfo, row: number) {
    const effectSpacing = data.iconRadius * (game.settings.get(MODULE.id, "effect-spacing") as number);
    const rowSpacing = data.iconRadius * (game.settings.get(MODULE.id, "row-spacing") as number);
    const tokenRadius = data.tokenRadius + (2 * row - 1) * data.iconRadius + row * rowSpacing;
    const offset = (tokenRadius * 2) / (data.gridSize * data.tokenTileFactor);
    const rowMax = Math.floor(Math.PI / Math.asin((data.iconRadius + effectSpacing) / tokenRadius));
    return { offset, rowMax };
}

function tokenInfo(token: TokenPF2e): TokenInfo {
    const globalEffectScale = game.settings.get(MODULE.id, "effect-scale") as number;
    const tokenEffectScale = token.actor ? (getFlag<number>(token.actor, "effect-scale") ?? 1) : 1;
    const applyGlobalEffectScale = token.actor ? (getFlag<boolean>(token.actor, "global-effect-scale") ?? true) : true;

    const gridSize = token.scene?.grid.size ?? 100;
    const gridSizeX = token.scene?.grid.sizeX ?? 100;
    const gridSizeY = token.scene?.grid.sizeY ?? 100;
    const tokenTileFactor = token.document.width;

    const iconSize = gridSize / 5;
    const iconRadius = iconSize / 2;

    let tokenRadius = ((gridSize * tokenTileFactor) / 2) * token.document.texture.scaleX;
    if (applyGlobalEffectScale) tokenRadius *= globalEffectScale;
    tokenRadius *= tokenEffectScale;

    if (token.hasDynamicRing) {
        tokenRadius *= token.ring?.textureScaleAdjustment ?? 1;
        if (!CONFIG.Token.ring.isGridFitMode) {
            tokenRadius /= token.ring?.subjectScaleAdjustment ?? 1;
        }
    }

    return {
        gridSize,
        gridSizeX,
        gridSizeY,
        iconRadius,
        tokenRadius,
        tokenTileFactor
    };
}

function createBG(iconSize: number, borderWidth: number) {
    const background = new PIXI.Graphics();
    const r = iconSize / 2;
    background.lineStyle(borderWidth, game.settings.get(MODULE.id, "effect-border") as Color, 1, 0);
    background.beginFill(game.settings.get(MODULE.id, "effect-background") as Color);
    background.drawCircle(r, r, r);
    background.endFill();
    return background;
}

export function createRoundedEffectIcon(effectIcon: PIXI.Sprite) {
    const texture = effectIcon.texture;
    const borderWidth = 3;
    const textureSize = EffectTextureSpritesheet.spriteSize;

    const container = new PIXI.Container();
    container.width = textureSize;
    container.height = textureSize;

    container.addChild(createBG(textureSize, borderWidth));
    container.addChild(effectIcon);

    const effectSize = textureSize - 6 * borderWidth;
    const scale = effectSize / Math.max(texture.height, texture.width);
    effectIcon.scale.set(scale, scale);
    effectIcon.x = (textureSize - effectIcon.width) / 2;
    effectIcon.y = (textureSize - effectIcon.height) / 2;
    const clipRadius = textureSize / 2 - 3 * borderWidth;
    effectIcon.mask = new PIXI.Graphics()
        .beginFill(0xffffff)
        .drawCircle(textureSize / 2, textureSize / 2, clipRadius)
        .endFill();
    return container;
}
