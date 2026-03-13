export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">CloudDSL</p>
          <h1>Architecture diagrams as code</h1>
        </div>
        <p className="app-summary">Scaffold ready. Parser, layout, and renderer will attach here.</p>
      </header>
      <main className="app-main">
        <section className="panel panel-editor" aria-label="Editor placeholder">
          Editor panel
        </section>
        <section className="panel panel-canvas" aria-label="Canvas placeholder">
          Canvas panel
        </section>
      </main>
    </div>
  )
}
