import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateTempUserDto } from './dto/create-temp-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private service: UserService) { }

  @EventPattern('user.get.bulk')
  getBulkUsers(@Payload() userIds: string[]) {
    return this.service.getBulkUsers(userIds);
  }

  @EventPattern('user.create.temp')
  createTempUser(@Payload() body: CreateTempUserDto) {
    return this.service.createTempUser(body);
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
  @Post('validate-token')
  validateToken(@Req() req) {
    return req.user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
