import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, AccessCode, Session } from '../database/entities';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ActivateDto } from './dto/activate.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AccessCode)
    private accessCodeRepository: Repository<AccessCode>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, phone, password, confirmPassword } = signupDto;

    if (password !== confirmPassword) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Passwords do not match',
      });
    }

    const existingUser = await this.userRepository.findOne({ where: { phone } });
    if (existingUser) {
      throw new ConflictException({
        error: 'USER_ALREADY_EXISTS',
        message: 'User with this phone number already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      phone,
      passwordHash,
      role: 'user',
      active: false,
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User registered successfully. Please activate your account with an access code.',
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        active: user.active,
      },
    };
  }

  async activate(userId: string, activateDto: ActivateDto) {
    const { accessCode } = activateDto;
    const codeUpper = accessCode.toUpperCase();

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    if (user.active) {
      throw new BadRequestException({
        error: 'ALREADY_ACTIVATED',
        message: 'Account is already activated',
      });
    }

    const code = await this.accessCodeRepository.findOne({
      where: { code: codeUpper },
    });

    if (!code) {
      throw new BadRequestException({
        error: 'INVALID_ACCESS_CODE',
        message: 'Invalid access code',
      });
    }

    const now = new Date();
    if (now < code.validFrom || now > code.validUntil) {
      throw new BadRequestException({
        error: 'EXPIRED_CODE',
        message: 'Access code has expired',
      });
    }

    if (code.usesCount >= code.usesAllowed) {
      throw new BadRequestException({
        error: 'CODE_USAGE_LIMIT_REACHED',
        message: 'Access code usage limit reached',
      });
    }

    user.active = true;
    user.role = code.role;
    await this.userRepository.save(user);

    code.usesCount += 1;
    if (code.usesCount >= code.usesAllowed) {
      code.isUsed = true;
    }
    await this.accessCodeRepository.save(code);

    return {
      success: true,
      message: 'Account activated successfully',
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        active: user.active,
      },
    };
  }

  async activateWithCredentials(activateDto: ActivateDto) {
    const { phone, password, accessCode } = activateDto;
    
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid phone number or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid phone number or password',
      });
    }

    if (user.active) {
      throw new BadRequestException({
        error: 'ALREADY_ACTIVATED',
        message: 'Account is already activated',
      });
    }

    const codeUpper = accessCode.toUpperCase();
    const code = await this.accessCodeRepository.findOne({
      where: { code: codeUpper },
    });

    if (!code) {
      throw new BadRequestException({
        error: 'INVALID_ACCESS_CODE',
        message: 'Invalid access code',
      });
    }

    const now = new Date();
    if (now < code.validFrom || now > code.validUntil) {
      throw new BadRequestException({
        error: 'EXPIRED_CODE',
        message: 'Access code has expired',
      });
    }

    if (code.usesCount >= code.usesAllowed) {
      throw new BadRequestException({
        error: 'CODE_USAGE_LIMIT_REACHED',
        message: 'Access code usage limit reached',
      });
    }

    user.active = true;
    user.role = code.role;
    await this.userRepository.save(user);

    code.usesCount += 1;
    if (code.usesCount >= code.usesAllowed) {
      code.isUsed = true;
    }
    await this.accessCodeRepository.save(code);

    return {
      success: true,
      message: 'Account activated successfully',
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        active: user.active,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid phone number or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid phone number or password',
      });
    }

    if (!user.active) {
      throw new UnauthorizedException({
        error: 'ACCOUNT_NOT_ACTIVATED',
        message: 'Please activate your account with an access code',
      });
    }

    const tokens = await this.generateTokens(user);
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          active: user.active,
        },
        ...tokens,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.active) {
        throw new UnauthorizedException({
          error: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        });
      }

      const tokens = await this.generateTokens(user);
      return {
        success: true,
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  async logout(userId: string, token: string) {
    await this.sessionRepository.delete({ userId, token });
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        active: user.active,
        salaryRange: user.salaryRange,
        interestedCategories: user.interestedCategories,
        createdAt: user.createdAt,
      },
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRY')}s`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRY')}s`,
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(this.configService.get('JWT_REFRESH_EXPIRY')));

    await this.sessionRepository.save({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(this.configService.get('JWT_ACCESS_EXPIRY')),
    };
  }
}
