import { extname, join } from 'path';

import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { CreateAdminBagDTO } from '@/modules/adminBag/adminBag.dto';
import AdminBag from '@/modules/adminBag/adminBag.model';
import { S3Utils } from '@/utils/s3.utils';
import { Simulation } from '@/utils/simulation.utils';
import { SystemUtils } from '@/utils/system.utils';

@injectable()
export class AdminBagService {
  constructor(
    private readonly simulation: Simulation,
    private readonly s3Utils: S3Utils,
    private readonly systemUtils: SystemUtils
  ) {}

  async createAdminBag({
    bagBrand,
    bagModel,
    files,
    user,
  }: {
    bagBrand: string;
    bagModel: string;
    files: string[];
    user: JwtPayload;
  }): Promise<CreateAdminBagDTO> {
    const fileInfos: { path: string; mimeType: string; s3Key: string }[] =
      files.map((file) => ({
        path: join(__dirname, '../../../public/temp', file),
        mimeType: extname(file),
        s3Key: `adminBag/${uuidv4()}/${Date.now()}${extname(file)}`,
      }));
    try {
      const priceData = this.simulation.simulateRealisticAIAnalysis();
      const priceStatus = {
        currentValue: priceData.currentValue,
        changePercentage: priceData.changePercentage,
        trend: priceData.trend,
      };
      const urls = await Promise.all(
        fileInfos.map(({ path, mimeType, s3Key }) =>
          this.s3Utils.singleUpload({ filePath: path, mimeType, key: s3Key })
        )
      );
      const newAdminBag = new AdminBag({
        bagBrand,
        bagModel,
        images: urls,
        productionYear: priceData.productionYear,
        priceStatus,
        user: new Types.ObjectId(user._id as string),
      });
      await newAdminBag.save();
      return CreateAdminBagDTO.fromEntity(newAdminBag);
    } catch (error) {
      await Promise.all(
        fileInfos.map(({ s3Key }) => this.s3Utils.singleDelete({ key: s3Key }))
      );
      if (error instanceof Error) throw error;
      throw new Error('Unknown Error Occurred In Admin Bag Creation Service');
    }
  }

  async getAdminBags(): Promise<void> {}
}
