import { unauthorizedError } from '../middleware/error.middleware';

export function authAdminMiddleware(req, res, next) {
  if (req.session === undefined || req.session.user === undefined || req.session.user.role.role === undefined) {
     unauthorizedError(req, res);
  } else if (req.session.user.role.role === 'Admin') {
    next();
  } else {
    unauthorizedError(req, res);
  }
}

export function authAssociateMiddleware(req, res, next) {
  if (req.session === undefined || req.session.user === undefined || req.session.user.role.role === undefined) {
     unauthorizedError(req, res);
  } else if (req.session.user.role.role === 'Associate') {
    next();
  } else {
    unauthorizedError(req, res);
  }
}

export function authFinanceMiddleware(req, res, next) {
  if (req.session === undefined || req.session.user === undefined || req.session.user.role.role === undefined) {
     unauthorizedError(req, res);
  } else if (req.session.user.role.role === 'Finance-Manager') {
    next();
  } else {
    unauthorizedError(req, res);
  }
}

export function authAdminFinanceMiddleware(req, res, next) {
  if (req.session === undefined || req.session.user === undefined || req.session.user.role.role === undefined) {
     unauthorizedError(req, res);
  } else if (req.session.user.role.role === 'Finance-Manager' || req.session.user.role.role === 'Admin') {
    next();
  } else {
    unauthorizedError(req, res);
  }
}