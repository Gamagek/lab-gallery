const fs = require('node:fs');
const sharp = require('sharp');
const {products} = require('../content/comparisons.cjs');
async function main() {
  // Bounded batches keep memory use predictable in CI.
  for(let i=0;i<products.length;i+=4)await Promise.all(products.slice(i,i+4).map(async p=>{
    const base=`assets/comparisons/${p.slug}`;
    const result=await sharp(fs.readFileSync(base+'.svg')).png({compressionLevel:9}).toBuffer();
    fs.writeFileSync(base+'.png',result);
  }));
  console.log('Rendered 50 first-party comparison PNGs at 1200 × 630.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
