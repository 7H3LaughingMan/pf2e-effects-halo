import { EffectTextureSpritesheet } from "effect-texture-spritesheet.ts";
import { ActorPF2e, ActorSheetPF2e, TokenPF2e } from "foundry-pf2e";
import { ApplicationV1HeaderButton } from "foundry-pf2e/foundry/client/appv1/api/_module.mjs";
import { getFlag, MODULE, SYSTEM, updateFlag } from "foundry-pf2e/utilities";
import { createRoundedEffectIcon, updateEffectScales } from "helpers.ts";
import moduleJson from "../module.json" with { type: "json" };

type ActorConfig = {
    "effect-scale": number;
    "global-effect-scale": boolean;
};

MODULE.register(moduleJson.id);

const effectCache = new EffectTextureSpritesheet();

Hooks.once("init", () => {
    game.settings.register(MODULE.id, "effect-background", {
        name: "Effect Background Color",
        scope: "user",
        config: true,
        type: new foundry.data.fields.ColorField({ required: true, initial: SYSTEM.isPF2e ? "#d8c384" : "#9edae6" })
    });

    game.settings.register(MODULE.id, "effect-border", {
        name: "Effect Border Color",
        scope: "user",
        config: true,
        type: new foundry.data.fields.ColorField({ required: true, initial: SYSTEM.isPF2e ? "#5e0000" : "#1d3c53" })
    });

    game.settings.register(MODULE.id, "effect-spacing", {
        name: "Effect Spacing",
        scope: "world",
        config: true,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({ required: true, min: 0, max: 0.5, step: 0.05, initial: 0.1 })
    });

    game.settings.register(MODULE.id, "row-spacing", {
        name: "Row Spacing",
        scope: "world",
        config: true,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({ required: true, min: 0, max: 0.5, step: 0.05, initial: 0.1 })
    });

    game.settings.register(MODULE.id, "effect-scale", {
        name: "Effect Scale",
        hint: "Increases the calculated radius of tokens to determine placement of effect icons.",
        scope: "world",
        config: true,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({ required: true, min: 0.2, max: 3, step: 0.05, initial: 1 })
    });
});

Hooks.once("ready", () => {
    foundry.canvas.placeables.Token.RENDER_FLAGS.refreshMesh.propagate.push("refreshEffects");

    libWrapper.register<TokenPF2e, TokenPF2e["_refreshEffects"]>(
        MODULE.id,
        "foundry.canvas.placeables.Token.prototype._refreshEffects",
        function (this: TokenPF2e, wrapped: foundry.canvas.placeables.Token["_refreshEffects"]) {
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
            let effectTexture = effectCache.loadTexture(effectTextureCacheKey);
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
                label: "Effects Halo",
                class: MODULE.id,
                icon: "fa-solid fa-sparkles",
                onclick: async () => {
                    const effectScale = foundry.applications.fields.createFormGroup({
                        label: "Effect Scale",
                        hint: "Increases the calculated radius of tokens to determine placement of effect icons.",
                        input: foundry.applications.elements.HTMLRangePickerElement.create({
                            name: "effect-scale",
                            value: getFlag<number>(application.actor, "effect-scale") ?? 1,
                            min: 0.2,
                            max: 3.0,
                            step: 0.05
                        })
                    }).outerHTML;

                    const globalEffectScale = foundry.applications.fields.createFormGroup({
                        label: "Global Effect Scale",
                        hint: "Apply the Effect Scale configured under Settings to this token.",
                        input: foundry.applications.fields.createCheckboxInput({
                            name: "global-effect-scale",
                            value: getFlag<boolean>(application.actor, "global-effect-scale") ?? true
                        })
                    }).outerHTML;

                    const actorConfig = await (foundry.applications.api.DialogV2.prompt({
                        window: { title: `PF2e Effects Halo - ${application.title}` },
                        position: { width: 600 },
                        content: effectScale + globalEffectScale,
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
