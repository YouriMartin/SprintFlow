import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CodeRepositoryUseCases } from '../../application/use-cases/code-repository.use-cases';
import { CreateCodeRepositoryDto } from '../../application/dtos/create-code-repository.dto';
import { UpdateCodeRepositoryDto } from '../../application/dtos/update-code-repository.dto';
import { CodeRepository } from '../../domain/entities/code-repository.entity';

@ApiTags('code-repositories')
@Controller('code-repositories')
export class CodeRepositoryController {
  constructor(private readonly codeRepositoryUseCases: CodeRepositoryUseCases) {}

  @Get()
  @ApiOperation({ summary: 'Get all code repositories' })
  @ApiResponse({ status: 200, description: 'Return all code repositories' })
  async findAll(): Promise<CodeRepository[]> {
    return this.codeRepositoryUseCases.getAllCodeRepositories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a code repository by id' })
  @ApiResponse({ status: 200, description: 'Return the code repository' })
  @ApiResponse({ status: 404, description: 'Code repository not found' })
  async findOne(@Param('id') id: string): Promise<CodeRepository> {
    return this.codeRepositoryUseCases.getCodeRepositoryById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new code repository' })
  @ApiResponse({ status: 201, description: 'Code repository created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createCodeRepositoryDto: CreateCodeRepositoryDto): Promise<CodeRepository> {
    return this.codeRepositoryUseCases.createCodeRepository(createCodeRepositoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a code repository' })
  @ApiResponse({ status: 200, description: 'Code repository updated successfully' })
  @ApiResponse({ status: 404, description: 'Code repository not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCodeRepositoryDto: UpdateCodeRepositoryDto,
  ): Promise<CodeRepository> {
    return this.codeRepositoryUseCases.updateCodeRepository(id, updateCodeRepositoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a code repository' })
  @ApiResponse({ status: 204, description: 'Code repository deleted successfully' })
  @ApiResponse({ status: 404, description: 'Code repository not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.codeRepositoryUseCases.deleteCodeRepository(id);
  }

  @Post(':codeRepositoryId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Link a task to a code repository' })
  @ApiResponse({ status: 204, description: 'Task linked successfully' })
  @ApiResponse({ status: 404, description: 'Code repository or task not found' })
  async linkTask(
    @Param('codeRepositoryId') codeRepositoryId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    return this.codeRepositoryUseCases.linkTaskToCodeRepository(taskId, codeRepositoryId);
  }

  @Delete(':codeRepositoryId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a task from a code repository' })
  @ApiResponse({ status: 204, description: 'Task unlinked successfully' })
  async unlinkTask(
    @Param('codeRepositoryId') codeRepositoryId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    return this.codeRepositoryUseCases.unlinkTaskFromCodeRepository(taskId, codeRepositoryId);
  }
}
