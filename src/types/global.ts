export enum LoadingState {
  NOT_LOADED,
  LOADING,
  LOADED,
  ERROR,
}

export interface IFirebaseError extends Error {
  code: string;
}
