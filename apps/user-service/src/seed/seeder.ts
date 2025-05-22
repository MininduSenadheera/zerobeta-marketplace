import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async onApplicationBootstrap() {
    const count = await this.userRepository.count();
    if (count > 0) return;

    const plainPassword = 'Test1234';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const users = [
      {
        firstname: 'John',
        lastname: 'Doe',
        email: 'seller1@example.com',
        country: 'USA',
        password: hashedPassword,
        userRole: 'Seller',
        isTemp: false,
      },
      {
        firstname: 'Alice',
        lastname: 'Johnson',
        email: 'seller2@example.com',
        country: 'Canada',
        password: hashedPassword,
        userRole: 'Seller',
        isTemp: false,
      },
      {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'buyer1@example.com',
        country: '',
        password: hashedPassword,
        userRole: 'Buyer',
        isTemp: false,
      },
      {
        firstname: 'Bob',
        lastname: 'Brown',
        email: 'buyer2@example.com',
        country: '',
        password: hashedPassword,
        userRole: 'Buyer',
        isTemp: false,
      },
    ];

    await this.userRepository.save(users);
    console.log('Seeded initial users.');
  }
}
