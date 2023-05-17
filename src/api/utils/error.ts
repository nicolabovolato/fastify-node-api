import { NotFoundError, ConflictError, AuthError } from "src/domain/errors";
import { FastifyInstance } from "fastify";

// format the response using fastify's default error format
const getErrorResponse = (err: Error) => {
  // is the error coming from the api? throw it then!
  if ("statusCode" in err) throw err;

  // is the error domain level?
  switch (err.constructor) {
    case NotFoundError:
      return { statusCode: 404, error: "Not found" };
    case ConflictError:
      return { statusCode: 409, error: "Conflict" };
    case AuthError:
      switch ((err as AuthError).type) {
        case "unauthorized":
          return { statusCode: 401, error: "Unauthorized" };
        case "forbidden":
          return { statusCode: 403, error: "Forbidden" };
      }
    // eslint-disable-next-line no-fallthrough
    default:
      return {
        statusCode: 500,
        error: "Internal server error",
        message: "internal server error",
      };
  }
};

export const errorHandler: FastifyInstance["errorHandler"] = async (
  err,
  req,
  res
) => {
  const errorResponse = getErrorResponse(err);

  if (!errorResponse.message) errorResponse.message = err.message;

  // fastify's default log format
  if (errorResponse.statusCode == 500)
    res.log.error({ req, res, err }, err.message);

  return res.status(errorResponse.statusCode).send(errorResponse);
};
