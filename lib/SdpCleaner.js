// TODO: maybe remove i=? if so, we can remove a=sdplang:
// TODO: can we remove lang=?


function transform(chunk, controller)
{
  chunk = chunk.toString()

  let newline = ''

  const index = chunk.indexOf('\n')
  if(index > -1)
    if(chunk[index - 1] === '\r')
    {
      chunk.substring(0, index - 2)
      newline = '\r\n'
    }
    else
    {
      chunk.substring(0, index - 1)
      newline = '\n'
    }

  switch(chunk[0])
  {
    case 'a':
      switch(chunk.split(':')[0])
      {
        case 'a=cat': case 'a=framerate': case 'a=keywds': return

        case 'a=fmtp': break

        default: [chunk] = chunk.split(';')
      }
    break

    case 'o':
      {
        const [, ...rest] = chunk.split(' ')

        chunk = 'o=- ' + rest.join(' ')
      }
    break

    case 's': chunk = 's=-'  ; break
    case 't': chunk = 't=0 0'; break

    case 'b': case 'e': case 'k': case 'p': case 'r': case 'u': case 'z':
    case '':
      return
  }

  chunk = chunk.trimEnd()

  controller.enqueue(chunk + newline)
}


export default class SdpCleaner extends TransformStream
{
  constructor()
  {
    super({transform})
  }
}
