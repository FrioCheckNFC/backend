import { IsUUID, IsString, IsNumber } from 'class-validator';

export class VisitActionDto {
  @IsUUID()
  machineId: string;

  @IsString()
  nfcUid: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
