export enum RepositoryType {
  GITLAB = 'gitlab',
  GITHUB = 'github',
}

export interface CodeRepository {
  id: string;
  name: string;
  description: string | null;
  repositoryUrl: string;
  repositoryType: RepositoryType;
  repositoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
