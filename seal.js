// Owner tool. node tools/seal.js keygen | seal | verify
const fs = require('fs'), c = require('crypto'), path = require('path');
process.chdir(path.join(__dirname, '..'));
const FILES = ['server.js', 'package.json', 'tools/seal.js', 'public/engine.js', 'public/world.js', 'public/index.html', 'public/world.html', 'public/legal.html', 'LICENSE'];
const hash = f => c.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const body = () => JSON.stringify(Object.fromEntries(FILES.map(f => [f, hash(f)])));
function verify() {
  if (!fs.existsSync('integrity.json') || !fs.existsSync('owner.pub')) return 'unsealed';
  const i = JSON.parse(fs.readFileSync('integrity.json'));
  if (!c.verify(null, Buffer.from(i.body), fs.readFileSync('owner.pub'), Buffer.from(i.sig, 'base64'))) return 'bad-signature';
  return i.body === body() ? 'official' : 'modified';
}
module.exports = { verify };
if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'keygen') {
    const k = c.generateKeyPairSync('ed25519');
    fs.writeFileSync('owner.key', k.privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
    fs.writeFileSync('owner.pub', k.publicKey.export({ type: 'spki', format: 'pem' }));
    console.log('Created owner.key (SECRET: never commit it, back it up offline) and owner.pub (commit this).');
  } else if (cmd === 'seal') {
    const b = body();
    fs.writeFileSync('integrity.json', JSON.stringify({ body: b, sig: c.sign(null, Buffer.from(b), fs.readFileSync('owner.key')).toString('base64') }));
    console.log('Sealed. Commit integrity.json.');
  } else console.log(verify());
}
