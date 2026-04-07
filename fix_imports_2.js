const fs = require('fs');

function fix(file, search, replace) {
  let c = fs.readFileSync(file, 'utf-8');
  if (c.includes(search)) {
    c = c.split(search).join(replace);
    fs.writeFileSync(file, c);
    console.log("Fixed " + file);
  }
}

fix('src/attachments/entities/attachment.entity.ts', '../../work-orders/', '../../modules/work-orders/');
fix('src/modules/machines/machines.module.ts', '../modules/nfc-tags/', '../nfc-tags/');
fix('src/modules/machines/machines.service.ts', '../modules/nfc-tags/', '../nfc-tags/');
