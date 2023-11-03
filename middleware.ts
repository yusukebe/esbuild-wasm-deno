import { createMiddleware } from 'npm:hono/factory'
import * as esbuild from 'https://deno.land/x/esbuild@v0.19.5/wasm.js'

const esbuildWasmURL = new URL('./esbuild_v0.19.5.wasm', import.meta.url).href
let init = false

export const transpiler = () => {
  return createMiddleware(async (c, next) => {
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
}
