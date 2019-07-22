import { BuildModeGenerator } from './types'

export const isBuildModeGenerator = <BuildMode, Result>(
  val: any,
): val is BuildModeGenerator<BuildMode, Result> => typeof val === 'function'
