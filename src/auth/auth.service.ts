import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDTO, LoginUserDTO } from './dto';
import { User } from './entities/user.entity';
import { JWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDTO: CreateUserDTO) {
    try {
      const { password, ...userData } = createUserDTO;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      delete user.password; // temporary solution

      return { ...user, token: this.getJWT({ id: user.id }) };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: string): Promise<User> {
    const user = this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }

    return user;
  }

  async login(loginUserDTO: LoginUserDTO) {
    const { password, email } = loginUserDTO;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return { ...user, token: this.getJWT({ id: user.id }) };
  }

  checkAuthStatus(user: User) {
    const newJWT = this.getJWT({ id: user.id });

    return {
      id: user.id,
      email: user.email,
      token: newJWT,
    };
  }

  private getJWT(payload: JWTPayload): string {
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBExceptions(error: any): never {
    if (error.code == '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
