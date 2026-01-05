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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EpicUseCases } from '../../application/use-cases/epic.use-cases';
import { CreateEpicDto } from '../../application/dtos/create-epic.dto';
import { UpdateEpicDto } from '../../application/dtos/update-epic.dto';
import { Epic } from '../../domain/entities/epic.entity';

@ApiTags('epics')
@Controller('epics')
export class EpicController {
  constructor(private readonly epicUseCases: EpicUseCases) {}

  @Get()
  @ApiOperation({ summary: 'Get all epics' })
  @ApiResponse({ status: 200, description: 'Return all epics' })
  async findAll(): Promise<Epic[]> {
    return this.epicUseCases.getAllEpics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an epic by id' })
  @ApiResponse({ status: 200, description: 'Return the epic' })
  @ApiResponse({ status: 404, description: 'Epic not found' })
  async findOne(@Param('id') id: string): Promise<Epic> {
    return this.epicUseCases.getEpicById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new epic' })
  @ApiResponse({ status: 201, description: 'Epic created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createEpicDto: CreateEpicDto): Promise<Epic> {
    return this.epicUseCases.createEpic(createEpicDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an epic' })
  @ApiResponse({ status: 200, description: 'Epic updated successfully' })
  @ApiResponse({ status: 404, description: 'Epic not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEpicDto: UpdateEpicDto,
  ): Promise<Epic> {
    return this.epicUseCases.updateEpic(id, updateEpicDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an epic' })
  @ApiResponse({ status: 204, description: 'Epic deleted successfully' })
  @ApiResponse({ status: 404, description: 'Epic not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.epicUseCases.deleteEpic(id);
  }
}
