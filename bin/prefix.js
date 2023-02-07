#!/usr/bin/env node

import prefix from 'esdipi/prefix'


process.stdout.write(prefix)

console.debug(`Prefix length: ${prefix.length} bytes`)
