import { AppDataSource } from '../config/database';

async function checkSchema() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        const tables = await queryRunner.getTables(['appointment', 'time_slot']);

        for (const table of tables) {
            console.log(`\nTable: ${table.name}`);
            console.log('Columns:');
            table.columns.forEach(col => {
                console.log(` - ${col.name} (${col.type}) ${col.isNullable ? 'NULL' : 'NOT NULL'}`);
            });
            console.log('Foreign Keys:');
            table.foreignKeys.forEach(fk => {
                console.log(` - ${fk.columnNames.join(', ')} -> ${fk.referencedTableName}(${fk.referencedColumnNames.join(', ')})`);
            });
        }

        await queryRunner.release();
    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await AppDataSource.destroy();
    }
}

checkSchema();
