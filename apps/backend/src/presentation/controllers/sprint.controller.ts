import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSprintDto } from '../../application/dtos/create-sprint.dto';
import { UpdateSprintDto } from '../../application/dtos/update-sprint.dto';
import { Sprint } from '../../domain/entities/sprint.entity';
import {
  CreateSprintCommand,
  UpdateSprintCommand,
  DeleteSprintCommand,
} from '../../application/commands/impl/sprint';
import {
  GetAllSprintsQuery,
  GetSprintByIdQuery,
  GetSprintsByProjectQuery,
  GetActiveSprintByProjectQuery,
} from '../../application/queries/impl/sprint';

@ApiTags('sprints')
@Controller('sprints')
export class SprintController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all sprints' })
  @ApiResponse({ status: 200, description: 'Return all sprints' })
  async findAll(): Promise<Sprint[]> {
    return this.queryBus.execute(new GetAllSprintsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sprint by id' })
  @ApiResponse({ status: 200, description: 'Return the sprint' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async findOne(@Param('id') id: string): Promise<Sprint> {
    return this.queryBus.execute(new GetSprintByIdQuery(id));
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all sprints for a project' })
  @ApiResponse({ status: 200, description: 'Return all sprints for the project' })
  async findByProject(@Param('projectId') projectId: string): Promise<Sprint[]> {
    return this.queryBus.execute(new GetSprintsByProjectQuery(projectId));
  }

  @Get('project/:projectId/active')
  @ApiOperation({ summary: 'Get the active sprint for a project' })
  @ApiResponse({ status: 200, description: 'Return the active sprint' })
  async findActiveByProject(@Param('projectId') projectId: string): Promise<Sprint | null> {
    return this.queryBus.execute(new GetActiveSprintByProjectQuery(projectId));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sprint' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  @ApiResponse({ status: 201, description: 'Sprint created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @Headers('x-user-id') userId: string,
  ): Promise<Sprint> {
    return this.commandBus.execute(
      new CreateSprintCommand(createSprintDto, userId),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sprint' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  @ApiResponse({ status: 200, description: 'Sprint updated successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto,
    @Headers('x-user-id') userId: string,
  ): Promise<Sprint> {
    return this.commandBus.execute(
      new UpdateSprintCommand(id, updateSprintDto, userId),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sprint' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  @ApiResponse({ status: 204, description: 'Sprint deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async delete(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteSprintCommand(id, userId));
  }
}
