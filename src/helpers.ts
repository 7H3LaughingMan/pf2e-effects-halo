import { EffectTextureSpritesheet } from "effect-texture-spritesheet.ts";
import { TokenPF2e } from "foundry-pf2e";
import { getFlag, MODULE } from "foundry-pf2e/utilities";
import { Circle, Ellipse, Point } from "shapes.ts";

type TokenEffects = PIXI.Container & {
    bg: PIXI.Graphics;
    overlay: PIXI.Sprite | null;
};

type TokenInfo = {
    gridSize: number;
    gridSizeX: number;
    gridSizeY: number;
    icon: Circle;
    token: Circle | Ellipse;
    tokenTileFactor: Point;
};

function calculatePoint(i: number, data: TokenInfo) {
    let row = 1;
    let rowData = tokenRow(data, row);
    while (i >= rowData.rowMax) {
        i -= rowData.rowMax;
        row += 1;
        rowData = tokenRow(data, row);
    }
    return rowData.token.getPoint(i, rowData.rowMax);
}

function updateIconPosition(effectIcon: PIXI.DisplayObject, i: number, data: TokenInfo) {
    const { x, y } = calculatePoint(i, data);
    const hexNudgeX = data.gridSizeX > data.gridSizeY ? Math.abs(data.gridSizeX - data.gridSizeY) / 2 : 0;
    const hexNudgeY = data.gridSizeY > data.gridSizeX ? Math.abs(data.gridSizeY - data.gridSizeX) / 2 : 0;
    effectIcon.position.x = hexNudgeX + x + (data.tokenTileFactor.x * data.gridSize) / 2;
    effectIcon.position.y = hexNudgeY + -1 * y + (data.tokenTileFactor.y * data.gridSize) / 2;
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
        effectIcon.width = tokenData.icon.radius * 2;
        effectIcon.height = tokenData.icon.radius * 2;

        updateIconPosition(effectIcon, i, tokenData);
        i++;
    }
}

function tokenRow(data: TokenInfo, row: number) {
    const effectSpacing = data.icon.radius * (game.settings.get(MODULE.id, "effect-spacing") as number);
    const rowSpacing = data.icon.radius * (game.settings.get(MODULE.id, "row-spacing") as number);
    const newIcon = data.icon.expand(effectSpacing);
    const newToken = data.token.expand((2 * row - 1) * data.icon.radius + row * rowSpacing);
    const rowMax = Math.floor(newToken.circumference / (newIcon.radius * 2));
    return { token: newToken, rowMax };
}

function tokenInfo(token: TokenPF2e): TokenInfo {
    const globalEffectScale = game.settings.get(MODULE.id, "effect-scale") as number;
    const tokenEffectScale = token.actor ? (getFlag<number>(token.actor, "effect-scale") ?? 1) : 1;
    const applyGlobalEffectScale = token.actor ? (getFlag<boolean>(token.actor, "global-effect-scale") ?? true) : true;

    const gridSize = token.scene?.grid.size ?? 100;
    const gridSizeX = token.scene?.grid.sizeX ?? 100;
    const gridSizeY = token.scene?.grid.sizeY ?? 100;
    const tokenTileFactor = { x: token.document.width, y: token.document.height };

    const iconSize = gridSize / 5;
    const iconRadius = iconSize / 2;

    let tokenHalfWidth = ((gridSize * token.document.width) / 2) * Math.abs(token.document.texture.scaleX);
    let tokenHalfHeight = ((gridSize * token.document.height) / 2) * Math.abs(token.document.texture.scaleY);

    if (applyGlobalEffectScale) {
        tokenHalfWidth *= globalEffectScale;
        tokenHalfHeight *= globalEffectScale;
    }

    tokenHalfWidth *= tokenEffectScale;
    tokenHalfHeight *= tokenEffectScale;

    if (token.hasDynamicRing) {
        tokenHalfWidth /= token.ring?.scaleCorrection ?? 1;
        tokenHalfHeight /= token.ring?.scaleCorrection ?? 1;

        tokenHalfWidth *= token.ring?.textureScaleAdjustment ?? 1;
        tokenHalfHeight *= token.ring?.textureScaleAdjustment ?? 1;

        if (!CONFIG.Token.ring.isGridFitMode) {
            tokenHalfWidth /= token.ring?.subjectScaleAdjustment ?? 1;
            tokenHalfHeight /= token.ring?.subjectScaleAdjustment ?? 1;
        }
    }

    return {
        gridSize,
        gridSizeX,
        gridSizeY,
        icon: new Circle(iconRadius),
        token: tokenHalfWidth.almostEqual(tokenHalfHeight)
            ? new Circle(tokenHalfWidth)
            : new Ellipse(tokenHalfWidth, tokenHalfHeight),
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
