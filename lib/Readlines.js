import BufferList from "bl/BufferList.js"


export default class Readlines extends TransformStream
{
  constructor()
  {
    super({
      flush: (...rest) => this.#flush(...rest),
      transform: (...rest) => this.#transform(...rest)
    })
  }


  //
  // Private API
  //

  #bufferList = new BufferList


  #flush = controller =>
  {
    const bufferList = this.#bufferList

    while(bufferList.length)
    {
      const index = bufferList.indexOf('\n') + 1
      if(!index)
      {
        controller.enqueue(bufferList.shallowSlice())
        bufferList.consume(bufferList.length)
        break
      }

      controller.enqueue(bufferList.shallowSlice(0, index))
      bufferList.consume(index)
    }
  }

  #transform = (chunk, controller) =>
  {
    const bufferList = this.#bufferList

    bufferList.append(chunk)

    while(bufferList.length)
    {
      const index = bufferList.indexOf('\n') + 1
      if(!index) break

      controller.enqueue(bufferList.shallowSlice(0, index))
      bufferList.consume(index)
    }
  }
}
