// Validator for joi
import joi from "joi";

const userValidators = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message.replace(/['"]/g, ""),
    });
  }

  next();
};

export default userValidators;
