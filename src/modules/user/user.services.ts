import { Schema } from 'mongoose';
import { injectable } from 'tsyringe';

import User from '@/modules/auth/auth.model';
import { AccountStatus, IUser } from '@/modules/auth/auth.types';
import {
  GetSingleUserResponseDTO,
  GetUsersResponseDTO,
} from '@/modules/user/user.dto';
import {
  PipelineStage,
  TGetUsersResponse,
  TUserActions,
} from '@/modules/user/user.types';
import { Role } from '@/types/jwt.types';

@injectable()
export class UserService {
  async getUsers({
    params,
  }: {
    params: {
      page: string | null;
      limit: string | null;
      sortBy: '1' | '-1' | null;
    };
  }): Promise<TGetUsersResponse> {
    try {
      const page = parseInt(params.page || '1', 10);
      const limit = parseInt(params.limit || '10', 10);
      const skip = (page - 1) * limit;
      const pipeline: PipelineStage[] = [];

      if (params.sortBy) {
        const sortOrder = params.sortBy === '-1' ? -1 : 1;
        pipeline.push({ $sort: { createdAt: sortOrder } });
      }

      pipeline.push({ $skip: skip }, { $limit: limit });
      const [result] = await User.aggregate([
        { $match: { role: Role.USER } },
        {
          $facet: {
            data: pipeline,
            total: [{ $count: 'count' }],
          },
        },
      ]);
      const data: GetUsersResponseDTO[] = result.data.map((item: IUser) =>
        GetUsersResponseDTO.fromEntity(item)
      );
      const total = result.total[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      // Calculate showing range
      const from = total === 0 ? 0 : skip + 1;
      const to = Math.min(skip + limit, total);
      const showing = `Showing ${from} to ${to} of ${total} results`;
      const basePath = '/admin/users';
      const actions: TUserActions = {
        changeAccountStatus: {
          href: `${basePath}/:id`,
          method: 'PATCH',
        },
        getOne: {
          href: `${basePath}/:id`,
          method: 'GET',
        },
      };

      // If no data, return null for links
      if (data.length === 0) {
        return {
          data,
          meta: {
            total,
            page,
            limit,
            totalPages,
            links: null,
            actions,
            showing,
          },
        };
      }

      // Helper function to build links
      const buildLink = (pageNum: number): string => {
        const query = new URLSearchParams();
        query.set('page', pageNum.toString());
        query.set('limit', limit.toString());
        if (params.sortBy) {
          query.set('sortBy', params.sortBy);
        }
        return `${basePath}?${query.toString()}`;
      };

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          links: {
            first: buildLink(1),
            last: buildLink(totalPages),
            previous: page > 1 ? buildLink(page - 1) : null,
            next: page < totalPages ? buildLink(page + 1) : null,
            current: buildLink(page),
          },
          actions,
          showing,
        },
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred in get users service');
    }
  }

  async changeUserAccountStatus({
    accountStatus,
    userId,
  }: {
    accountStatus: AccountStatus;
    userId: Schema.Types.ObjectId;
  }): Promise<GetSingleUserResponseDTO> {
    try {
      const data = await User.findByIdAndUpdate(
        userId,
        { $set: { accountStatus } },
        { new: true }
      );
      if (!data)
        throw new Error(
          'Unknown error occurred in change user account status service'
        );
      return GetSingleUserResponseDTO.fromEntity(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'Unknown error occurred in change user account status service'
      );
    }
  }
}
