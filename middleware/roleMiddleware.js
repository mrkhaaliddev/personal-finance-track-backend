const roleMiddleware = (roles) => (req, res, next) => {
  const userRole = req.user.role;

  if (!roles.includes(userRole)) {
    return res.status(403).send({
      status: "false",
      message: "You don't have permission to access this resource",
    });
  } else {
    next();
  }
};

export default roleMiddleware;
