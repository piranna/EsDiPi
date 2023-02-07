import PipelineStream from "./PipelineStream.js";
import Readlines from "./Readlines.js";
import SdpCleaner from "./SdpCleaner.js";


export default class CleanSdp extends PipelineStream
{
  constructor(...strategies)
  {
    super([new Readlines, new SdpCleaner], ...strategies)
  }
}
