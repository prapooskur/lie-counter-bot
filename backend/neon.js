const { db_table, neon_conn_string } = require("../config.json");
import { neon } from "@neondatabase/serverless";

const sql = neon(neon_conn_string);

async function add(uid) {
    
    // const { data, error } = await supabase
    //     .from(db_table)
    //     .select()
    //     .eq("uid", uid)
    //     .maybeSingle();

    const data = await sql('SELECT * FROM $1 WHERE uid = $2', db_table, uid);

    if (data) {
        const newCount = data.liecount + 1;
        await sql('UPDATE $1 SET liecount= $2 WHERE uid = $3', db_table, newCount, uid);
        
        // const { error: updateError } = await supabase
        //     .from(db_table)
        //     .update({ liecount: newCount })
        //     .eq("uid", uid);
        // if (updateError) throw updateError;
        return newCount;
    } else {
        const out = await sql('INSERT INTO $1 (uid, liecount) VALUES ($2, $3)', db_table, uid, 1);
        console.log(out)
        return 1;
    }
}

async function count(uid) {
    const data = await sql('SELECT * FROM $1 WHERE uid = $2', db_table, uid);

    console.log(data, data.liecount)

    return data.liecount ? data.liecount : 0;
}

async function set(uid, newCount) {
    await sql('INSERT INTO $1 (uid, liecount) VALUES ($2, $3) ON CONFLICT (uid) DO UPDATE SET liecount = EXCLUDED.liecount', db_table, uid, liecount)

    return newCount;
}

async function top() {
    const data = await sql(`SELECT uid::text, liecount FROM ${db_table} ORDER BY liecount DESC LIMIT 10`)

    return data || [];
}

async function pure() {
    const data = await sql(`SELECT uid::text, liecount FROM ${db_table} WHERE liecount >= 1 ORDER BY liecount LIMIT 10`)

    return data || [];
}

module.exports = {
    add,
    count,
    set,
    top,
    pure
}