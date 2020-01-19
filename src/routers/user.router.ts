import express from 'express';
import { pageGenerator } from '../routers/auth.router';
import { authAdminFinanceMiddleware, authAdminMiddleware } from '../middleware/auth.middleware';
import { notFound } from '../middleware/error.middleware';
import { UserDAO } from '../dao/userDAO';

export const userRouter = express.Router();

const users = new UserDAO();

userRouter.get('', (req, res, next) => {
  if (req.query.id === undefined) {
    next();
  } else {
    res.redirect('/users/' + req.query.id);
  }
});

userRouter.get('/', [authAdminFinanceMiddleware, (req, res) => {
  users.getAllUsers().then(function (result) {
    res.status(200).send(pageGenerator(['Users', userTable(result, req.session.user)], req.session.user));
  });
}]);

userRouter.get('/:id', (req, res) => {
  const idParam = +req.params.id; 
  users.getAllUsers().then(function (result) {
    try {
      const user = result.find(ele => ele.userId === idParam);
      res.status(200).send(pageGenerator(['users', userTable(user, req.session.user)], req.session.user));
    } catch {
      notFound(req, res);
    }
  });
});

userRouter.patch('*', [authAdminMiddleware, (req, res) => {
  UserDAO.updateUser(req.body);
  res.redirect('/users');
}]);

function userTable(users, user) {
  const id = user.userId;
  const role = user.role.role;
  let data = '';
  if (users.constructor == Array) {
    data += `<form action="users" method="patch">Select user by ID: <input type="number" name="id" min="1" max="${users.length}" value="1"><input class="button2" type="submit"></form>`;
  }
  data += `<Table><tr>
  <td>ID</td>
  <td>Username</td>
  <td>Password</td>
  <td colspan="2">Name</td>
  <td>Email</td>
  <td>Role</td>
  </tr>`;
  if (users.constructor == Array) {
    users.forEach(element => {
      data += `<tr>
      <td><a href="/users/${element.userId}">${element.userId}</a></td>
      <td>${element.username}</td>
      <td>########</td>
      <td>${element.firstName}</td>
      <td>${element.lastName}</td>
      <td>${element.email}</td>
      <td>${element.role.role}</td>
      </tr>`;
    });
  } else {
    if (role === 'Admin') {
      data += `<form action="" method="post">
      <input type="hidden" name="_method" value="patch">
      <tr>
      <td><input name="userId" type="hidden" value="${users.userId}">${users.userId}</input></td>
      <td><input name="username" value="${users.username}"></input></td>
      <td><input name="password" value=""></input></td>
      <td><input name="firstName" value="${users.firstName}"></input></td>
      <td><input name="lastName" value="${users.lastName}"></input></td>
      <td><input name="email" value="${users.email}"></input></td>
      <td><select name="role">`;
      switch (users.role.role) {
        case 'Admin':
          data += `<option value="1" selected="true">Admin</option>
          <option value="2">Finance-Manager</option>
          <option value="3">Associate</option>`;
        break;
        case 'Finance-Manager':
          data += `<option value="1">Admin</option>
          <option value="2" selected="true">Finance-Manager</option>
          <option value="3">Associate</option>`;
        break;
        default:
          data += `<option value="1">Admin</option>
          <option value="2">Finance-Manager</option>
          <option value="3" selected="true">Associate</option>`;
        break;
      }
      data += `</select></td>
      </tr>
      <tr>
      <td colspan = "7"><input type="submit" value="Update" class="button2"></input></td>
      </tr>
      </form>`;
    } else if (role === 'Finance-Manager') {
      data += `<tr>
      <td>${users.userId}</td>
      <td>${users.username}</td>
      <td>########</td>
      <td>${users.firstName}</td>
      <td>${users.lastName}</td>
      <td>${users.email}</td>
      <td>${users.role.role}</td>`;
    } else if (users.userId === id) {
      data += `<tr>
      <td>${users.userId}</td>
      <td>${users.username}</td>
      <td>########</td>
      <td>${users.firstName}</td>
      <td>${users.lastName}</td>
      <td>${users.email}</td>
      <td>${users.role.role}</td>`;
    } else {
      data += `<td colspan="7">Unauthorized Access: Go get some real credentials fam.</td>`;
    }
  }
  data += '</table>';
  return data;
}