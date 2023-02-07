// https://stackoverflow.com/a/72905049/586382
export default class PipelineStream extends TransformStream {
  constructor(transformStreams, ...strategies) {
    super({}, ...strategies);

    const readable = [super.readable, ...transformStreams]
      .reduce((readable, transform) => readable.pipeThrough(transform));

    Object.defineProperty(this, "readable", {
      get() {
        return readable;
      }
    });
  }
}
