import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsUrl, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

const ORGANIZATION_TYPES = [
  'FEDERACAO', 'CONFEDERACAO', 'ASSOCIACAO', 'INSTITUTO', 'UNIVERSIDADE',
  'MUSEU', 'CENTRO_CULTURAL', 'PROJETO_SOCIAL', 'DEFESA_LIBERDADE_RELIGIOSA',
  'PARCEIRO', 'COMUNIDADE', 'PESQUISADOR', 'GRUPO_DE_PESQUISA', 'TEMPLO',
  'ORGANIZACAO_INTERNACIONAL',
] as const;

type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export class CreateOrganizacaoDto {
  @IsString()
  @MaxLength(200)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nomePublico?: string;

  @IsEnum(ORGANIZATION_TYPES as unknown as string[])
  tipo!: OrganizationType;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  pais?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  historia?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tradicoes?: string[];

  @IsOptional()
  @IsString()
  taxonomyCategory?: string;

  @IsOptional()
  @IsNumber()
  anoFundacao?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  areaAtuacao?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  contatos?: Record<string, unknown>;
}
