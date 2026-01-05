import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import type {IUserStoryRepository} from '../../domain/repositories/user-story.repository.interface';
import {USER_STORY_REPOSITORY} from '../../domain/repositories/user-story.repository.interface';
import type {CodeRepositoryRepository} from '../../domain/repositories/code-repository.repository.interface';
import {CODE_REPOSITORY_REPOSITORY} from '../../domain/repositories/code-repository.repository.interface';
import {UserStory} from '../../domain/entities/user-story.entity';
import {CodeRepository} from '../../domain/entities/code-repository.entity';
import {CreateUserStoryDto} from '../dtos/create-user-story.dto';
import {UpdateUserStoryDto} from '../dtos/update-user-story.dto';

@Injectable()
export class UserStoryUseCases {
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async getAllUserStories(): Promise<UserStory[]> {
    return this.userStoryRepository.findAll();
  }

  async getUserStoryById(id: string): Promise<UserStory> {
    const userStory = await this.userStoryRepository.findById(id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${id} not found`);
    }
    return userStory;
  }

  async createUserStory(createUserStoryDto: CreateUserStoryDto, userId: string): Promise<UserStory> {
    return this.userStoryRepository.create({
      ...createUserStoryDto,
      createdBy: userId,
    });
  }

  async updateUserStory(id: string, updateUserStoryDto: UpdateUserStoryDto, userId: string): Promise<UserStory> {
    const userStory = await this.userStoryRepository.findById(id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${id} not found`);
    }
    return this.userStoryRepository.update(id, {
      ...updateUserStoryDto,
      updatedBy: userId,
    });
  }

  async deleteUserStory(id: string, userId: string): Promise<void> {
    const userStory = await this.userStoryRepository.findById(id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${id} not found`);
    }
    await this.userStoryRepository.delete(id, userId);
  }

  async getUserStoryCodeRepositories(userStoryId: string): Promise<CodeRepository[]> {
    const userStory = await this.userStoryRepository.findById(userStoryId);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${userStoryId} not found`);
    }
    return this.codeRepositoryRepository.findByUserStoryId(userStoryId);
  }
}
