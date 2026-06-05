export interface IMetaConfig {
  appVersion: string;
  mapsUpdatedAt: number;
  isMaintenance: boolean;
  chunks: {
    scores: number;
    tournaments: number;
    trainings: number;
    users: number;
  };
}
