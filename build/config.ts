import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import moduleJSON from "../module.json" with { type: "json" };

export default class Config {
    static #instance: Config | null;

    static get instance() {
        return (this.#instance ??= new Config());
    }

    constructor() {
        this.configPath = path.join(import.meta.dirname, `${moduleJSON.id}.yml`);

        if (!fs.existsSync(this.configPath)) fs.writeFileSync(this.configPath, yaml.dump({}));

        this.#config = yaml.load(fs.readFileSync(this.configPath, "utf-8")) as Record<string, string>;
    }

    #config: Record<string, string> = {};

    configPath = "";

    getAll() {
        return this.#config;
    }

    get(key: string): string | undefined {
        return this.#config[key];
    }

    set(key: string, value: string) {
        this.#config[key] = value;
        this.#writeConfig();
    }

    #writeConfig() {
        fs.writeFileSync(this.configPath, yaml.dump(this.#config));
    }
}
