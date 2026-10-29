import { parseArgs } from "node:util"
import { DEFAULT_PM, PM_BACKENDS, isProjectManagement, type ProjectManagement } from "./utils/config.ts"

export interface CliArgs {
  help: boolean
  tui: boolean
  org?: string
  codeRepositories: string[]
  resourceRepositories: string[]
  codeBranch: string
  resourceBranch: string
  init: boolean
  source: string
  remote: boolean
  name: string
  noTui: boolean
  sync: boolean
  pm: ProjectManagement
}

export function parseCliArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  const { values } = parseArgs({
    options: {
      help: { type: "boolean", default: false },
      tui: { type: "boolean", default: false },
      org: { type: "string" },
      "code-repository": { type: "string", multiple: true, default: [] },
      "resource-repository": { type: "string", multiple: true, default: [] },
      "code-branch": { type: "string", default: "main" },
      "resource-branch": { type: "string", default: "main" },
      init: { type: "boolean", default: false },
      source: { type: "string", default: "buildhaus/workbench" },
      remote: { type: "boolean", default: false },
      name: { type: "string", default: "workbench" },
      "no-tui": { type: "boolean", default: false },
      sync: { type: "boolean", default: false },
      pm: { type: "string", default: DEFAULT_PM },
    },
    args: argv,
    strict: true,
    allowPositionals: false,
  })

  const pm = values.pm as string
  if (!isProjectManagement(pm)) {
    console.error(`Invalid --pm value "${pm}". Allowed values: ${PM_BACKENDS.join(", ")}`)
    process.exit(1)
  }

  return {
    help: values.help,
    tui: values.tui,
    org: values.org,
    codeRepositories: values["code-repository"] as string[],
    resourceRepositories: values["resource-repository"] as string[],
    codeBranch: values["code-branch"] as string,
    resourceBranch: values["resource-branch"] as string,
    init: values.init,
    source: values.source as string,
    remote: values.remote as boolean,
    name: values.name as string,
    noTui: values["no-tui"] as boolean,
    sync: values.sync as boolean,
    pm,
  }
}

export function printHelp(): void {
  console.log(`workbench - Initialize a development workbench

USAGE:
  workbench --init [options]
  workbench --init --no-tui [options]
  workbench --org <name> --code-repository <url> [options]
  workbench --tui
  workbench --sync
  workbench --help

OPTIONS:
  --init                          Initialize a new workbench (clone)
  --name <name>                   Name for the local folder (default: workbench)
  --source <repo>                 Source repository to clone from (default: buildhaus/workbench)
  --remote                        Create a private GitHub repo and set as origin
  --no-tui                        Skip TUI, use defaults or provided values
  --org <name>                    GitHub organization name
  --code-repository <url>         Code repository URL (can be repeated)
  --resource-repository <url>     Resource repository URL (can be repeated)
  --code-branch <name>            Branch for all code repositories (default: main)
  --resource-branch <name>        Branch for all resource repositories (default: main)
  --pm <github-issues|linear>     Project management backend (default: github-issues)
  --sync                          Sync workbench files from the source repository
  --tui                           Launch interactive TUI mode
  --help                          Display this help message

EXAMPLES:
  workbench --init
  workbench --init --no-tui --name my-project
  workbench --init --no-tui --name my-project --source myorg/custom-wb
  workbench --init --no-tui --name my-project --pm linear
  workbench --init --no-tui --name my-project --remote --org myorg
  workbench --init --no-tui --name my-project --remote --org myorg --code-repository https://github.com/myorg/api
  workbench --org myorg --code-repository https://github.com/myorg/backend
  workbench --tui
  workbench --sync
`)
}
