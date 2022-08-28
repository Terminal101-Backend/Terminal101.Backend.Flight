const { decodeToken } = require("../helpers/tokenHelper");
const { EUserType } = require("../constants");
const responseHelper = require("./responseHelper");
const { common } = require("../services");

let io;

class Response {
  #statusCode = 200;
  #event = "";
  #serviceId;
  #clientId;

  constructor(serviceId, clientId, event) {
    this.#serviceId = serviceId;
    this.#clientId = clientId;
    this.#event = event;
  }

  status(statusCode) {
    this.#statusCode = statusCode;
    return this;
  }

  send(data) {
    const messageName = (this.#statusCode === 200) ? "success" : "failed";

    io.to(this.#serviceId).emit(messageName, {
      statusCode: this.#statusCode,
      message: data.message,
      status: data.status,
      event: this.#event,
      clientId: this.#clientId,
      data: data.data,
    });
  }
}

class Router {
  #middlewares = {};

  #getRouteMiddlewares(route, middlewares) {
    const [base, ...path] = route.split("/");
    middlewares = middlewares[base];
    if (path.length > 0) {
      middlewares = this.#getRouteMiddlewares(path.join("/"), middlewares);
    }

    return middlewares;
  }

  use(route, router, ...middlewares) {
    route = route.replace(/^\/*/, "").replace(/\/*$/, "");
    if (router instanceof Router) {
      this.#middlewares[route] = router.middlewares;
    } else {
      if (route === "") {
        this.#middlewares[route] = [router, ...middlewares];
      } else {
        this.#middlewares[route] = { "": [router, ...middlewares] };
      }
    }
  }

  route(route) {
    route = route.replace(/\/+/, "/");
    route = route.replace(/^\//, "");
    if (!route.endsWith("/")) {
      route += "/";
    }

    return this.#getRouteMiddlewares(route, this.middlewares);
  }

  get middlewares() {
    return this.#middlewares;
  }
}

/**
 * @param {Array} middlewares 
 * @param {String} base
 * @returns {String[]}
 */
const getAllRoutes = (middlewares, base = "") => {
  let result = [];
  Object.entries(middlewares).forEach(([path, middleware]) => {
    const route = (base + "/" + path).replace(/^\/*/, "").replace(/\/*$/, "");
    if (Array.isArray(middleware)) {
      result.push(route);
    } else {
      result = [...result, ...getAllRoutes(middleware, route)];
    }
  });

  return result;
};

let messages = new Router();

module.exports.Response = Response;

Object.defineProperty(module.exports, "router", {
  get: () => new Router(),
});

module.exports.use = router => {
  if (router instanceof Router) {
    messages = router;
    getAllRoutes(messages.middlewares).forEach(route => {
      common.addSocketEvent(route);
    });
  } else {
    throw "router_type_error";
  }
}

module.exports.initialize = server => {
  io = require('socket.io')(server);
  io.on('connection', socket => {
    console.log(`socket.io connected: ${socket.id}`);

    getAllRoutes(messages.middlewares).forEach(route => {
      common.addSocketEvent(route);
    });

    socket.on("request", msg => {
      const decodedToken = decodeToken(msg.token);

      const response = {
        event: msg.event,
        clientId: msg.clientId,
      };
      const res = new Response(socket.id, msg.clientId, msg.event);

      try {
        const req = {
          ...msg.req,
          header: key => Object.entries(msg?.req?.headers ?? {}).find(([k, v]) => [k.toLowerCase() === key.toLowerCase()])?.[1],
        }

        if (EUserType.check(["SERVICE"], decodedToken.type)) {
          const middlewares = messages.route(msg.event);
          const nextGenerator = i => {
            if (!!middlewares[++i]) {
              return () => middlewares[i](req, res, nextGenerator(i));
            } else {
              return () => { };
            }
          }
          middlewares[0](req, res, nextGenerator(0));
        } else {
          responseHelper.error(res, "access_denied", 403, response);
        }
      } catch (e) {
        responseHelper.error(res, e, 500, response);
      }
    })
  });
}
