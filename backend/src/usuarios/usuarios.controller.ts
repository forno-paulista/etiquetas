import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { ResetSenhaDto } from './dto/reset-senha.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { UsuarioResponseDto } from './dto/usuario-response.dto.js';
import { UsuariosService } from './usuarios.service.js';

@ApiTags('usuarios')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário (login)' })
  create(@Body() dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.usuariosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os usuários' })
  findAll(): Promise<UsuarioResponseDto[]> {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário por id' })
  findOne(@Param('id') id: string): Promise<UsuarioResponseDto> {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza nome, papel, status ou locais de acesso de um usuário' })
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.usuariosService.update(id, dto);
  }

  @Patch(':id/senha')
  @ApiOperation({ summary: 'Redefine a senha de um usuário (ex.: esqueceu a senha)' })
  resetarSenha(@Param('id') id: string, @Body() dto: ResetSenhaDto): Promise<UsuarioResponseDto> {
    return this.usuariosService.resetarSenha(id, dto);
  }
}
