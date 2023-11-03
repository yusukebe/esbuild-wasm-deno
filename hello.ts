import { Hono } from 'npm:hono'
import { html } from 'npm:hono/html'
import { serveStatic } from 'npm:hono/deno'
import * as esbuild from 'https://deno.land/x/esbuild@v0.19.5/wasm.js'

const esbuildWasmURL = new URL('./esbuild_v0.19.5.wasm', import.meta.url).href

let init = false

const app = new Hono()

app.get('/static/*', async (c, next) => {
  await next()
  const script = await c.res.text()
  if (!init) {
    await esbuild.initialize({
      wasmURL: esbuildWasmURL,
      worker: false
    })
    init = true
  }
  const { code } = await esbuild.transform(script, {
    loader: 'tsx'
  })
  c.res = c.body(code, {
    headers: { 'content-type': 'text/javascript' }
  })
})

app.get('/static/*', serveStatic())

app.get('/', (c) => {
  return c.html(html`
    <html>
      <head>
        <script type="module" src="/static/script.tsx"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `)
})

Deno.serve(app.fetch)
