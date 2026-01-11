import { CreateEpicHandler } from './create-epic.handler';
import { UpdateEpicHandler } from './update-epic.handler';
import { DeleteEpicHandler } from './delete-epic.handler';

export const EpicCommandHandlers = [
  CreateEpicHandler,
  UpdateEpicHandler,
  DeleteEpicHandler,
];

export * from './create-epic.handler';
export * from './update-epic.handler';
export * from './delete-epic.handler';
