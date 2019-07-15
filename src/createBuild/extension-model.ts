import { Build } from './types'

export interface WithAddModel<BuildMode> extends Build<BuildMode> {
  addModel: () => void
}

export const addModel = <BuildMode>(build: Build<BuildMode>) => {
  const extendedBuild = build as WithAddModel<BuildMode>
  extendedBuild.addModel = () => null
  return build
}
