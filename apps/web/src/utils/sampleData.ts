import { Timestamp } from 'firebase/firestore';
import { farmsService, cropsService, tasksService, Farm, Crop, Task } from '../services/firebaseService';

/**
 * Script para crear datos de prueba en Firebase
 * Ejecutar desde la consola del navegador o como función
 */

export const createSampleData = async (userId: string) => {
  console.log('🌱 Iniciando creación de datos de prueba...');
  
  try {
    // ==================== GRANJAS DE PRUEBA ====================
    console.log('📍 Creando granjas...');
    
    const farmData1: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Finca El Paraíso',
      location: 'Valle del Cauca, Colombia',
      size: 15.5, // hectáreas
      userId: userId
    };

    const farmData2: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Hacienda San José',
      location: 'Antioquia, Colombia', 
      size: 25.8,
      userId: userId
    };

    const farmData3: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Finca La Esperanza',
      location: 'Cundinamarca, Colombia',
      size: 8.2,
      userId: userId
    };

    const farm1Id = await farmsService.createFarm(farmData1);
    const farm2Id = await farmsService.createFarm(farmData2);
    const farm3Id = await farmsService.createFarm(farmData3);

    console.log(`✅ Granjas creadas: ${farm1Id}, ${farm2Id}, ${farm3Id}`);

    // ==================== CULTIVOS DE PRUEBA ====================
    console.log('🌾 Creando cultivos...');

    // Cultivos para Finca El Paraíso
    const cropData1: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Café Arábica',
      variety: 'Caturra',
      plantedDate: Timestamp.fromDate(new Date('2024-03-15')),
      expectedHarvestDate: Timestamp.fromDate(new Date('2025-03-15')),
      farmId: farm1Id,
      userId: userId,
      status: 'growing'
    };

    const cropData2: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Banano',
      variety: 'Cavendish',
      plantedDate: Timestamp.fromDate(new Date('2024-01-10')),
      expectedHarvestDate: Timestamp.fromDate(new Date('2024-12-10')),
      farmId: farm1Id,
      userId: userId,
      status: 'ready'
    };

    // Cultivos para Hacienda San José
    const cropData3: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Aguacate Hass',
      variety: 'Hass',
      plantedDate: Timestamp.fromDate(new Date('2023-08-20')),
      expectedHarvestDate: Timestamp.fromDate(new Date('2025-08-20')),
      farmId: farm2Id,
      userId: userId,
      status: 'growing'
    };

    const cropData4: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Maíz',
      variety: 'Amarillo Duro',
      plantedDate: Timestamp.fromDate(new Date('2024-06-01')),
      expectedHarvestDate: Timestamp.fromDate(new Date('2024-10-01')),
      farmId: farm2Id,
      userId: userId,
      status: 'harvested'
    };

    // Cultivos para Finca La Esperanza
    const cropData5: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Tomate',
      variety: 'Cherry',
      plantedDate: Timestamp.fromDate(new Date('2024-05-15')),
      expectedHarvestDate: Timestamp.fromDate(new Date('2024-08-15')),
      farmId: farm3Id,
      userId: userId,
      status: 'growing'
    };

    const cropData6: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Lechuga',
      variety: 'Crespa',
      plantedDate: Timestamp.fromDate(new Date('2024-07-01')),
      expectedHarvestDate: Timestamp.fromDate(new Date('2024-09-01')),
      farmId: farm3Id,
      userId: userId,
      status: 'planted'
    };

    const crop1Id = await cropsService.createCrop(cropData1);
    const crop2Id = await cropsService.createCrop(cropData2);
    const crop3Id = await cropsService.createCrop(cropData3);
    const crop4Id = await cropsService.createCrop(cropData4);
    const crop5Id = await cropsService.createCrop(cropData5);
    const crop6Id = await cropsService.createCrop(cropData6);

    console.log(`✅ Cultivos creados: 6 cultivos en total`);

    // ==================== TAREAS DE PRUEBA ====================
    console.log('📋 Creando tareas...');

    // Tareas generales de granja
    const taskData1: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Riego matutino sector A',
      description: 'Realizar riego de cultivos en el sector A durante las primeras horas de la mañana',
      dueDate: Timestamp.fromDate(new Date('2025-07-26')), // Mañana
      status: 'pending',
      priority: 'high',
      farmId: farm1Id,
      userId: userId
    };

    const taskData2: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Inspección de plagas en banano',
      description: 'Revisar cultivo de banano en busca de signos de plagas o enfermedades',
      dueDate: Timestamp.fromDate(new Date('2025-07-27')),
      status: 'pending',
      priority: 'medium',
      farmId: farm1Id,
      cropId: crop2Id,
      userId: userId
    };

    const taskData3: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Fertilización de aguacate',
      description: 'Aplicar fertilizante orgánico a los árboles de aguacate',
      dueDate: Timestamp.fromDate(new Date('2025-07-30')),
      status: 'pending',
      priority: 'medium',
      farmId: farm2Id,
      cropId: crop3Id,
      userId: userId
    };

    const taskData4: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Cosecha de tomate cherry',
      description: 'Recolectar tomates maduros en el invernadero',
      dueDate: Timestamp.fromDate(new Date('2025-07-25')), // Hoy
      status: 'in-progress',
      priority: 'high',
      farmId: farm3Id,
      cropId: crop5Id,
      userId: userId
    };

    const taskData5: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Mantenimiento de sistema de riego',
      description: 'Revisar y limpiar filtros del sistema de riego automático',
      dueDate: Timestamp.fromDate(new Date('2025-07-24')), // Ayer (vencida)
      status: 'pending',
      priority: 'high',
      farmId: farm2Id,
      userId: userId
    };

    const taskData6: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Análisis de suelo sector B',
      description: 'Tomar muestras de suelo para análisis nutricional',
      dueDate: Timestamp.fromDate(new Date('2025-07-20')), // Completada
      status: 'completed',
      priority: 'low',
      farmId: farm1Id,
      userId: userId
    };

    const taskData7: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Poda de café',
      description: 'Realizar poda sanitaria en plantas de café',
      dueDate: Timestamp.fromDate(new Date('2025-08-05')),
      status: 'pending',
      priority: 'medium',
      farmId: farm1Id,
      cropId: crop1Id,
      userId: userId
    };

    const taskData8: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Siembra de lechuga nueva temporada',
      description: 'Preparar camas y sembrar nueva temporada de lechuga',
      dueDate: Timestamp.fromDate(new Date('2025-08-01')),
      status: 'pending',
      priority: 'medium',
      farmId: farm3Id,
      userId: userId
    };

    // Crear todas las tareas
    const task1Id = await tasksService.createTask(taskData1);
    const task2Id = await tasksService.createTask(taskData2);
    const task3Id = await tasksService.createTask(taskData3);
    const task4Id = await tasksService.createTask(taskData4);
    const task5Id = await tasksService.createTask(taskData5);
    const task6Id = await tasksService.createTask(taskData6);
    const task7Id = await tasksService.createTask(taskData7);
    const task8Id = await tasksService.createTask(taskData8);

    console.log(`✅ Tareas creadas: 8 tareas en total`);

    // ==================== RESUMEN ====================
    console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   📍 Granjas: 3`);
    console.log(`   🌾 Cultivos: 6`);
    console.log(`   📋 Tareas: 8`);
    console.log('\n📈 Distribución de tareas:');
    console.log(`   ⏳ Pendientes: 5`);
    console.log(`   🔄 En progreso: 1`);
    console.log(`   ✅ Completadas: 1`);
    console.log(`   ⚠️ Vencidas: 1`);

    return {
      farms: [farm1Id, farm2Id, farm3Id],
      crops: [crop1Id, crop2Id, crop3Id, crop4Id, crop5Id, crop6Id],
      tasks: [task1Id, task2Id, task3Id, task4Id, task5Id, task6Id, task7Id, task8Id]
    };

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  }
};

// Función helper para limpiar datos de prueba (útil para testing)
export const clearSampleData = async (userId: string) => {
  console.log('🧹 Limpiando datos de prueba...');
  
  try {
    // Obtener todos los datos del usuario
    const farms = await farmsService.getFarms(userId);
    const crops = await cropsService.getCrops(userId);
    const tasks = await tasksService.getTasks(userId);

    // Eliminar tareas
    for (const task of tasks) {
      if (task.id) {
        await tasksService.deleteTask(task.id);
      }
    }

    // Eliminar cultivos
    for (const crop of crops) {
      if (crop.id) {
        await cropsService.deleteCrop(crop.id);
      }
    }

    // Eliminar granjas
    for (const farm of farms) {
      if (farm.id) {
        await farmsService.deleteFarm(farm.id);
      }
    }

    console.log('✅ Datos de prueba eliminados exitosamente');
  } catch (error) {
    console.error('❌ Error eliminando datos de prueba:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
(window as any).createCampo360SampleData = createSampleData;
(window as any).clearCampo360SampleData = clearSampleData;
