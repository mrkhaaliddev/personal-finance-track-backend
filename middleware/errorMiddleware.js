const notfound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CastError" && err.kind == "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    statusCode,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });

  next(err);
};

const MiddleWare = (req, res, next) => {
  const body = req.body;

  if (!body.username || body.email) {
    res.status(400).send({
      status: "false",
      message: "failed to post and image or bla bla..",
    });
  }

  next();
};

export { notfound, errorHandler };
