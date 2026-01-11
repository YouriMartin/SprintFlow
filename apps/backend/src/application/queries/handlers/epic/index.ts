import { GetAllEpicsHandler } from './get-all-epics.handler';
import { GetEpicByIdHandler } from './get-epic-by-id.handler';

export const EpicQueryHandlers = [GetAllEpicsHandler, GetEpicByIdHandler];

export * from './get-all-epics.handler';
export * from './get-epic-by-id.handler';
