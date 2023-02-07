import { deepStrictEqual, throws } from 'node:assert/strict'
import { createReadStream, readFileSync } from 'node:fs';
import { Readable } from 'node:stream'
import { buffer, text } from 'node:stream/consumers'
import { TransformStream } from 'node:stream/web';
import test, { describe } from 'node:test'

import cli from 'esdipi/cli'


describe('clean-sdp', async function()
{
  const testCases = [
    [
      'empty SDP',
      Readable.from(''),
      Buffer.alloc(0)
    ],
    [
      'Offer SDP',
      createReadStream('test/sdp/offer.sdp', 'utf8'),
      readFileSync('test/sdp/offer-clean.sdp')
    ],
    [
      'Answer SDP',
      createReadStream('test/sdp/answer.sdp', 'utf8'),
      readFileSync('test/sdp/answer-clean.sdp')
    ]
  ]

  await Promise.all(testCases.map(async function([title, input, expected])
  {
    await test(title, async function()
    {
      const stdinWeb = Readable.toWeb(input)
      const { readable, writable } = new TransformStream

      cli(stdinWeb, writable, 'clean-sdp')

      const result = await buffer(readable)

      deepStrictEqual(result, expected)
    })
  }))
})

describe('compress', async function()
{
  const testCases = [
    [
      'empty SDP',
      Readable.from(''),
      Buffer.alloc(0)
    ],
    [
      'Offer SDP',
      createReadStream('test/sdp/offer.sdp', 'utf8'),
      readFileSync('test/sdp/offer.esdipi')
    ],
    [
      'Answer SDP',
      createReadStream('test/sdp/answer.sdp', 'utf8'),
      readFileSync('test/sdp/answer.esdipi')
    ]
  ]

  await Promise.all(testCases.map(async function([title, input, expected])
  {
    await test(title, async function()
    {
      const stdinWeb = Readable.toWeb(input)
      const { readable, writable } = new TransformStream

      cli(stdinWeb, writable, 'compress')

      const result = await buffer(readable)

      deepStrictEqual(result, expected)
    })
  }))
})

describe('decompress', async function()
{
  const testCases = [
    [
      'empty esdipi',
      Readable.from(''),
      ''
    ],
    [
      'Offer esdipi',
      createReadStream('test/sdp/offer.esdipi'),
      readFileSync('test/sdp/offer.sdp', 'utf8')
    ],
    [
      'Answer esdipi',
      createReadStream('test/sdp/answer.esdipi'),
      readFileSync('test/sdp/answer.sdp', 'utf8')
    ]
  ]

  await Promise.all(testCases.map(async function([title, input, expected])
  {
    await test(title, async function()
    {
      const stdinWeb = Readable.toWeb(input)
      const { readable, writable } = new TransformStream

      cli(stdinWeb, writable, 'decompress')

      const result = await text(readable)

      deepStrictEqual(result, expected)
    })
  }))
})

test('prefix', async function()
{
  const expected = readFileSync('test/prefix.txt', 'utf8')

  const { readable, writable } = new TransformStream

  cli(null, writable, 'prefix')

  const result = await text(readable)

  deepStrictEqual(result, expected)
})

test('unknown command', function()
{
  throws(cli, `Missing or unknown subcommand: undefined`)
})
