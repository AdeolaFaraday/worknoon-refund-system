import { Controller, Get, Param } from '@nestjs/common';
import { RefundAdminService } from './refund-admin.service';

@Controller('admin/refunds')
export class RefundAdminController {
  constructor(private readonly adminService: RefundAdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }
}
