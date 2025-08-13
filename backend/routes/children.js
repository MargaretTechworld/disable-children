const express = require('express');
const router = express.Router();
const { getAllChildren, addChild, updateChild, deleteChild } = require('../controllers/childController');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const { Child } = require('../models');
const Sequelize = require('sequelize');
const role = require('../middleware/role');

// @route   GET /api/children
// @desc    Get all children for the logged-in user
// @access  Private
router.get('/', auth, getAllChildren);

// @route   POST /api/children
// @desc    Add a new child
// @access  Private
router.post('/', auth, addChild);

// @route   PUT /api/children/:id
// @desc    Update a child's record
// @access  Private
router.put('/:id', auth, updateChild);

// @route   DELETE /api/children/:id
// @desc    Delete a child's record
// @access  Private
router.delete('/:id', auth, deleteChild);

/**
 * @route   GET /api/children/disability-types
 * @desc    Get distinct disability types from children
 * @access  Private/Admin
 */
router.get('/disability-types', auth, role.isAdmin, async (req, res) => {
  try {
    console.log('Fetching disability types from database...');
    
    // First, check if there are any children records
    const childCount = await Child.count();
    console.log(`Total children records in database: ${childCount}`);
    
    // Get all distinct disability types
    const disabilityTypes = await Child.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('disabilityType')), 'disabilityType']
      ],
      where: {
        disabilityType: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' }
          ]
        }
      },
      raw: true
    });

    console.log('Raw disability types from database:', JSON.stringify(disabilityTypes, null, 2));
    
    // Extract just the disability type strings and filter out any null/empty values
    const types = disabilityTypes
      .map(item => item.disabilityType)
      .filter(Boolean);
      
    console.log('Processed disability types:', types);

    if (types.length === 0) {
      console.warn('No disability types found in the database. Please check if the children table has data.');
      // Try a more permissive query to see what values exist
      const allValues = await Child.findAll({
        attributes: ['disabilityType'],
        raw: true
      });
      console.log('All disabilityType values in database:', JSON.stringify(allValues, null, 2));
    }

    res.json(types);
  } catch (error) {
    console.error('Error fetching disability types:', error);
    res.status(500).json({ 
      message: 'Error fetching disability types',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   GET /api/children/debug/disability-types
 * @desc    Debug endpoint to check children and their disability types
 * @access  Private/Admin
 */
router.get('/debug/disability-types', auth, role.isAdmin, async (req, res) => {
  try {
    console.log('Debug: Fetching all children records...');
    
    // Get all children with their disability types
    const allChildren = await Child.findAll({
      attributes: ['id', 'firstName', 'lastName', 'disabilityType'],
      raw: true,
      order: [['disabilityType', 'ASC']]
    });
    
    console.log(`Found ${allChildren.length} children records`);
    
    // Count records by disability type
    const typeCounts = allChildren.reduce((acc, child) => {
      const type = child.disabilityType || 'not_specified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Disability type distribution:', JSON.stringify(typeCounts, null, 2));
    
    // Get all unique disability types
    const uniqueTypes = [...new Set(allChildren.map(c => c.disabilityType).filter(Boolean))];
    console.log('Unique disability types:', uniqueTypes);
    
    res.json({
      totalChildren: allChildren.length,
      disabilityTypeCounts: typeCounts,
      uniqueDisabilityTypes: uniqueTypes,
      sampleRecords: allChildren.slice(0, 10) // Return first 10 records as sample
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      message: 'Debug error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   GET /api/children/debug/disability-data
 * @desc    Debug endpoint to inspect disability types in the database
 * @access  Private/Admin
 */
router.get('/debug/disability-data', auth, role.isAdmin, async (req, res) => {
  try {
    // Get all children with their disability types
    const allChildren = await Child.findAll({
      attributes: ['id', 'childFirstName', 'childLastName', 'disabilityType'],
      raw: true,
      order: [['disabilityType', 'ASC']]
    });

    // Group by disability type
    const byDisability = {};
    allChildren.forEach(child => {
      const type = child.disabilityType || 'not_specified';
      if (!byDisability[type]) {
        byDisability[type] = [];
      }
      byDisability[type].push({
        id: child.id,
        name: `${child.childFirstName} ${child.childLastName}`.trim()
      });
    });

    // Get unique disability types
    const uniqueTypes = Object.keys(byDisability).sort();
    
    // Count children by disability type
    const typeCounts = {};
    uniqueTypes.forEach(type => {
      typeCounts[type] = byDisability[type].length;
    });

    res.json({
      totalChildren: allChildren.length,
      uniqueDisabilityTypes: uniqueTypes,
      disabilityTypeCounts: typeCounts,
      sampleRecords: allChildren.slice(0, 10).map(record => ({
        id: record.id,
        name: `${record.childFirstName} ${record.childLastName}`.trim(),
        disabilityType: record.disabilityType
      })),
      byDisability: byDisability
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      message: 'Debug error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
