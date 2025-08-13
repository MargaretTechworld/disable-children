const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      ...config,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
}

// Import all models
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// First pass: Load all models
modelFiles.forEach(file => {
  try {
    const modelPath = path.join(__dirname, file);
    const modelModule = require(modelPath);
    
    // Handle different export styles
    let model;
    if (typeof modelModule === 'function') {
      // Handle factory function export
      model = modelModule(sequelize, Sequelize.DataTypes);
    } else if (modelModule && typeof modelModule.default === 'function') {
      // Handle ES6 default export
      model = modelModule.default(sequelize, Sequelize.DataTypes);
    } else if (modelModule && modelModule.name && modelModule.sequelize) {
      // Handle direct model instance
      model = modelModule;
    } else {
      console.warn(`Could not load model from file: ${file}`);
      return;
    }
    
    if (model && model.name) {
      db[model.name] = model;
      console.log(`Loaded model: ${model.name}`);
    }
  } catch (error) {
    console.error(`Error loading model ${file}:`, error.message);
    console.error(error.stack);
  }
});

// Second pass: Set up model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    console.log(`Setting up associations for ${modelName}`);
    try {
      db[modelName].associate(db);
    } catch (error) {
      console.error(`Error setting up associations for ${modelName}:`, error);
    }
  }
});

// Add sequelize and Sequelize to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Verify all models are loaded
console.log('Loaded models:', Object.keys(db));

module.exports = db;
