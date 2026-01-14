export class UnlinkTaskFromCodeRepositoryCommand {
  constructor(
    public readonly taskId: string,
    public readonly codeRepositoryId: string,
  ) {}
}
