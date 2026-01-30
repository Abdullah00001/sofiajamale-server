import { generate } from 'otp-generator';
import { injectable } from 'tsyringe';

import { getRedisClient } from '@/configs/redis.config';
import { otpExpireAt } from '@/const';
import { CreateUserResponseDTO } from '@/modules/auth/auth.dto';
import User from '@/modules/auth/auth.model';
import { TSignupPayload } from '@/modules/auth/auth.schemas';
import { TVerifyOtp } from '@/modules/auth/auth.types';
import { EmailQueue } from '@/queue/queues/email.queue';
import { TSignupUserVerifyOtpEmailData } from '@/types/emailQueue.types';
import { JwtUtils } from '@/utils/jwt.utils';
import { OtpUtils } from '@/utils/otp.utils';
import { PasswordUtils } from '@/utils/password.utils';
import { SystemUtils } from '@/utils/system.utils';

@injectable()
export class AuthService {
  constructor(
    private readonly passwordUtils: PasswordUtils,
    private readonly otpUtils: OtpUtils,
    private readonly emailQueue: EmailQueue,
    private readonly systemUtils: SystemUtils,
    private readonly jwtUtils: JwtUtils
  ) {}
  async createUser(
    payload: TSignupPayload
  ): Promise<{ data: CreateUserResponseDTO; jwtToken: string }> {
    try {
      const otp = generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
      });
      // hash plain otp and password
      const hashOtp = this.otpUtils.hashOtp({ otp });
      const hashPass = await this.passwordUtils.hashPassword(payload.password);
      // create a new user
      const user = new User({ ...payload, password: hashPass });
      // generate jwt token for otp page
      const jwtToken = this.jwtUtils.generateOtpPageToken({
        sub: String(user._id),
        role: user.role,
        isVerified: user.isVerified,
        accountStatus: user.accountStatus,
      });
      // trim unwanted fields
      const data = CreateUserResponseDTO.fromEntity(user);
      // email queue data
      const emailData: TSignupUserVerifyOtpEmailData = {
        email: payload.email,
        expirationTime: otpExpireAt,
        name: payload.name,
        otp,
      };
      // save the user to database
      await user.save();
      // get the redis client
      const redisClient = getRedisClient();
      const ttl = this.systemUtils.calculateMilliseconds(otpExpireAt, 'minute');
      await Promise.all([
        redisClient.set(`user:${user._id}:otp`, hashOtp, 'PX', ttl),
        this.emailQueue.sendSignupVerificationOtpEmail(emailData),
      ]);
      return { data, jwtToken };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred in create user service');
    }
  }

  async verifyOtp({ user }: TVerifyOtp): Promise<{ accessToken: string }> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        user.sub,
        { $set: { isVerified: true } },
        { new: true }
      );
      if (!updatedUser) throw new Error('User not found');
      const accessToken = this.jwtUtils.generateAccessTokenForUser({
        accountStatus: updatedUser?.accountStatus,
        isVerified: updatedUser?.isVerified,
        role: updatedUser?.role,
        sub: String(updatedUser?._id),
      });
      const redisClient = getRedisClient();
      await redisClient.del(`user:${updatedUser._id}:otp`);
      return { accessToken };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred in verify otp service');
    }
  }

  async resendOtp({ user }: TVerifyOtp): Promise<void> {
    try {
      const otp = generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
      });
      // hash plain otp and password
      const hashOtp = this.otpUtils.hashOtp({ otp });
      const foundedUser = await User.findById(user.sub);
      if (!foundedUser) throw new Error('User not found');
      const emailData: TSignupUserVerifyOtpEmailData = {
        email: foundedUser?.email,
        expirationTime: otpExpireAt,
        name: foundedUser?.name,
        otp,
      };
      const redisClient = getRedisClient();
      const ttl = this.systemUtils.calculateMilliseconds(otpExpireAt, 'minute');
      await redisClient.del(`user:${foundedUser?._id}:otp`);
      await Promise.all([
        redisClient.set(`user:${foundedUser?._id}:otp`, hashOtp, 'PX', ttl),
        this.emailQueue.sendSignupVerificationOtpEmail(emailData),
      ]);
      return;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred in resend otp service');
    }
  }
}
