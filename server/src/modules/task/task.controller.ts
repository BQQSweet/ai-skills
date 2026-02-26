import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';

@ApiTags('task')
@Controller('api/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // TODO: implement task endpoints
}
