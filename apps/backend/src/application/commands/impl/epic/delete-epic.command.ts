export class DeleteEpicCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
