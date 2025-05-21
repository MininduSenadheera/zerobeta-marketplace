import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { KafkaEventService } from './kafka.service';

@Injectable()
export class KafkaAuthGuard implements CanActivate {
  constructor(
    private readonly kafkaService: KafkaEventService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = await this.kafkaService.validateToken(token);

      if (!user || !user.id) {
        throw new UnauthorizedException('Invalid token');
      }

      request['user'] = user;
      return true;
    } catch {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
