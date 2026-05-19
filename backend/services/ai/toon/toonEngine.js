// ── TOON Engine — Token Oriented Object Notation ──
// Kaam: MongoDB se aaye list of records ko compress karta hai
// Fayda: 40-60% token savings — LLM ko kam tokens = kam cost
// Kab use karo: jab bhi list of same-structure objects LLM ko bhejna ho

// Special characters jo TOON format mein reserved hain
// Agar value mein yeh chars hain toh quotes mein wrap karo
const SPECIAL_CHARS = [",", "\n", ":"]

// ── isTabular — Check karo data compress ho sakta hai ya nahi ──
// Returns: true = compress ho sakta hai, false = JSON as-is bhejo
const isTabular = (data) => {

    // Array.isArray() — check karo ki value array hai ya nahi
    // Python mein: isinstance(data, list)
    if (!Array.isArray(data)) return false

    if (data.length === 0) return false

    // data.every() — har element pe condition check karo
    // sab true hone chahiye tabhi true return hoga
    // Python mein: all(condition for item in data)
    if (!data.every(item => typeof item === "object" && !Array.isArray(item))) return false

    // Object.keys() — object ki saari keys nikalo
    // .sort() — alphabetically sort karo
    // .join(",") — array ko string mein convert karo
    // Python mein: ",".join(sorted(item.keys()))
    const firstKeys = Object.keys(data[0]).sort().join(",")

    // Check karo sab objects ke same keys hain
    if (!data.every(item => Object.keys(item).sort().join(",") === firstKeys)) return false

    // Nested objects nahi hone chahiye — TOON sirf flat data compress karta hai
    // Object.values() — object ki saari values nikalo
    // Python mein: item.values()
    for (const item of data) {
        for (const value of Object.values(item)) {
            if (typeof value === "object" && value !== null) return false
        }
    }

    return true
}

// ── _escapeValue — Special characters ko handle karo ──
// Agar value mein comma ya newline hai toh quotes mein wrap karo
const _escapeValue = (value) => {
    if (value === null || value === undefined) return ""

    // String() — koi bhi value ko string mein convert karo
    // Python mein: str(value)
    const str = String(value)

    // .some() — array mein koi bhi ek element condition satisfy kare toh true
    // Python mein: any(char in str for char in SPECIAL_CHARS)
    if (SPECIAL_CHARS.some(char => str.includes(char))) {
        return `"${str.replace(/"/g, '\\"')}"`
    }

    return str
}

// ── compress — JSON array ko TOON format mein convert karo ──
// Input:  [{caseNumber:"C001", status:"active"}, ...]
// Output: [2]{caseNumber,status}:\nC001,active\nC002,closed
const compress = (data) => {

    // Agar tabular nahi hai toh JSON as-is return karo
    if (!isTabular(data)) return JSON.stringify(data)

    // Pehle object ki keys = headers
    const headers = Object.keys(data[0])

    // Header line banao — [count]{field1,field2}
    const headerLine = `[${data.length}]{${headers.join(",")}}`

    // Har object ki values ko comma se join karo — ek row
    // .map() — array ke har element ko transform karo
    // Python mein: [",".join(str(item[h]) for h in headers) for item in data]
    const rows = data.map(item =>
        headers.map(h => _escapeValue(item[h])).join(",")
    )

    // Header + rows — newline se join karo
    return `${headerLine}:\n${rows.join("\n")}`
}

// ── decompress — TOON format ko wapas JSON mein convert karo ──
// Input:  [2]{caseNumber,status}:\nC001,active\nC002,closed
// Output: [{caseNumber:"C001", status:"active"}, ...]
const decompress = (toon) => {

    // TOON format nahi hai — seedha JSON parse karo
    if (!toon.startsWith("[")) return JSON.parse(toon)

    // Regex se TOON parse karo — teen groups nikalo
    // Group 1: count, Group 2: headers, Group 3: rows
    // Python mein: re.match(r'\[(\d+)\]\{([^}]+)\}:\n([\s\S]+)', toon)
    const headerMatch = toon.match(/\[(\d+)\]\{([^}]+)\}:\n([\s\S]+)/)
    if (!headerMatch) return JSON.parse(toon)

    // Headers string ko array mein convert karo
    const headers = headerMatch[2].split(",")

    // Rows string ko array mein convert karo
    const rows = headerMatch[3].split("\n")

    // Har row ko object mein convert karo
    // .forEach((h, i) => {}) — h = value, i = index
    // Python mein: for i, h in enumerate(headers):
    return rows.map(row => {
        const values = row.split(",")
        const obj = {}
        headers.forEach((h, i) => {
            obj[h] = values[i] ? values[i].replace(/^"|"$/g, "") : null
        })
        return obj
    })
}

module.exports = { compress, decompress, isTabular }