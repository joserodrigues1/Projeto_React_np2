import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { CalculoModule } from '../calculo/calculo.module';

@Module({
  imports: [
    CalculoModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILTRAP_HOST')!,
          port: configService.get<number>('MAILTRAP_PORT')!,
          secure: false,
          auth: {
            user: configService.get<string>('MAILTRAP_USER')!,
            pass: configService.get<string>('MAILTRAP_PASS')!,
          },
        },
        defaults: {
          from: '"Calculadora Tributária" <daf_unichristus@edu.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
