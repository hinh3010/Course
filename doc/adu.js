// const xlsx = require('xlsx');
// const fs = require('fs').promises;

// const csvFileName = 'file2.csv';

// const workbook = xlsx.readFile(csvFileName);
// const sheetName = workbook.SheetNames[0];
// const sheet = workbook.Sheets[sheetName];

// const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// const headers = jsonData[0];

// jsonData.shift();

// const jsonResult = jsonData.map((row) =>
//     row.reduce(
//         (acc, curr, index) => ({
//             ...acc,
//             [headers[index]]: curr,
//         }),
//         {}
//     )
// );

// console.log({ jsonResult })
// const jsonFileName = 'file.json';
// fs.writeFile(jsonFileName, JSON.stringify(jsonResult, null, 4), 'utf8');

// console.log('Chuyển đổi thành công!');

const data = [
    {
        "EC": "A00",
        "A0": "XS",
        "A1": "2Y"
    },
    {
        "EC": "A01",
        "A0": "S",
        "A1": "3Y"
    },
    {
        "EC": "A02",
        "A0": "M",
        "A1": "4Y"
    },
    {
        "EC": "A03",
        "A0": "L",
        "A1": "5Y"
    },
    {
        "EC": "A04",
        "A0": "XL",
        "A1": "6Y"
    }
];

// const newArray = data.map((value, index) => ({
//     [value['A0']]: value['EC'] + '_' + 'A0',
//     [value['A1']]: value['EC'] + '_' + 'A1'
// }));

const newArray = data.map((value) => {
    const result = {};
    for (const key in value) {
        if (key !== "EC") {
            result[value[key]] = value['EC'] + '_' + key;
        }
    }
    return result;
});

console.log(newArray);
