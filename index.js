const fs = require('fs');
const mingo = require('mingo');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

const jsonDB = async () => {
    const content = await readFile('db.json', 'utf-8');
    const json = JSON.parse(content);
    return json
}

const subdistrictSearch = async (key, limit) => {
    const Thailand = await jsonDB();
    const regEx = new RegExp(`${key}`);
    const query = new mingo.Query({
        $or: [
            { p: { $regex: regEx } },
            { 'a.d': { $regex: regEx } },
            { 'a.w.s': { $regex: regEx } },
            { 'a.w.z': { $regex: regEx } },
        ],
    });
    const results = query.find(Thailand).all();
    let choices = [];
    for (const result of results) {
        for (const district of result.a) {
            for (const subdistrict of district.w) {
                if (
                    regEx.test(subdistrict.s) ||
                    regEx.test(subdistrict.z) ||
                    regEx.test(district.d) ||
                    regEx.test(result.p)
                ) {
                    const sPrefix = result.p === 'กรุงเทพมหานคร' ? 'แขวง' : 'ตำบล';
                    const dPrefix = result.p === 'กรุงเทพมหานคร' ? 'เขต' : 'อำเภอ';
                    const item = {
                        p: result.p,
                        s: subdistrict.s,
                        d: district.d,
                        z: subdistrict.z,
                        text: `${result.p} > ${dPrefix}${district.d} > ${sPrefix}${subdistrict.s} ${
                            subdistrict.z
                            }`,
                    };
                    choices.push(item);
                }
            }
        }
    }
    if (limit) {
        return choices.slice(0, limit);
    }
    return choices.slice(0, 20);
}

module.exports = {
    subdistrictSearch
};