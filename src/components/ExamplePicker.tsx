import type { ExampleDiagram } from "../examples"

interface ExamplePickerProps {
  examples: ExampleDiagram[]
  value: string
  onChange: (exampleId: string) => void
}

export function ExamplePicker({ examples, value, onChange }: ExamplePickerProps) {
  return (
    <label className="toolbar-select">
      <span>Example</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {examples.map((example) => (
          <option key={example.id} value={example.id}>
            {example.name}
          </option>
        ))}
      </select>
    </label>
  )
}
