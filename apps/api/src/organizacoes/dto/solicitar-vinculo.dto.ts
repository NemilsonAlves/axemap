import { IsUUID } from 'class-validator';

export class SolicitarVinculoDto {
  @IsUUID()
  terreiroId!: string;
}
