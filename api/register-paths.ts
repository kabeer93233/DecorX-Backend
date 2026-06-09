import * as tsConfigPaths from 'tsconfig-paths';
import * as path from 'path';

// When compiled to dist/api/register-paths.js, __dirname is dist/api/
// We need baseUrl to point to dist/ so 'src/...' resolves to dist/src/...
tsConfigPaths.register({
  baseUrl: path.join(__dirname, '../'),
  paths: {},
});
