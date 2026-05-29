import { EffectTextureSpritesheet } from "effect-texture-spritesheet.ts";
import { ActorPF2e, ActorSheetPF2e, TokenPF2e } from "foundry-pf2e";
import { ApplicationV1HeaderButton } from "foundry-pf2e/foundry/client/appv1/api/_module.mjs";
import { getFlag, MODULE, SYSTEM, updateFlag } from "foundry-pf2e/utilities";
import { createRoundedEffectIcon, updateEffectScales } from "helpers.ts";
import moduleJson from "../module.json" with { type: "json" };

type ActorConfig = {
    effectScale: number;
    globalEffectScale: boolean;
};

MODULE.register(moduleJson.id);

const effectCache = new EffectTextureSpritesheet();

Hooks.once("init", () => {
    game.settings.register(MODULE.id, "effectBackground", {
        name: "PF2eEffectsHalo.Settings.EffectBackground.Name",
        hint: "PF2eEffectsHalo.Settings.EffectBackground.Hint",
        scope: "user",
        config: true,
        type: new foundry.data.fields.ColorField({ required: true, initial: SYSTEM.isPF2e ? "#d8c384" : "#9edae6" })
    });

    game.settings.register(MODULE.id, "effectBorder", {
        name: "PF2eEffectsHalo.Settings.EffectBorder.Name",
        hint: "PF2eEffectsHalo.Settings.EffectBorder.Hint",
        scope: "user",
        config: true,
        type: new foundry.data.fields.ColorField({ required: true, initial: SYSTEM.isPF2e ? "#5e0000" : "#1d3c53" })
    });

    game.settings.register(MODULE.id, "effectSpacing", {
        name: "PF2eEffectsHalo.Settings.EffectSpacing.Name",
        hint: "PF2eEffectsHalo.Settings.EffectSpacing.Hint",
        scope: "world",
        config: true,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({ required: true, min: 0, max: 0.5, step: 0.05, initial: 0.1 })
    });

    game.settings.register(MODULE.id, "rowSpacing", {
        name: "PF2eEffectsHalo.Settings.RowSpacing.Name",
        hint: "PF2eEffectsHalo.Settings.RowSpacing.Hint",
        scope: "world",
        config: true,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({ required: true, min: 0, max: 0.5, step: 0.05, initial: 0.1 })
    });

    game.settings.register(MODULE.id, "haloRadius", {
        name: "PF2eEffectsHalo.Settings.HaloRadius.Name",
        hint: "PF2eEffectsHalo.Settings.HaloRadius.Hint",
        scope: "world",
        config: true,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({ required: true, min: 0.2, max: 3, step: 0.05, initial: 1 })
    });
});

Hooks.once("setup", () => {
    libWrapper.register<TokenPF2e, TokenPF2e["_refreshEffects"]>(
        MODULE.id,
        "foundry.canvas.placeables.Token.prototype._refreshEffects",
        function (this: TokenPF2e, wrapped: foundry.canvas.placeables.Token["_refreshEffects"]) {
            wrapped();
            updateEffectScales(this);
        },
        "WRAPPER"
    );

    libWrapper.register<TokenPF2e, TokenPF2e["_refreshSize"]>(
        MODULE.id,
        "foundry.canvas.placeables.Token.prototype._refreshSize",
        function (this: TokenPF2e, wrapped: foundry.canvas.placeables.Token["_refreshSize"]) {
            wrapped();
            updateEffectScales(this);
        },
        "WRAPPER"
    );

    libWrapper.register<TokenPF2e, TokenPF2e["_drawEffect"]>(
        MODULE.id,
        "foundry.canvas.placeables.Token.prototype._drawEffect",
        async function (this: TokenPF2e, src: string, _tint: PIXI.ColorSource | null) {
            if (!src) return;

            const fallbackEffectIcon = "icons/svg/hazard.svg";
            const effectTextureCacheKey = src || fallbackEffectIcon;
            let effectTexture = effectCache.getFromCache(effectTextureCacheKey);
            let icon: PIXI.Sprite;

            if (effectTexture) {
                icon = new PIXI.Sprite(effectTexture);
            } else {
                const texture = (await foundry.canvas.loadTexture(src, {
                    fallback: fallbackEffectIcon
                })) as PIXI.Texture;
                const rawEffectIcon = new PIXI.Sprite(texture);

                if (src === game.settings.get(game.system.id, "deathIcon")) {
                    return this.effects.addChild(rawEffectIcon);
                }

                effectTexture = effectCache.addToCache(effectTextureCacheKey, createRoundedEffectIcon(rawEffectIcon));
                icon = new PIXI.Sprite(effectTexture);
            }

            return this.effects.addChild(icon);
        },
        "OVERRIDE"
    );
});

Hooks.on(
    "getActorSheetPF2eHeaderButtons",
    (application: ActorSheetPF2e<ActorPF2e>, buttons: ApplicationV1HeaderButton[]) => {
        if (
            game.user.isGM &&
            (application.actor.allowedItemTypes.includes("condition") ||
                application.actor.allowedItemTypes.includes("effect"))
        ) {
            buttons.unshift({
                label: game.i18n.localize("PF2eEffectsHalo.Actor.HeaderButton.Label"),
                class: MODULE.id,
                icon: "fa-solid fa-sparkles",
                onclick: async () => {
                    const haloRadius = foundry.applications.fields.createFormGroup({
                        label: game.i18n.localize("PF2eEffectsHalo.Token.HaloRadius.Label"),
                        hint: game.i18n.localize("PF2eEffectsHalo.Token.HaloRadius.Hint"),
                        input: foundry.applications.elements.HTMLRangePickerElement.create({
                            name: "haloRadius",
                            value: getFlag<number>(application.actor, "haloRadius") ?? 1,
                            min: 0.2,
                            max: 3.0,
                            step: 0.05
                        })
                    }).outerHTML;

                    const applyGlobal = foundry.applications.fields.createFormGroup({
                        label: game.i18n.localize("PF2eEffectsHalo.Token.ApplyGlobal.Label"),
                        hint: game.i18n.localize("PF2eEffectsHalo.Token.ApplyGlobal.Hint"),
                        input: foundry.applications.fields.createCheckboxInput({
                            name: "applyGlobal",
                            value: getFlag<boolean>(application.actor, "applyGlobal") ?? true
                        })
                    }).outerHTML;

                    const actorConfig = await (foundry.applications.api.DialogV2.prompt({
                        window: { title: `${game.i18n.localize("PF2eEffectsHalo.Title")} - ${application.title}` },
                        position: { width: "auto" },
                        content: haloRadius + applyGlobal,
                        ok: {
                            icon: "fa-solid fa-floppy-disk",
                            label: game.i18n.format("DOCUMENT.Update", {
                                type: game.i18n.localize(Actor.metadata.label)
                            }),
                            callback: (_event, button) =>
                                new foundry.applications.ux.FormDataExtended(button.form!).object
                        }
                    }) as Promise<ActorConfig | null>);

                    if (actorConfig) {
                        await updateFlag(application.actor, actorConfig);
                    }
                }
            });
        }
    }
);

if (import.meta.hot) {
    import.meta.hot.accept(() => {
        import.meta.hot?.invalidate();
    });
}
