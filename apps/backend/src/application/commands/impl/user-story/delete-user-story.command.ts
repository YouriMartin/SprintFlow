export class DeleteUserStoryCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
