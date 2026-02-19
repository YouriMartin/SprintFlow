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
import { CreateEpicDto } from '../../application/dtos/create-epic.dto';
import { UpdateEpicDto } from '../../application/dtos/update-epic.dto';
import { Epic } from '../../domain/entities/epic.entity';
import {
  CreateEpicCommand,
  UpdateEpicCommand,
  DeleteEpicCommand,
} from '../../application/commands/impl/epic';
import {
  GetAllEpicsQuery,
  GetEpicByIdQuery,
} from '../../application/queries/impl/epic';
import type { JwtPayload } from '../../infrastructure/auth/jwt.strategy';

@ApiTags('epics')
@Controller('epics')
export class EpicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all epics' })
  @ApiResponse({ status: 200, description: 'Return all epics' })
  async findAll(): Promise<Epic[]> {
    return this.queryBus.execute(new GetAllEpicsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an epic by id' })
  @ApiResponse({ status: 200, description: 'Return the epic' })
  @ApiResponse({ status: 404, description: 'Epic not found' })
  async findOne(@Param('id') id: string): Promise<Epic> {
    return this.queryBus.execute(new GetEpicByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new epic' })
  @ApiResponse({ status: 201, description: 'Epic created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createEpicDto: CreateEpicDto,
    @Req() req: Request,
  ): Promise<Epic> {
    const userId = (req.user as JwtPayload).sub;
    return this.commandBus.execute(new CreateEpicCommand(createEpicDto, userId));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an epic' })
  @ApiResponse({ status: 200, description: 'Epic updated successfully' })
  @ApiResponse({ status: 404, description: 'Epic not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEpicDto: UpdateEpicDto,
    @Req() req: Request,
  ): Promise<Epic> {
    const userId = (req.user as JwtPayload).sub;
    return this.commandBus.execute(
      new UpdateEpicCommand(id, updateEpicDto, userId),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an epic (soft delete)' })
  @ApiResponse({ status: 204, description: 'Epic deleted successfully' })
  @ApiResponse({ status: 404, description: 'Epic not found' })
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = (req.user as JwtPayload).sub;
    return this.commandBus.execute(new DeleteEpicCommand(id, userId));
  }
}
