import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MarketplaceService } from './marketplace.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('categoria') categoria?: string,
    @Query('estado') estado?: string,
    @Query('terreiroId') terreiroId?: string,
    @Query('precoMin') precoMin?: string,
    @Query('precoMax') precoMax?: string,
    @Query('limit') limit = '24',
    @Query('offset') offset = '0',
  ) {
    return this.marketplaceService.listar({
      q,
      categoria,
      estado,
      terreiroId,
      precoMin: precoMin ? parseFloat(precoMin) : undefined,
      precoMax: precoMax ? parseFloat(precoMax) : undefined,
      limit: parseInt(limit) || 24,
      offset: parseInt(offset) || 0,
    });
  }

  @Get('categorias')
  async categorias() {
    return this.marketplaceService.categorias();
  }

  @Get(':id')
  async detalhe(@Param('id') id: string) {
    return this.marketplaceService.detalhe(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async criar(
    @CurrentUser() user: any,
    @Body() dto: { terreiroId: string; nome: string; descricao?: string; preco: number; categoria?: string; estoque?: number; imagens?: string[] },
  ) {
    return this.marketplaceService.criar(user.id, dto.terreiroId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { nome?: string; descricao?: string; preco?: number; categoria?: string; estoque?: number; imagens?: string[] },
  ) {
    return this.marketplaceService.atualizar(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remover(@CurrentUser() user: any, @Param('id') id: string) {
    return this.marketplaceService.remover(user.id, id);
  }
}
