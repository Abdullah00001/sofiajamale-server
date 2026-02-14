import { Request, Response, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { DashboardService } from '@/modules/dashboard/dashboard.services';

@injectable()
export class DashboardController extends BaseController {
  public adminDashboardStat: RequestHandler;

  constructor(private readonly dashboardService: DashboardService) {
    super();
    this.adminDashboardStat = this.wrap(this._adminDashboardStat);
  }

  private async _adminDashboardStat(
    req: Request,
    res: Response
  ): Promise<void> {
    const data=await this.dashboardService.adminDashboardStat()
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Admin Dashboard Stat Retrieve Successful',
      data
    });
    return;
  }
}
