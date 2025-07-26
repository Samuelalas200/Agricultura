import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.task.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de prueba
  const hashedPassword = await bcrypt.hash('123456789', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@campo360.com',
      password: hashedPassword,
      firstName: 'Juan Carlos',
      lastName: 'Rodríguez',
      phone: '+57 300 123 4567',
    },
  });

  console.log('✅ Usuario creado:', user.email);

  // Crear finca de ejemplo
  const farm = await prisma.farm.create({
    data: {
      name: 'Finca El Paraíso',
      location: 'Antioquia, Colombia',
      totalArea: 25.5,
      description: 'Finca dedicada al cultivo de café y aguacate',
      ownerId: user.id,
    },
  });

  console.log('✅ Finca creada:', farm.name);

  // Crear parcelas
  const parcel1 = await prisma.parcel.create({
    data: {
      name: 'Parcela Norte',
      area: 10.0,
      soilType: 'Franco arcilloso',
      farmId: farm.id,
    },
  });

  const parcel2 = await prisma.parcel.create({
    data: {
      name: 'Parcela Sur',
      area: 15.5,
      soilType: 'Franco limoso',
      farmId: farm.id,
    },
  });

  console.log('✅ Parcelas creadas');

  // Crear cultivos
  const crops = await Promise.all([
    prisma.crop.create({
      data: {
        name: 'Café Arábica',
        variety: 'Caturra',
        plantingDate: new Date('2024-03-15'),
        expectedHarvestDate: new Date('2024-12-15'),
        area: 8.0,
        status: 'GROWING',
        notes: 'Plantas en buen estado, requiere fertilización',
        farmId: farm.id,
        parcelId: parcel1.id,
      },
    }),
    prisma.crop.create({
      data: {
        name: 'Aguacate Hass',
        variety: 'Hass',
        plantingDate: new Date('2024-01-20'),
        expectedHarvestDate: new Date('2025-01-20'),
        area: 12.0,
        status: 'PLANTED',
        notes: 'Plantas jóvenes, necesitan cuidado especial',
        farmId: farm.id,
        parcelId: parcel2.id,
      },
    }),
    prisma.crop.create({
      data: {
        name: 'Plátano',
        variety: 'Dominico Hartón',
        plantingDate: new Date('2024-02-10'),
        expectedHarvestDate: new Date('2024-11-10'),
        area: 5.5,
        status: 'GROWING',
        farmId: farm.id,
        parcelId: parcel2.id,
      },
    }),
  ]);

  console.log('✅ Cultivos creados');

  // Crear tareas
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Fertilización del café',
        description: 'Aplicar fertilizante NPK 15-15-15',
        type: 'FERTILIZATION',
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
        priority: 'HIGH',
        estimatedDuration: 240, // 4 horas
        cost: 150000,
        cropId: crops[0].id,
        farmId: farm.id,
        assignedUserId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Riego de aguacates',
        description: 'Riego profundo para plantas jóvenes',
        type: 'IRRIGATION',
        status: 'IN_PROGRESS',
        scheduledDate: new Date(),
        priority: 'MEDIUM',
        estimatedDuration: 120, // 2 horas
        cropId: crops[1].id,
        farmId: farm.id,
        assignedUserId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Control de plagas en plátano',
        description: 'Inspección y tratamiento preventivo',
        type: 'PEST_CONTROL',
        status: 'COMPLETED',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        priority: 'URGENT',
        estimatedDuration: 180,
        actualDuration: 200,
        cost: 85000,
        notes: 'Se encontraron algunos insectos, aplicado tratamiento orgánico',
        cropId: crops[2].id,
        farmId: farm.id,
        assignedUserId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Preparación de suelo',
        description: 'Arado y preparación para nueva siembra',
        type: 'SOIL_PREPARATION',
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 1 semana
        priority: 'LOW',
        estimatedDuration: 480, // 8 horas
        cost: 200000,
        farmId: farm.id,
        assignedUserId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Monitoreo general de la finca',
        description: 'Inspección rutinaria de todos los cultivos',
        type: 'MONITORING',
        status: 'OVERDUE',
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
        priority: 'MEDIUM',
        estimatedDuration: 300, // 5 horas
        farmId: farm.id,
        assignedUserId: user.id,
      },
    }),
  ]);

  console.log('✅ Tareas creadas');

  console.log('🎉 Seed completado exitosamente!');
  console.log(`
📊 Resumen:
- Usuarios: 1
- Fincas: 1
- Parcelas: 2
- Cultivos: 3
- Tareas: 5

🔐 Credenciales de prueba:
Email: admin@campo360.com
Password: 123456789
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
