import basicWebApp from "../examples/basic-web-app.dsl?raw"
import microservices from "../examples/microservices.dsl?raw"
import nestedGroups from "../examples/nested-groups.dsl?raw"

export interface ExampleDiagram {
  id: string
  name: string
  source: string
}

export const builtInExamples: ExampleDiagram[] = [
  {
    id: "basic-web-app",
    name: "Basic web app",
    source: basicWebApp
  },
  {
    id: "microservices",
    name: "Microservices",
    source: microservices
  },
  {
    id: "nested-groups",
    name: "Nested groups",
    source: nestedGroups
  }
]
