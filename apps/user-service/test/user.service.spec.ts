import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { CreateTempUserDto } from 'src/dto/create-temp-user.dto';
import { LoginDto } from 'src/dto/login.dto';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;
  let jwtService: JwtService;

  const jwtMock = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [
        UserService,
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a new user and return a token', async () => {
      const dto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'pass123',
        country: 'US',
        userRole: 'buyer',
      };

      const result = await service.create(dto);

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw error if email already exists (non-temp)', async () => {
      const dto: CreateUserDto = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        password: 'pass123',
        country: 'UK',
        userRole: 'seller',
      };

      await service.create(dto);

      await expect(service.create(dto)).rejects.toThrow('Email already registered');
    });

    it('should upgrade a temp user to full user', async () => {
      const tempDto: CreateTempUserDto = {
        firstname: 'Temp',
        lastname: 'User',
        email: 'temp@example.com',
      };

      await service.createTempUser(tempDto);

      const upgradeDto: CreateUserDto = {
        ...tempDto,
        country: 'FR',
        userRole: 'buyer',
        password: 'pass123',
      };

      const result = await service.create(upgradeDto);
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('temp@example.com');
    });
  });

  describe('login()', () => {
    it('should login a valid user and return token', async () => {
      const dto: CreateUserDto = {
        firstname: 'Login',
        lastname: 'User',
        email: 'login@example.com',
        password: 'pass123',
        country: 'DE',
        userRole: 'buyer',
      };

      await service.create(dto);

      const loginDto: LoginDto = {
        email: dto.email,
        password: dto.password,
      };

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'pass123',
      };

      await expect(service.login(loginDto)).rejects.toThrow('User not found');
    });

    it('should throw if user is temp', async () => {
      const tempDto: CreateTempUserDto = {
        firstname: 'Temp',
        lastname: 'Only',
        email: 'temp-login@example.com',
      };

      await service.createTempUser(tempDto);

      const loginDto: LoginDto = {
        email: tempDto.email,
        password: 'irrelevant',
      };

      await expect(service.login(loginDto)).rejects.toThrow('Please complete your registration');
    });

    it('should throw if password is incorrect', async () => {
      const dto: CreateUserDto = {
        firstname: 'Wrong',
        lastname: 'Password',
        email: 'wrongpass@example.com',
        password: 'correctpass',
        country: 'US',
        userRole: 'seller',
      };

      await service.create(dto);

      const loginDto: LoginDto = {
        email: dto.email,
        password: 'wrongpass',
      };

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('findById()', () => {
    it('should return a user by ID', async () => {
      const dto: CreateUserDto = {
        firstname: 'Find',
        lastname: 'Me',
        email: 'findme@example.com',
        password: 'pass123',
        country: 'FR',
        userRole: 'buyer',
      };

      const { user } = await service.create(dto);

      const found = await service.findById(user.id);

      expect(found.email).toBe('findme@example.com');
    });

    it('should throw if user not found', async () => {
      await expect(service.findById('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('getBulkUsers()', () => {
    it('should return users for given IDs', async () => {
      const dto1 = await service.create({
        firstname: 'Bulk',
        lastname: 'One',
        email: 'bulk1@example.com',
        password: '123',
        country: 'US',
        userRole: 'buyer',
      });

      const dto2 = await service.create({
        firstname: 'Bulk',
        lastname: 'Two',
        email: 'bulk2@example.com',
        password: '123',
        country: 'US',
        userRole: 'buyer',
      });

      const users = await service.getBulkUsers([dto1.user.id, dto2.user.id]);

      expect(users.length).toBe(2);
    });

    it('should throw if no users found', async () => {
      await expect(service.getBulkUsers(['invalid-id'])).rejects.toThrow('Users not found');
    });
  });

  describe('createTempUser()', () => {
    it('should return ID if temp user already exists', async () => {
      const dto: CreateTempUserDto = {
        firstname: 'Repeat',
        lastname: 'Temp',
        email: 'repeat@example.com'
      };

      const firstId = await service.createTempUser(dto);
      const secondId = await service.createTempUser(dto);

      expect(firstId).toBe(secondId);
    });

    it('should create a new temp user and return ID', async () => {
      const dto: CreateTempUserDto = {
        firstname: 'New',
        lastname: 'Temp',
        email: 'newtemp@example.com'
      };

      const id = await service.createTempUser(dto);

      expect(typeof id).toBe('string');
    });
  });
});
