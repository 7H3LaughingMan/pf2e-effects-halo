import { EffectTextureSpritesheet } from "effect-texture-spritesheet.ts";
import { TokenPF2e } from "foundry-pf2e";
import { Point } from "foundry-pf2e/foundry/common/_types.mjs";
import { addPoint, getFlag, MODULE, subtractPoint, SYSTEM } from "foundry-pf2e/utilities";
import { Circle, Ellipse } from "shapes.ts";

type TokenEffects = PIXI.Container & {
    bg: PIXI.Graphics;
    overlay: PIXI.Sprite | null;
};

type TokenInfo = {
    icon: Circle;
    offset: Point;
    token: Circle | Ellipse;
};

export function updateEffectScales(token: TokenPF2e) {
    (token.effects as TokenEffects).bg.visible = false;
    const tokenData = tokenInfo(token);

    let i = 0;
    let row = 1;
    let rowData = tokenRow(tokenData, row);

    for (const effectIcon of token.effects.children) {
        if (effectIcon === (token.effects as TokenEffects).bg) continue;
        if (effectIcon === (token.effects as TokenEffects).overlay) continue;
        if (!(effectIcon instanceof PIXI.Sprite)) continue;

        if (i >= rowData.rowMax) {
            i -= rowData.rowMax;
            row += 1;
            rowData = tokenRow(tokenData, row);
        }

        const effectPosition = addPoint(tokenData.offset, rowData.token.getPoint(i, rowData.rowMax));

        effectIcon.anchor.set(0.5);
        effectIcon.width = tokenData.icon.radius * 2;
        effectIcon.height = tokenData.icon.radius * 2;
        effectIcon.x = effectPosition.x;
        effectIcon.y = effectPosition.y;

        i++;
    }
}

function tokenRow(data: TokenInfo, row: number) {
    const effectSpacing = data.icon.radius * (game.settings.get(MODULE.id, "effectSpacing") as number);
    const rowSpacing = data.icon.radius * (game.settings.get(MODULE.id, "rowSpacing") as number);
    const newIcon = data.icon.expand(effectSpacing);
    const newToken = data.token.expand((2 * row - 1) * data.icon.radius + row * rowSpacing);
    const rowMax = Math.floor(newToken.circumference / (newIcon.radius * 2));
    return { token: newToken, rowMax };
}

function tokenInfo(token: TokenPF2e): TokenInfo {
    const globalHaloRadius = game.settings.get(MODULE.id, "haloRadius") as number;
    const tokenHaloRadius = token.actor ? (getFlag<number>(token.actor, "haloRadius") ?? 1) : 1;
    const applyGlobal = token.actor ? (getFlag<boolean>(token.actor, "applyGlobal") ?? true) : true;

    const gridSize = token.scene?.grid.size ?? 100;
    const iconRadius = gridSize / 10;

    const topLeftPoint = { x: token.x, y: token.y } as Point;
    const centerPoint = token.getCenterPoint();
    const offset = subtractPoint(centerPoint, topLeftPoint);
    let tokenHalfWidth = (gridSize * token.document.width) / 2;
    let tokenHalfHeight = (gridSize * token.document.height) / 2;

    if (applyGlobal) {
        tokenHalfWidth *= globalHaloRadius;
        tokenHalfHeight *= globalHaloRadius;
    }

    tokenHalfWidth *= tokenHaloRadius;
    tokenHalfHeight *= tokenHaloRadius;

    if (token.hasDynamicRing) {
        tokenHalfWidth *= token.document.texture.scaleX;
        tokenHalfHeight *= token.document.texture.scaleY;

        tokenHalfWidth /= token.ring?.scaleCorrection ?? 1;
        tokenHalfHeight /= token.ring?.scaleCorrection ?? 1;

        tokenHalfWidth *= token.ring?.textureScaleAdjustment ?? 1;
        tokenHalfHeight *= token.ring?.textureScaleAdjustment ?? 1;

        if (!CONFIG.Token.ring.isGridFitMode) {
            tokenHalfWidth /= token.ring?.subjectScaleAdjustment ?? 1;
            tokenHalfHeight /= token.ring?.subjectScaleAdjustment ?? 1;
        }
    } else {
        if (token.document.flags[SYSTEM.id].autoscale) {
            tokenHalfWidth *= token.document.texture.scaleX;
            tokenHalfHeight *= token.document.texture.scaleY;
        }
    }

    return {
        icon: new Circle(iconRadius),
        offset,
        token: tokenHalfWidth.almostEqual(tokenHalfHeight)
            ? new Circle(tokenHalfWidth)
            : new Ellipse(tokenHalfWidth, tokenHalfHeight)
    };
}

function createBG(iconSize: number, borderWidth: number) {
    const background = new PIXI.Graphics();
    const r = iconSize / 2;
    background.lineStyle(borderWidth, game.settings.get(MODULE.id, "effectBorder") as Color, 1, 0);
    background.beginFill(game.settings.get(MODULE.id, "effectBackground") as Color);
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
