import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [
    ConfigModule,

    AuthModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>('jwtSecret'),
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
})
export class MessagesModule {}
