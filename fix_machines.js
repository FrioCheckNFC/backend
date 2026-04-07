const fs = require('fs');
let c = fs.readFileSync('src/modules/machines/machines.service.ts', 'utf-8');
c = c.replace(/nfcTag\.machineId/g, 'nfcTag.machine_id');
c = c.replace(/tagId:/g, 'uid:');
fs.writeFileSync('src/modules/machines/machines.service.ts', c);
console.log('Fixed machines.service.ts');
