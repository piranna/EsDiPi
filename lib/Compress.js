import BufferList from "bl/BufferList.js"

import DEFAULT_PREFIX, {LENGTH} from 'esdipi/prefix'


function encode(slice, controller, index, length)
{
  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt32BE((1 << 23) + (index << LENGTH) + length);

  controller.enqueue(buf.subarray(1))
  slice.consume(length)
}

function filterIndex(index)
{
  const {prefix, searchString} = this

  return prefix.slice(index, index + searchString.length) === searchString
}

function indexesOf(prefix, searchString)
{
  const result = []

  let index = -1
  do
    index = prefix.indexOf(searchString, index + 1)
  while(index > -1 && result.push(index))

  return result
}


export default class Compress extends TransformStream
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


  #compress(controller)
  {
    const bufferList = this.#bufferList
    const prefix = this.#prefix

    let oldIndexes

    while(bufferList.length >= 4)
    {
      let slice

      // Look for entries of current data in the prefix string
      for(;;)
      {
        slice = bufferList.shallowSlice(0, 4)
        oldIndexes = indexesOf(prefix, slice.toString())

        if(oldIndexes.length) break

        // Data slice not found on prefix, left first char as uncompressed and
        // advance to check starting from the next one
        controller.enqueue(bufferList.slice(0, 1))
        bufferList.consume(1)

        // Not enough data to compress, wait for more
        if(bufferList.length < 4) return
      }

      // Look for the longest substring in the prefix
      for(let sliceIndex = 4; sliceIndex < bufferList.length;)
      {
        slice.append(bufferList.shallowSlice(sliceIndex, ++sliceIndex))

        const indexes = oldIndexes.filter(
          filterIndex, {prefix, searchString: slice.toString()}
        )

        if(!indexes.length)
        {
          // Extended data slice not found on prefix, encode previous one
          encode(bufferList, controller, oldIndexes[0], slice.length - 1)

          break
        }

        if(slice.length === 2**LENGTH - 1)
        {
          // Extended data slice got maximum length, encode it
          encode(bufferList, controller, indexes[0], slice.length)

          break
        }

        oldIndexes = indexes
      }
    }

    return oldIndexes?.[0]
  }

  #flush = (controller) =>
  {
    const bufferList = this.#bufferList

    const index = this.#compress(controller)
    if(index != null)
      return encode(bufferList, controller, index, bufferList.length)

    if(!bufferList.length) return

    controller.enqueue(bufferList.slice())
    bufferList.consume(bufferList.length)
  }

  #transform = (chunk, controller) =>
  {
    this.#bufferList.append(chunk)

    this.#compress(controller)
  }
}
