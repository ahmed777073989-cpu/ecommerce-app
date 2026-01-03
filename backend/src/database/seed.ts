import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User, AccessCode } from './entities';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized');

    const userRepository = AppDataSource.getRepository(User);
    const accessCodeRepository = AppDataSource.getRepository(AccessCode);

    const existingSuperAdmin = await userRepository.findOne({
      where: { phone: '+966500000001' }
    });

    if (!existingSuperAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const superAdmin = userRepository.create({
        name: 'Super Admin',
        phone: '+966500000001',
        passwordHash,
        role: 'super_admin',
        active: true,
      });
      await userRepository.save(superAdmin);
      console.log('✓ Super admin created');
    } else {
      console.log('✓ Super admin already exists');
    }

    const existingCodesCount = await accessCodeRepository.count();
    if (existingCodesCount === 0) {
      const codes: AccessCode[] = [];
      const now = new Date();
      
      for (let i = 0; i < 5; i++) {
        const code = generateCode();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 30);
        
        codes.push(accessCodeRepository.create({
          code,
          role: 'user',
          validFrom: now,
          validUntil,
          usesAllowed: 1,
          usesCount: 0,
          isUsed: false,
          note: `30-day user access code ${i + 1}`,
        }));
      }

      for (let i = 0; i < 3; i++) {
        const code = generateCode();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 365);
        
        codes.push(accessCodeRepository.create({
          code,
          role: 'admin',
          validFrom: now,
          validUntil,
          usesAllowed: 1,
          usesCount: 0,
          isUsed: false,
          note: `365-day admin access code ${i + 1}`,
        }));
      }

      for (let i = 0; i < 2; i++) {
        const code = generateCode();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 30);
        
        codes.push(accessCodeRepository.create({
          code,
          role: 'user',
          validFrom: now,
          validUntil,
          usesAllowed: 5,
          usesCount: 0,
          isUsed: false,
          note: `30-day multi-use user code ${i + 1}`,
        }));
      }

      await accessCodeRepository.save(codes);
      console.log(`✓ Created ${codes.length} access codes`);
      console.log('\nSample Access Codes:');
      codes.forEach((code) => {
        console.log(`  ${code.code} - ${code.role} (${code.usesAllowed} uses, valid until ${code.validUntil.toISOString().split('T')[0]})`);
      });
    } else {
      console.log('✓ Access codes already exist');
    }

    console.log('\n✅ Database seeding completed successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

seed();
