import { Hono } from 'npm:hono'
import { html } from 'npm:hono/html'
import { serveStatic } from 'npm:hono/deno'
import { transpiler } from './middleware.ts'

const app = new Hono()

app.get('/static/:name{.+.tsx?}', transpiler())
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
