import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import module from "../module.json" with { type: "json" };

export default class Config {
    /**
     * @type {Config | null}
     */
    static #instance;

    /**
     * @returns {Config}
     */
    static get instance() {
        return (this.#instance ??= new Config());
    }

    constructor() {
        this.configPath = path.join(import.meta.dirname, `${module.id}.yml`);

        if (!fs.existsSync(this.configPath))
            fs.writeFileSync(this.configPath, yaml.dump({}));

        this.#config = yaml.load(fs.readFileSync(this.configPath, "utf-8"));
    }

    /**
     * @type {Record<string, any>}
     */
    #config = {};

    /**
     * @type {string}
     */
    configPath = "";

    /**
     * @returns {Record<string, any>}
     */
    getAll() {
        return this.#config;
    }

    /**
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        return this.#config[key];
    }

    /**
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this.#config[key] = value;
        this.#writeConfig();
    }

    #writeConfig() {
        fs.writeFileSync(this.configPath, yaml.dump(this.#config));
    }
}
