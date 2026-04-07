const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir('src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Fix references to old root modules
  if (content.includes('../nfc-tags/') || content.includes('../../nfc-tags/')) {
    content = content.replace(/\.\.\/nfc-tags\//g, '../modules/nfc-tags/');
    content = content.replace(/\.\.\/\.\.\/nfc-tags\//g, '../../modules/nfc-tags/');
    changed = true;
  }
  
  if (content.includes('../sync-queue/') || content.includes('../../sync-queue/')) {
    content = content.replace(/\.\.\/sync-queue\//g, '../modules/sync-queue/');
    content = content.replace(/\.\.\/\.\.\/sync-queue\//g, '../../modules/sync-queue/');
    changed = true;
  }
  
  // Quick fix for attachment entity missing module if applied
  if (content.includes("'nfc-tag.entity'") || content.includes("'sync-queue.entity'")) {
    content = content.replace(/'nfc-tag.entity'/g, "'../../modules/nfc-tags/entities/nfc-tag.entity'");
    content = content.replace(/'\.\/entities\/nfc-tag\.entity'/g, "'../../modules/nfc-tags/entities/nfc-tag.entity'");
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed imports in ${file}`);
  }
}
