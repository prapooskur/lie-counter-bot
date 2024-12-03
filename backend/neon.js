const { db_table, neon_conn_string } = require("../config.json");
const { neon } = require("@neondatabase/serverless");

const sql = neon(neon_conn_string);

async function add(uid) {

    const data = await sql(`SELECT * FROM ${db_table} WHERE uid = $1`, [uid]);

    if (data) {
        const newCount = (data[0]?.liecount ?? 0) + 1;
        await sql(`UPDATE ${db_table} SET liecount = $1 WHERE uid = $2`, [newCount, uid]);
        return newCount;
    } else {
        const out = await sql(`INSERT INTO ${db_table} (uid, liecount) VALUES ($1, $2)`, [uid, 1]);
        console.log(out)
        return 1;
    }
}

async function count(uid) {

    console.log("pre ", uid)
    
    const liecount = await sql(`SELECT liecount FROM ${db_table} WHERE uid = $1`, [uid]);

    console.log(liecount)

    return liecount[0].liecount ? liecount[0].liecount : 0;
}

async function set(uid, newCount) {
    await sql(`INSERT INTO ${db_table} (uid, liecount) VALUES ($1, $2) ON CONFLICT (uid) DO UPDATE SET liecount = EXCLUDED.liecount`, [uid, newCount])

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