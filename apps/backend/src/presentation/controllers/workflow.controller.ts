import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWorkflowStatusDto } from '../../application/dtos/create-workflow-status.dto';
import { UpdateWorkflowStatusDto } from '../../application/dtos/update-workflow-status.dto';
import { CreateWorkflowTransitionDto } from '../../application/dtos/create-workflow-transition.dto';
import {
  CreateWorkflowStatusCommand,
  UpdateWorkflowStatusCommand,
  DeleteWorkflowStatusCommand,
  CreateWorkflowTransitionCommand,
  DeleteWorkflowTransitionCommand,
  SeedWorkflowCommand,
} from '../../application/commands/impl/workflow';
import { GetWorkflowQuery } from '../../application/queries/impl/workflow';
import type { Workflow, WorkflowStatus, WorkflowTransition } from '../../domain/entities/workflow-status.entity';

@ApiTags('workflow')
@Controller('projects/:projectId/workflow')
export class WorkflowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the workflow (statuses + transitions) for a project' })
  @ApiResponse({ status: 200, description: 'Returns the full workflow' })
  async getWorkflow(@Param('projectId') projectId: string): Promise<Workflow> {
    return this.queryBus.execute(new GetWorkflowQuery(projectId));
  }

  @Post('statuses')
  @ApiOperation({ summary: 'Create a new workflow status for a project' })
  @ApiResponse({ status: 201, description: 'Status created successfully' })
  async createStatus(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowStatusDto,
  ): Promise<WorkflowStatus> {
    return this.commandBus.execute(
      new CreateWorkflowStatusCommand(projectId, dto),
    );
  }

  @Patch('statuses/:id')
  @ApiOperation({ summary: 'Update a workflow status (including position)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowStatusDto,
  ): Promise<WorkflowStatus> {
    return this.commandBus.execute(new UpdateWorkflowStatusCommand(id, dto));
  }

  @Delete('statuses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a workflow status' })
  @ApiResponse({ status: 204, description: 'Status deleted successfully' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  async deleteStatus(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteWorkflowStatusCommand(id));
  }

  @Post('transitions')
  @ApiOperation({ summary: 'Create an allowed workflow transition' })
  @ApiResponse({ status: 201, description: 'Transition created successfully' })
  async createTransition(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowTransitionDto,
  ): Promise<WorkflowTransition> {
    return this.commandBus.execute(
      new CreateWorkflowTransitionCommand(projectId, dto),
    );
  }

  @Delete('transitions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a workflow transition' })
  @ApiResponse({ status: 204, description: 'Transition deleted successfully' })
  async deleteTransition(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteWorkflowTransitionCommand(id));
  }

  @Post('seed')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Seed the default workflow for a project (dev/admin)' })
  @ApiResponse({ status: 204, description: 'Workflow seeded successfully' })
  async seedWorkflow(@Param('projectId') projectId: string): Promise<void> {
    return this.commandBus.execute(new SeedWorkflowCommand(projectId));
  }
}
