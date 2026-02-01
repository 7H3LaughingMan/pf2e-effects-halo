import Config from "./config.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
    .command(
        "$0 [action] [key] [value]",
        "Manage Configuration",
        (yargs) =>
            yargs
                .positional("action", {
                    describe: "The action to perform",
                    type: "string",
                    choices: ["get", "set", "path", "view"],
                })
                .positional("key", {
                    describe: "The configuration key",
                    type: "string",
                })
                .positional("value", {
                    describe: "The configuration value",
                    type: "string",
                }),
        (argv) => {
            switch (argv.action) {
                case "get": {
                    console.log(Config.instance.get(argv.key));
                    break;
                }
                case "set": {
                    Config.instance.set(argv.key, argv.value);
                    console.log(`Set ${argv.key} to ${argv.value}`);
                    break;
                }
                case "view": {
                    console.log("Current Configuration:", Config.instance.getAll());
                    break;
                }
                case "path": {
                    console.log("Current Configuration File:", Config.instance.configPath);
                }
                default: {
                    const installPath = Config.instance.get("installPath");
                    if (!installPath) {
                        console.error("The install path is not set. Use `npm run configure set installPath <path>` to set it. "
                            + "Data paths looks like `C:/Program Files/Foundry Virtual Tabletop`");
                    }

                    const dataPath = Config.instance.get("dataPath");
                    if (!dataPath) {
                        console.error("The data path is not set. Use `npm run configure set dataPath <path>` to set it. "
                            + "Data paths looks like `C:/Users/Example/AppData/Local/FoundryVTT`");
                    }

                    if (installPath && dataPath) console.log("Configuration complete!");
                }
            }
        },
    ).argv
