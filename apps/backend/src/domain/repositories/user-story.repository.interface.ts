import {UserStory} from '../entities/user-story.entity';

export interface IUserStoryRepository {
  findAll(): Promise<UserStory[]>;
  findById(id: string): Promise<UserStory | null>;
  create(userStory: Partial<UserStory>): Promise<UserStory>;
  update(id: string, userStory: Partial<UserStory>): Promise<UserStory>;
  delete(id: string): Promise<void>;
}

export const USER_STORY_REPOSITORY = Symbol('USER_STORY_REPOSITORY');
