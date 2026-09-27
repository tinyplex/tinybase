// Stands in for the 'cloudflare:workers' module, which only exists in the
// Workers runtime, so that a WsServerDurableObject can be tested in Node.
export class DurableObject<Env = unknown> {
  ctx: DurableObjectState;
  env: Env;
  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
  }
}
