// audit-models.js
const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

// Adjust the path to where your actual Sequelize instance or db index file is located
const db = require("./src/models/index.js");
const sequelize = db.sequelize;

const models = sequelize.models;
let primaryKeyType = null;
let hasMixedPkTypes = false;
const errors = [];

console.log(`--- Starting ORM Consistency Audit ---\n`);

// 1. Audit Primary Key Types
Object.keys(models).forEach((modelName) => {
  const model = models[modelName];
  const attributes = model.getAttributes();

  // Find primary key
  const pkField = Object.values(attributes).find((attr) => attr.primaryKey);
  if (!pkField) {
    errors.push(
      `[PK ERROR] Model "${modelName}" does not have a defined primary key.`,
    );
    return;
  }

  const currentPkType = pkField.type.constructor.name; // INTEGER, UUID, etc.

  if (!primaryKeyType) {
    primaryKeyType = currentPkType;
    console.log(
      `[PK INFO] Baseline primary key type detected: ${primaryKeyType}`,
    );
  } else if (primaryKeyType !== currentPkType) {
    hasMixedPkTypes = true;
    errors.push(
      `[PK MISMATCH] Model "${modelName}" uses ${currentPkType} primary key, but project baseline is ${primaryKeyType}.`,
    );
  }
});

// 2. Audit Association Foreign Keys
Object.keys(models).forEach((modelName) => {
  const model = models[modelName];
  const associations = model.associations;
  const attributes = model.getAttributes();

  Object.keys(associations).forEach((assocKey) => {
    const association = associations[assocKey];
    const { associationType, foreignKey, target, source } = association;

    // Determine which model should contain the foreign key column physically
    let targetModelWithFk = null;
    if (associationType === "BelongsTo") {
      targetModelWithFk = model; // Local model must contain the FK
    } else if (associationType === "HasOne" || associationType === "HasMany") {
      targetModelWithFk = target; // Target model must contain the FK
    }

    if (targetModelWithFk) {
      const fkAttributes = targetModelWithFk.getAttributes();
      if (!fkAttributes[foreignKey]) {
        errors.push(
          `[FK MISSING] Association "${modelName} ${associationType} ${target.name}" expects foreign key "${foreignKey}" to exist on model "${targetModelWithFk.name}", but it is missing from its definition.`,
        );
      }
    }

    // Check if models/index.js matches model definitions explicitly
    // Sequelize implicitly assigns a camelCase foreign key if omitted in the association configuration
    if (associationType === "BelongsToMany") {
      const throughModel = association.through.model;
      const tAttributes = throughModel.getAttributes();
      if (
        !tAttributes[association.foreignKey] ||
        !tAttributes[association.otherKey]
      ) {
        errors.push(
          `[M:N MISMATCH] Through table "${throughModel.name}" is missing expected association keys: "${association.foreignKey}" or "${association.otherKey}".`,
        );
      }
    }
  });
});

// Summary Report
console.log(`\n--- Audit Summary ---`);
if (errors.length === 0) {
  console.log(`✓ All foreign keys exist in definitions.`);
  console.log(`✓ Primary key type uniformity verified (${primaryKeyType}).`);
  console.log(`✓ Zero index-to-model definition mismatches detected.`);
} else {
  console.error(`✖ Found ${errors.length} configuration issues:\n`);
  errors.forEach((err) => console.error(err));
  process.exit(1);
}
