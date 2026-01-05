import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IEpicRepository } from '../../domain/repositories/epic.repository.interface';
import { EPIC_REPOSITORY } from '../../domain/repositories/epic.repository.interface';
import { Epic } from '../../domain/entities/epic.entity';
import { CreateEpicDto } from '../dtos/create-epic.dto';
import { UpdateEpicDto } from '../dtos/update-epic.dto';

@Injectable()
export class EpicUseCases {
  constructor(
    @Inject(EPIC_REPOSITORY)
    private readonly epicRepository: IEpicRepository,
  ) {}

  async getAllEpics(): Promise<Epic[]> {
    return this.epicRepository.findAll();
  }

  async getEpicById(id: string): Promise<Epic> {
    const epic = await this.epicRepository.findById(id);
    if (!epic) {
      throw new NotFoundException(`Epic with ID ${id} not found`);
    }
    return epic;
  }

  async createEpic(createEpicDto: CreateEpicDto): Promise<Epic> {
    return this.epicRepository.create({
      title: createEpicDto.title,
      description: createEpicDto.description ?? null,
      status: createEpicDto.status!,
      startDate: createEpicDto.startDate,
      endDate: createEpicDto.endDate,
    });
  }

  async updateEpic(id: string, updateEpicDto: UpdateEpicDto): Promise<Epic> {
    const epic = await this.epicRepository.findById(id);
    if (!epic) {
      throw new NotFoundException(`Epic with ID ${id} not found`);
    }

    const updateData: Partial<Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>> =
      {};
    if (updateEpicDto.title !== undefined)
      updateData.title = updateEpicDto.title;
    if (updateEpicDto.description !== undefined)
      updateData.description = updateEpicDto.description ?? null;
    if (updateEpicDto.status !== undefined)
      updateData.status = updateEpicDto.status;
    if (updateEpicDto.startDate !== undefined)
      updateData.startDate = updateEpicDto.startDate;
    if (updateEpicDto.endDate !== undefined)
      updateData.endDate = updateEpicDto.endDate;

    const updated = await this.epicRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Epic with ID ${id} not found after update`);
    }
    return updated;
  }

  async deleteEpic(id: string): Promise<void> {
    const epic = await this.epicRepository.findById(id);
    if (!epic) {
      throw new NotFoundException(`Epic with ID ${id} not found`);
    }
    await this.epicRepository.delete(id);
  }
}
