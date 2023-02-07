import BufferList from "bl/BufferList.js"

import DEFAULT_PREFIX, {LENGTH} from 'esdipi/prefix'


const OFFSET_MASK = ~0 << LENGTH
const LENGTH_MASK = ~OFFSET_MASK


export default class Decompress extends TransformStream
{
  constructor(prefix = DEFAULT_PREFIX)
  {
    super({
      flush: (...rest) => this.#flush(...rest),
      transform: (...rest) => this.#transform(...rest)
    })

    this.#prefix = prefix
  }


  //
  // Private API
  //

  #bufferList = new BufferList
  #prefix


  #flush = (controller) =>
  {
    if(this.#bufferList.length) controller.error('Corrupted end of data')
  }

  #transform = (chunk, controller) =>
  {
    const bufferList = this.#bufferList
    const prefix = this.#prefix

    const slice = new BufferList

    bufferList.append(chunk)

    while(bufferList.length)
    {
      if(bufferList.readUInt8() & 0x80)
      {
        if(slice.length)
        {
          controller.enqueue(slice.shallowSlice().toString())
          slice.consume(slice.length)
        }

        if(bufferList.length < 3) return

        const list = [Buffer.alloc(1), bufferList.slice(0, 3)]
        bufferList.consume(3)

        const uint32be = Buffer.concat(list).readUint32BE() & 0x7FFFFF

        const offset = (uint32be & OFFSET_MASK) >> LENGTH
        const length = uint32be & LENGTH_MASK

        controller.enqueue(prefix.substr(offset, length))

        continue
      }

      slice.append(bufferList.shallowSlice(0, 1))
      bufferList.consume(1)
    }

    if(slice.length)
    {
      controller.enqueue(slice.shallowSlice().toString())
      slice.consume(slice.length)
    }
  }
}
