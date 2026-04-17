import { AppDataSource } from '../config/database';

async function checkIndexes() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        const table = await queryRunner.getTable('time_slot');
        if (table) {
            console.log(`\nTable: ${table.name}`);
            console.log('Indexes:');
            table.indices.forEach(idx => {
                console.log(` - ${idx.name} (Unique: ${idx.isUnique}) Columns: ${idx.columnNames.join(', ')}`);
            });
        }

        await queryRunner.release();
    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await AppDataSource.destroy();
    }
}

checkIndexes();
