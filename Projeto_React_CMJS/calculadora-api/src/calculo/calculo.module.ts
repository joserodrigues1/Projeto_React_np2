import { Module } from '@nestjs/common';
import { CalculoService } from './calculo.service';
import { CalculoController } from './calculo.controller';

@Module({
  controllers: [CalculoController],
  providers: [CalculoService],
  exports: [CalculoService],
})
export class CalculoModule {}
