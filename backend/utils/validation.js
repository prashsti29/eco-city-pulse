const Joi = require('joi');

exports.boundsSchema = Joi.object({
  north: Joi.number().min(-90).max(90).required(),
  south: Joi.number().min(-90).max(90).required(),
  east: Joi.number().min(-180).max(180).required(),
  west: Joi.number().min(-180).max(180).required()
}).custom((value, helpers) => {
  if (value.north <= value.south) {
    return helpers.error('bounds.invalid.latitude');
  }
  if (value.east <= value.west) {
    return helpers.error('bounds.invalid.longitude');
  }
  return value;
});

exports.dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

exports.validateBounds = (bounds) => {
  const { error } = this.boundsSchema.validate(bounds);
  if (error) throw new Error(error.details[0].message);
};