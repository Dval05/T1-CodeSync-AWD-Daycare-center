import supabase from '../config/supabase.js';

async function inspect() {
    try {
        // First try: information_schema (might be blocked by PostgREST settings)
        let res = await supabase
            .from('information_schema.columns')
            .select('column_name,data_type,is_nullable,ordinal_position')
            .eq('table_name', 'teacher_payment')
            .eq('table_schema', 'public')
            .order('ordinal_position', { ascending: true });

        if (res.error) {
            console.warn('information_schema query failed, falling back to sampling rows:', res.error.message);
            // Fallback: try to select a single row from the table and infer keys
            const { data: sample, error: sampleErr } = await supabase
                .from('teacher_payment')
                .select('*')
                .limit(1);
            if (sampleErr) {
                console.error('Failed to sample teacher_payment table:', sampleErr);
                process.exit(1);
            }
            if (!sample || sample.length === 0) {
                console.log('No rows found in teacher_payment to infer columns. information_schema is unavailable via PostgREST.');
                process.exit(0);
            }
            console.log('Inferred columns from sample row:');
            Object.keys(sample[0]).forEach((k, i) => console.log(`${i + 1}. ${k}`));
            process.exit(0);
        }

        const data = res.data;
        if (!data || data.length === 0) {
            console.log('No columns found for table teacher_payment.');
            process.exit(0);
        }

        console.log('Columns for teacher_payment:');
        data.forEach(col => {
            console.log(`${col.ordinal_position}. ${col.column_name} (${col.data_type}) nullable=${col.is_nullable}`);
        });
    } catch (e) {
        console.error('Unexpected error:', e);
        process.exit(1);
    }
}

inspect();
