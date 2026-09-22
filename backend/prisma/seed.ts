import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PapelUsuario, PrismaClient, TipoLocal } from '@prisma/client';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const organizacao = await prisma.organizacao.upsert({
    where: { id: 'org-principal' },
    update: {},
    create: { id: 'org-principal', nome: 'Rede de Pizzarias' },
  });

  const cd = await prisma.local.upsert({
    where: { id: 'local-cd' },
    update: {},
    create: {
      id: 'local-cd',
      organizacaoId: organizacao.id,
      nome: 'Centro de Distribuição',
      tipo: TipoLocal.CD,
    },
  });

  const emailAdmin = process.env.SEED_ADMIN_EMAIL ?? 'admin@etiquetas.local';
  const senhaAdmin = process.env.SEED_ADMIN_SENHA ?? 'trocar-esta-senha';

  const senhaHash = await argon2.hash(senhaAdmin);

  const admin = await prisma.usuario.upsert({
    where: { email: emailAdmin },
    update: {},
    create: {
      email: emailAdmin,
      nome: 'Administrador',
      senhaHash,
      papel: PapelUsuario.ADMIN,
    },
  });

  await prisma.usuarioLocal.upsert({
    where: { usuarioId_localId: { usuarioId: admin.id, localId: cd.id } },
    update: {},
    create: { usuarioId: admin.id, localId: cd.id },
  });

  console.log(`Seed concluído. Login: ${emailAdmin} / senha: ${senhaAdmin}`);
  console.log('Troque a senha assim que possível — este valor é só para o primeiro acesso.');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
