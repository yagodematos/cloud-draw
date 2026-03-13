import { autocompletion, completeFromList } from "@codemirror/autocomplete"

const iconOptions = [
  { label: "cloud", type: "keyword" },
  { label: "server", type: "keyword" },
  { label: "database", type: "keyword" },
  { label: "user", type: "keyword" },
  { label: "shield", type: "keyword" }
]

export function iconAutocomplete() {
  return autocompletion({
    override: [
      completeFromList(iconOptions)
    ],
    activateOnTyping: true
  })
}
