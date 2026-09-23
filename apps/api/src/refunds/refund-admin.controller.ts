import { Controller, Get, Param, Query } from '@nestjs/common';
import { RefundAdminService } from './refund-admin.service';

@Controller('admin/refunds')
export class RefundAdminController {
  constructor(private readonly adminService: RefundAdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }
}
