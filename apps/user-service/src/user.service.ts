import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTempUserDto } from './dto/create-temp-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  private hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  private buildToken(user: User) {
    const payload = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      country: user.country,
      email: user.email,
      userRole: user.userRole,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    return access_token;
  }

  async create(user: CreateUserDto) {
    const existingUser = await this.repo.findOne({ where: { email: user.email } });

    if (existingUser && !existingUser.isTemp) {
      throw new BadRequestException('Email already registered');
    }

    if (existingUser?.isTemp) {
      return this.handleTempUserUpgrade(existingUser, user);
    }

    return this.createNewUser(user);
  }

  private async handleTempUserUpgrade(existingUser: User, userDto: CreateUserDto) {
    await this.repo.update(existingUser.id, {
      ...userDto,
      password: await this.hash(userDto.password),
      isTemp: false,
    });

    const updatedUser = await this.repo.findOneBy({ id: existingUser.id });
    if (!updatedUser) throw new NotFoundException('User not found');
    return this.buildToken(updatedUser);
  }

  private async createNewUser(userDto: CreateUserDto) {
    const newUser = this.repo.create({
      ...userDto,
      password: await this.hash(userDto.password),
    });
    const savedUser = await this.repo.save(newUser);
    return this.buildToken(savedUser);
  }

  async validateCredentials(dto: LoginDto) {
    const user = await this.repo.findOne({ where: { email: dto.email } });

    if (!user) throw new NotFoundException('User not found');
    if (user.isTemp) throw new BadRequestException('Please complete your registration');

    const isValid = await this.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return this.buildToken(user);
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getBulkUsers(userIds: string[]) {
    const users = await this.repo.find({ where: { id: In(userIds) } });
    if (!users || users.length === 0) throw new NotFoundException('Users not found');
    return users;
  }

  async createTempUser(dto: CreateTempUserDto) {
    const checkUser = await this.repo.findOne({ where: { email: dto.email } });

    if (checkUser) {
      return checkUser.id;
    }

    const user = this.repo.create({
      ...dto,
      isTemp: true,
    });

    const newUser = await this.repo.save(user);
    return newUser.id;
  }

}
