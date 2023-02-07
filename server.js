#!/usr/bin/env node

import {Readable, Writable} from 'stream'

import cli from 'esdipi/cli'


const {argv: [,, subcommand, lossy], exit, stderr, stdin, stdout} = process

const stdinWeb  = Readable.toWeb(stdin)
const stdoutWeb = Writable.toWeb(stdout)

try {
  cli(stdinWeb, stdoutWeb, subcommand, lossy)
}
catch(error)
{
  console.error(error)

  exit(1)
}

process.on('beforeExit', function()
{
  stderr.write(`Read: ${stdin.bytesRead}, written: ${stdout.bytesWritten}`)
})
