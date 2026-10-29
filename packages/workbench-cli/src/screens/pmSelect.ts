import {
  BoxRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core"
import { theme } from "../theme"
import { PM_BACKENDS, type ProjectManagement } from "../utils/config.ts"

const SCREEN_ID = "pm-select-screen"

const DESCRIPTIONS: Record<ProjectManagement, string> = {
  "github-issues": "GitHub issues and pull requests",
  linear: "Linear issues",
}

export function showPmSelect(
  renderer: CliRenderer,
  initialPm: ProjectManagement,
  onSelect: (pm: ProjectManagement) => void
): void {
  const existing = renderer.root.getRenderable(SCREEN_ID)
  if (existing) {
    renderer.root.remove(SCREEN_ID)
  }

  const container = new BoxRenderable(renderer, {
    id: SCREEN_ID,
    flexDirection: "column",
    padding: 1,
  })

  const title = new TextRenderable(renderer, {
    id: "pm-select-title",
    content: "Select project management backend",
    fg: theme.tokens.title.fg,
  })
  container.add(title)

  const hint = new TextRenderable(renderer, {
    id: "pm-select-hint",
    content: "Saved to .workbench/settings.yml",
    fg: theme.tokens.subtitle.fg,
  })
  container.add(hint)

  const options = PM_BACKENDS.map((pm) => ({
    name: pm,
    description: DESCRIPTIONS[pm],
    value: pm,
  }))

  const select = new SelectRenderable(renderer, {
    id: "pm-select-list",
    width: 40,
    height: 4,
    options,
    selectedIndex: Math.max(0, PM_BACKENDS.indexOf(initialPm)),
  })

  select.on(SelectRenderableEvents.ITEM_SELECTED, (_index: number, option: { value: string }) => {
    container.visible = false
    onSelect(option.value as ProjectManagement)
  })

  container.add(select)
  renderer.root.add(container)
  select.focus()
}
