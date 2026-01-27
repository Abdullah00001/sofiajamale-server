const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please provide a module name.');
  process.exit(1);
}

const folderPath = path.join(process.cwd(), 'src', 'modules', moduleName);

const capitalized = capitalize(moduleName);

const simpleBoilerplate = (type) =>
  `const ${capitalized}${capitalize(type)} = {};

export default ${capitalized}${capitalize(type)};
`;

const files = {
  [`${moduleName}.controllers.ts`]: simpleBoilerplate('controllers'),
  [`${moduleName}.services.ts`]: simpleBoilerplate('services'),
  [`${moduleName}.repositories.ts`]: simpleBoilerplate('repositories'),
  [`${moduleName}.middlewares.ts`]: simpleBoilerplate('middlewares'),
  [`${moduleName}.interfaces.ts`]: '', // empty
  [`${moduleName}.models.ts`]: '', // empty
  [`${moduleName}.validations.ts`]: '', // empty
  [`${moduleName}.enums.ts`]: '', // empty
};

// Capitalize function
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Create folder
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
  console.log(`📁 Created folder: ${moduleName}`);
} else {
  console.log(`📁 Folder already exists: ${moduleName}`);
}

// Write files
Object.entries(files).forEach(([fileName, content]) => {
  const filePath = path.join(folderPath, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, { flag: 'w' });
    console.log(`📄 Created file: ${fileName}`);
  } else {
    console.log(`⚠️ File already exists: ${fileName}`);
  }
});

console.log(`✅ Module '${moduleName}' setup complete.`);
