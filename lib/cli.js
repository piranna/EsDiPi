import {CleanSdp, Compress, Decompress, prefix} from 'esdipi'


export default function(stdinWeb, stdoutWeb, subcommand, lossy)
{
  switch(subcommand)
  {
    case 'clean-sdp':
      stdinWeb.pipeThrough(new CleanSdp).pipeTo(stdoutWeb)
    break

    case 'compress':
      if(lossy === 'lossy') stdinWeb = stdinWeb.pipeThrough(new CleanSdp)

      stdinWeb.pipeThrough(new Compress).pipeTo(stdoutWeb)
    break

    case 'decompress':
      stdinWeb.pipeThrough(new Decompress).pipeTo(stdoutWeb)
    break

    case 'prefix':
      stdoutWeb.getWriter().write(prefix)
    break

    default:
      throw `Missing or unknown subcommand: ${subcommand}`
  }
}
