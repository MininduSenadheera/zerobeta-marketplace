import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateTempUserDto } from './dto/create-temp-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('')
export class UserController {
  constructor(private service: UserService) { }

  @MessagePattern('user.get.bulk')
  async getBulkUsers(@Payload() userIds: string[]) {
    return await this.service.getBulkUsers(userIds);
  }

  @MessagePattern('user.create.temp')
  async createTempUser(@Payload() body: CreateTempUserDto) {
    return await this.service.createTempUser(body);
  }

  @MessagePattern('user.validate.token')
  validateTokenKafka(@Payload() token: string) {
    return this.service.validateToken(token);
  }

  @Post('register')
  create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.service.login(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('validate-token')
  validateToken(@Req() req: { user: { id: string, firstname: string, lastname: string, country: string, email: string, userRole: string } }) {
    return req.user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
