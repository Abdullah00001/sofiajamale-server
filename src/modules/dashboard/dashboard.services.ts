import { injectable } from 'tsyringe';

import User from '@/modules/auth/auth.model';
import { TDashboardStats } from '@/modules/dashboard/dashboard.types';
import UserCollection from '@/modules/userBag/userBag.model';

@injectable()
export class DashboardService {
  async adminDashboardStat(): Promise<TDashboardStats> {
    try {
      const [totalUsers, totalBags, bagStats, userActivity, topBrands] =
        await Promise.all([
          // 1. Total Users
          User.countDocuments({}),

          // 2. Total Bags
          UserCollection.countDocuments({}),

          // 3. Total Cost & Current Value
          UserCollection.aggregate([
            {
              $group: {
                _id: null,
                totalCost: { $sum: '$purchasePrice' },
                currentValue: { $sum: '$priceStatus.currentValue' },
              },
            },
          ]),

          // 4. User Activity (last 12 months)
          User.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(
                    new Date().setMonth(new Date().getMonth() - 12)
                  ),
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1 },
            },
            {
              $project: {
                _id: 0,
                month: '$_id.month',
                year: '$_id.year',
                count: 1,
              },
            },
          ]),

          // 5. Top Brands (Top 4 as shown in your UI)
          UserCollection.aggregate([
            {
              $lookup: {
                from: 'brands',
                localField: 'brandId',
                foreignField: '_id',
                as: 'brand',
              },
            },
            {
              $unwind: '$brand',
            },
            {
              $group: {
                _id: '$brandId',
                brandName: { $first: '$brand.brandName' },
                brandLogo: { $first: '$brand.brandLogo' },
                totalBags: { $sum: 1 },
                bagCost: { $sum: '$purchasePrice' },
                currentValue: { $sum: '$priceStatus.currentPrice' },
              },
            },
            {
              $addFields: {
                percentageChange: {
                  $cond: {
                    if: { $eq: ['$bagCost', 0] },
                    then: 0,
                    else: {
                      $multiply: [
                        {
                          $divide: [
                            { $subtract: ['$currentValue', '$bagCost'] },
                            '$bagCost',
                          ],
                        },
                        100,
                      ],
                    },
                  },
                },
              },
            },
            {
              $sort: { totalBags: -1 },
            },
            {
              $limit: 4,
            },
            {
              $project: {
                _id: 1,
                brandName: 1,
                brandLogo: 1,
                totalBags: 1,
                bagCost: 1,
                currentValue: 1,
                percentageChange: { $round: ['$percentageChange', 2] },
              },
            },
          ]),
        ]);

      const stats = bagStats[0] || { totalCost: 0, currentValue: 0 };

      return {
        success: true,
        data: {
          totalUsers,
          totalBags,
          totalCost: stats.totalCost,
          currentValue: stats.currentValue,
          userActivity,
          topBrands,
        },
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'Unknown Error Occurred In Retrieve Admin Dashboard Stat Service'
      );
    }
  }
}
