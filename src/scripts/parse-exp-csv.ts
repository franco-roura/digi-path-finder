import fs from "fs";

const csvFile = fs.readFileSync(
  "src/db/Digimon Story_ Cyber Sleuth EXP tables - EXP tables.csv",
  "utf8"
);

const rows = csvFile.split("\n");

const data = Object.fromEntries(
  rows.slice(1).map((row) => {
    const values = row.split(",");
    //Level,Baby,Total,In-Training,Total,Rookie,Total,Champion,Total,Ultimate,Total,Mega,Total,Ultra,Total,NX,Total
    const level = values[0];
    return [
      level,
      {
        level: values[0],
        Baby: {
          nextLevel: values[1],
          total: values[2],
        },
        "In-Training": {
          nextLevel: values[3],
          total: values[4],
        },
        Rookie: {
          nextLevel: values[5],
          total: values[6],
        },
        Champion: {
          nextLevel: values[7],
          total: values[8],
        },
        Ultimate: {
          nextLevel: values[9],
          total: values[10],
        },
        Mega: {
          nextLevel: values[11],
          total: values[12],
        },
        Ultra: {
          nextLevel: values[13],
          total: values[14],
        },
      },
    ];
  })
);

fs.writeFileSync("src/db/exp_tables.json", JSON.stringify(data, null, 2));
