export class LinkTaskToCodeRepositoryCommand {
  constructor(
    public readonly taskId: string,
    public readonly codeRepositoryId: string,
  ) {}
}
