const { createClient } = require("@supabase/supabase-js");
const { lie_counter_uid, trusted_user_uid, supabase_url, supabase_key, supabase_table } = require("../config.json");

const supabase = createClient(supabase_url, supabase_key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

async function add(uid) {
    
    const { data, error } = await supabase
        .from(supabase_table)
        .select()
        .eq("uid", uid)
        .maybeSingle();
    if (error) throw error;

    if (data) {
        const newCount = data.liecount + 1;
        const { error: updateError } = await supabase
            .from(supabase_table)
            .update({ liecount: newCount })
            .eq("uid", uid);
        if (updateError) throw updateError;
        return newCount;
    } else {
        const { error: insertError } = await supabase
            .from(supabase_table)
            .insert({ uid, liecount: 1 });
        if (insertError) throw insertError;
        return 1;
    }
}

async function count(uid) {
    const { data, error } = await supabase
        .from(supabase_table)
        .select()
        .eq("uid", uid)
        .maybeSingle();
    if (error) throw error;

    console.log(data, data.liecount)

    return data.liecount ? data.liecount : 0;
}

async function set(uid, newCount) {
    const { error } = await supabase
        .from(supabase_table)
        .upsert({ uid, liecount: newCount }, { onConflict: 'uid' });
    if (error) throw error;
    return newCount;
}

async function top() {
    const {data, error} = await supabase
        .from(supabase_table)
        .select('uid::text, liecount')
        .order('liecount', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data || [];
}

async function pure() {
    const {data, error} = await supabase
        .from(supabase_table)
        .select('uid::text, liecount')
        .order('liecount', { ascending: true })
        .limit(10);
    if (error) throw error;
    return data || [];
}

module.exports = {
    add,
    count,
    set,
    top,
    pure
}