const { Child } = require('../models');

// @desc    Get all children
// @route   GET /api/children
// @access  Private
const getAllChildren = async (req, res) => {
  try {
    const { limit } = req.query;
    const options = {
      order: [['createdAt', 'DESC']],
    };

    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    const children = await Child.findAll(options);
    res.json(children);
  } catch (error) {
    console.error('GET CHILDREN ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a new child
// @route   POST /api/children/add
// @access  Private
const addChild = async (req, res) => {
  try {
    const newChild = await Child.create(req.body);
    res.status(201).json(newChild);
  } catch (error) {
    // Check if this is a Sequelize validation error
    if (error.name === 'SequelizeValidationError') {
      const errors = {};
      error.errors.forEach(err => {
        errors[err.path] = err.message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    // For other types of errors
    console.error('ADD CHILD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a child's record
// @route   PUT /api/children/:id
// @access  Private
const updateChild = async (req, res) => {
  try {
    console.log('Update request received for child ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const child = await Child.findByPk(req.params.id);

    if (!child) {
      console.log('Child not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Child not found' });
    }

    // Log current child data before update
    console.log('Current child data:', JSON.stringify(child.toJSON(), null, 2));

    // Update only the fields that are present in the request body
    const updateData = {};
    const allowedFields = [
      'childFirstName', 'childMiddleName', 'childLastName', 'dob', 'gender', 'address',
      'disabilityType', 'disabilitySeverity', 'specialNeeds',
      'parentFirstName', 'parentLastName', 'relationship',
      'contactNumber', 'email', 'alternateContact',
      'primaryCareProvider', 'medicalConditions', 'medications', 'allergies',
      'school', 'grade', 'iep',
      'emergencyContactName', 'emergencyContactNumber', 'alternateEmergencyContact',
      'communicationMethod', 'date', 'parentSignature'
    ];

    // Only include fields that exist in the request body and are in the allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    console.log('Fields to update:', JSON.stringify(updateData, null, 2));

    // Update the child record
    const updatedChild = await child.update(updateData);
    
    console.log('Child updated successfully:', JSON.stringify(updatedChild.toJSON(), null, 2));
    res.json(updatedChild);

  } catch (error) {
    console.error('UPDATE CHILD ERROR:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Delete a child's record
// @route   DELETE /api/children/:id
// @access  Private
const deleteChild = async (req, res) => {
  try {
    const child = await Child.findByPk(req.params.id);

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Assuming auth middleware adds user to req
    // and Child model has a userId field
    // if (child.userId !== req.user.id) {
    //   return res.status(401).json({ message: 'User not authorized' });
    // }

    await child.destroy();

    res.json({ message: 'Child record removed' });
  } catch (error) {
    console.error('DELETE CHILD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllChildren,
  addChild,
  updateChild,
  deleteChild,
};
