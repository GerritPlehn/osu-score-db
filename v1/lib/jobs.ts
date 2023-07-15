export interface MatchJob {
  type: 'archiveMatch'
  data: {
    matchId: number
  }
}
export interface UserJob {
  type: 'updateUser'
  data: {
    userId: number
  }
}

export type WorkerJob = MatchJob | UserJob
