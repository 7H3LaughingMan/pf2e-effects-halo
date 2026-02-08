import { Command } from "commander";
import Config from "./config.ts";

const program = new Command();

program
    .name("configure")
    .description("Manage configuration")
    .action(() => {
        const installPath = Config.instance.get("installPath");
        if (!installPath) {
            console.error(
                "The install path is not set. Use `npm run configure set installPath <path>` to set it. " +
                    "Data paths looks like `C:/Program Files/Foundry Virtual Tabletop`"
            );
        }

        const dataPath = Config.instance.get("dataPath");
        if (!dataPath) {
            console.error(
                "The data path is not set. Use `npm run configure set dataPath <path>` to set it. " +
                    "Data paths looks like `C:/Users/Example/AppData/Local/FoundryVTT`"
            );
        }

        if (installPath && dataPath) console.log("Configuration complete!");
    });

program
    .command("get")
    .argument("<key>", "The configuration key")
    .action((key: string) => {
        console.log(Config.instance.get(key));
    });

program
    .command("set")
    .argument("<key>", "The configuration key")
    .argument("<value>", "The configuration value")
    .action((key: string, value: string) => {
        Config.instance.set(key, value);
        console.log(`Set ${key} to ${value}`);
    });

program.command("view").action(() => {
    console.log("Current Configuration:", Config.instance.getAll());
});

program.command("path").action(() => {
    console.log("Current Configuration File:", Config.instance.configPath);
});

program.parse();
