import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateUserStoryDto } from '../../application/dtos/create-user-story.dto';
import { UpdateUserStoryDto } from '../../application/dtos/update-user-story.dto';
import { UserStory } from '../../domain/entities/user-story.entity';
import { CodeRepository } from '../../domain/entities/code-repository.entity';
import {
  CreateUserStoryCommand,
  UpdateUserStoryCommand,
  DeleteUserStoryCommand,
} from '../../application/commands/impl/user-story';
import {
  GetAllUserStoriesQuery,
  GetUserStoryByIdQuery,
  GetUserStoryCodeRepositoriesQuery,
} from '../../application/queries/impl/user-story';
import type { JwtPayload } from '../../infrastructure/auth/jwt.strategy';

@ApiTags('user-stories')
@Controller('user-stories')
export class UserStoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all user stories' })
  @ApiResponse({ status: 200, description: 'Return all user stories' })
  async findAll(): Promise<UserStory[]> {
    return this.queryBus.execute(new GetAllUserStoriesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user story by id' })
  @ApiResponse({ status: 200, description: 'Return the user story' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async findOne(@Param('id') id: string): Promise<UserStory> {
    return this.queryBus.execute(new GetUserStoryByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user story' })
  @ApiResponse({ status: 201, description: 'User story created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createUserStoryDto: CreateUserStoryDto,
    @Req() req: Request,
  ): Promise<UserStory> {
    const userId = (req.user as JwtPayload).sub;
    return this.commandBus.execute(
      new CreateUserStoryCommand(createUserStoryDto, userId),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user story' })
  @ApiResponse({ status: 200, description: 'User story updated successfully' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserStoryDto: UpdateUserStoryDto,
    @Req() req: Request,
  ): Promise<UserStory> {
    const userId = (req.user as JwtPayload).sub;
    return this.commandBus.execute(
      new UpdateUserStoryCommand(id, updateUserStoryDto, userId),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user story (soft delete)' })
  @ApiResponse({ status: 204, description: 'User story deleted successfully' })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = (req.user as JwtPayload).sub;
    return this.commandBus.execute(new DeleteUserStoryCommand(id, userId));
  }

  @Get(':id/code-repositories')
  @ApiOperation({ summary: 'Get all code repositories linked to a user story' })
  @ApiResponse({
    status: 200,
    description: 'Return all code repositories for the user story',
  })
  @ApiResponse({ status: 404, description: 'User story not found' })
  async getCodeRepositories(
    @Param('id') id: string,
  ): Promise<CodeRepository[]> {
    return this.queryBus.execute(new GetUserStoryCodeRepositoriesQuery(id));
  }
}
