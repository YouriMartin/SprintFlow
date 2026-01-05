import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put,} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {UserStoryUseCases} from '../../application/use-cases/user-story.use-cases';
import {CreateUserStoryDto} from '../../application/dtos/create-user-story.dto';
import {UpdateUserStoryDto} from '../../application/dtos/update-user-story.dto';
import {UserStory} from '../../domain/entities/user-story.entity';
import {CodeRepository} from '../../domain/entities/code-repository.entity';

@ApiTags('user-stories')
@Controller('user-stories')
export class UserStoryController {
  constructor(private readonly userStoryUseCases: UserStoryUseCases) {}

  @Get()
  @ApiOperation({ summary: 'Get all user stories' })
  @ApiResponse({ status: 200, description: 'Return all user stories' })
  async findAll(): Promise<UserStory[]> {
    return this.userStoryUseCases.getAllUserStories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user story by id' })
  @ApiResponse({ status: 200, description: 'Return the user story' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async findOne(@Param('id') id: string): Promise<UserStory> {
    return this.userStoryUseCases.getUserStoryById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user story' })
  @ApiResponse({ status: 201, description: 'User story created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserStoryDto: CreateUserStoryDto): Promise<UserStory> {
    return this.userStoryUseCases.createUserStory(createUserStoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user story' })
  @ApiResponse({ status: 200, description: 'User story updated successfully' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserStoryDto: UpdateUserStoryDto,
  ): Promise<UserStory> {
    return this.userStoryUseCases.updateUserStory(id, updateUserStoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user story' })
  @ApiResponse({ status: 204, description: 'User story deleted successfully' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.userStoryUseCases.deleteUserStory(id);
  }

  @Get(':id/code-repositories')
  @ApiOperation({ summary: 'Get all code repositories linked to a user story' })
  @ApiResponse({ status: 200, description: 'Return all code repositories for the user story' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async getCodeRepositories(@Param('id') id: string): Promise<CodeRepository[]> {
    return this.userStoryUseCases.getUserStoryCodeRepositories(id);
  }
}
