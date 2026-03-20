import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NfcTagsService } from './nfc-tags.service';
import { CreateNfcTagDto } from './dto/nfc-tag.dto';

@Controller('nfc-tags')
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNfcTagDto: CreateNfcTagDto) {
    return this.nfcTagsService.create(createNfcTagDto);
  }

  @Get()
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive ? isActive === 'true' : undefined;
    return this.nfcTagsService.findAll(tenantId, active);
  }

  @Get('uid/:uid')
  findByUid(@Param('uid') uid: string) {
    return this.nfcTagsService.findByUid(uid);
  }

  @Get('machine/:machineId')
  findByMachineId(@Param('machineId') machineId: string) {
    return this.nfcTagsService.findByMachineId(machineId);
  }

  @Post(':uid/validate-integrity')
  validateIntegrity(
    @Param('uid') uid: string,
    @Body() body: { checksum: string },
  ) {
    return this.nfcTagsService.validateIntegrity(uid, body.checksum);
  }

  @Post(':uid/lock')
  @HttpCode(HttpStatus.OK)
  lockTag(@Param('uid') uid: string) {
    return this.nfcTagsService.lockTag(uid);
  }

  @Post(':uid/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateTag(@Param('uid') uid: string) {
    return this.nfcTagsService.deactivateTag(uid);
  }
}
