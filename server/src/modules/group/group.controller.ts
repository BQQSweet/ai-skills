import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';

@ApiTags('group')
@Controller('api/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // TODO: implement group endpoints
}
