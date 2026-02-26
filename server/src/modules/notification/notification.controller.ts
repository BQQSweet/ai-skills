import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('api/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // TODO: implement notification endpoints
}
