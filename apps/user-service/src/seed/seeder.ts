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
        id: '6a998bc9-76b9-44a6-8fcd-a6a5b1a877ba',
        firstname: 'John',
        lastname: 'Doe',
        email: 'seller1@example.com',
        country: 'USA',
        password: hashedPassword,
        userRole: 'Seller',
        isTemp: false,
      },
      {
        id: 'a9a1301f-f671-4387-a9ec-048d5d0d983a',
        firstname: 'Alice',
        lastname: 'Johnson',
        email: 'seller2@example.com',
        country: 'Canada',
        password: hashedPassword,
        userRole: 'Seller',
        isTemp: false,
      },
      {
        id: 'a35e40b9-d02d-4b8f-ae6a-63c805fcef95',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'buyer1@example.com',
        country: '',
        password: hashedPassword,
        userRole: 'Buyer',
        isTemp: false,
      },
      {
        id: '1af3d3d6-e616-46e1-8c30-35b32149f328',
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
