import express from 'express';
import { pageGenerator } from './auth.router';
import { authAdminFinanceMiddleware } from '../middleware/auth.middleware';
import { unauthorizedError, notFound } from '../middleware/error.middleware';
import { ReimbursementStatusDAO } from '../dao/reimbursementstatusDAO';
import { ReimbursementDAO } from '../dao/reimbursementDAO';
import { UserDAO } from '../dao/userDAO';

// Database
const users = new UserDAO();
const statuses = new ReimbursementStatusDAO();
const reimbursements = new ReimbursementDAO();

// we will assume all routes defined with this router
export const reimbursementRouter = express.Router();

// generate root reimbursements page with links based on if Admin/Finance-Manager or not.
reimbursementRouter.get('', (req, res) => {
  const role = req.session.user.role.role;
  const id = req.session.user.userId;
  if (role === undefined) {
    unauthorizedError(req, res);
  }
  let body = `<p><a href="/reimbursements/submit"><button class="button2">Submit New Reimbursement</button></a><a href="/reimbursements/author/userId/${id}"><button class="button2">Current Reimbursements</button></a></p>`;
  if ( role === 'Finance-Manager' || role === 'Admin') {
    body  += `<p><a href="/reimbursements/author"><button class="login_btn button2">User Reimbursement</button></a><a href="/reimbursements/status"><button class="login_btn button2">Status of Reimbursements</button></a></p>`;
  }
  body += '';
  res.status(200).send(pageGenerator(['Reimbursements', body], req.session.user));
});

// approve or deny reiumbursement
reimbursementRouter.patch('', [authAdminFinanceMiddleware, (req, res) => {
  ReimbursementDAO.updateReimbursement(req.body.status, req.body.reimbursementId);
  res.redirect(`/reimbursements/r/${req.body.reimbursementId}`);
}]);

// Form for creating reimbursement
reimbursementRouter.get('/submit', (req, res) => {
  const body = `<form action="/reimbursements" method="post"><table><input type="hidden" name="reimbursementid" value="0">
  <tr><td>Description</td><td><input name="description" id="description"></input></td></tr>
  <tr><td>Amount</td><td>$<input name="amount" id="amount" type="number" step=".01" min=".01"></input></td></tr>
  <tr>Type<td>Type</td><td><select name="type">
  <option name="Food" selected="true" value="1">Food</option>
  <option name="Lodging" value="2">Lodging</option>
  <option name="Travel" value="3">Travel</option>
  <option name="Other" value="4">Other</option>
  </select></td></tr>
  <tr><td colspan="2"><input type="submit" value="Submit" input="button2"></input></td></tr>
  <table></form>`;
  res.status(200).send(pageGenerator(['Reimbursements', body], req.session.user));
});

// Submit new reimbursement
reimbursementRouter.post('', (req, res) => {
  const b = req.body;
  const id = req.session.user.userId;
  const today = Math.round((new Date()).getTime() / 1000);
  ReimbursementDAO.addReimbursements(id, b.amount, today, b.description, b.type);
  res.redirect(`/reimbursements/author/userId/${id}`);
});

// Show all users
reimbursementRouter.get('/author', [authAdminFinanceMiddleware, (req, res) => {
  users.getAllUsers().then(function (result) {
    res.status(200).send(pageGenerator(['Users', userbody(result)], req.session.user));
  });
}]);

// Show all Statuses
reimbursementRouter.get('/status', [authAdminFinanceMiddleware, (req, res) => {
  statuses.getAllReimbursementStatuses().then(function (result) {
    res.status(200).send(pageGenerator(['Statuses', statusbody(result)], req.session.user));
  });
}]);

// get reimbursements by User
reimbursementRouter.get('/author/userId/:id', (req, res) => {
  if (req.session === undefined || req.session.user === undefined || req.session.user.role.role === undefined) {
    unauthorizedError(req, res);
  } else if (req.params.id == req.session.user.userId || req.session.user.role.role === 'Finance-Manager' || req.session.user.role.role === 'Admin') {
    const idParam = +req.params.id; 
    reimbursements.getReimbursementsByUserId(idParam).then(function (result) {
      res.status(200).send(pageGenerator(['Reimbursements', reimbursementbody(result, req.session.user.role, false)], req.session.user));
    });
  } else {
    unauthorizedError(req, res);
  }
});

// Get reimbursements by status
reimbursementRouter.get('/status/:statusId', [authAdminFinanceMiddleware, (req, res) => {
  if (req.params.id == req.session.user.userId || req.session.user.role.role === 'Finance-Manager' || req.session.user.role.role === 'Admin') {
    const idParam = +req.params.statusId; 
    reimbursements.getReimbursementsByStatus(idParam).then(function (result) {
      res.status(200).send(pageGenerator(['Reimbursements', reimbursementbody(result, req.session.user.role, false)], req.session.user));
    });
  } else {
    unauthorizedError(req, res);
  }
}]);

// Get specific reimbursement
reimbursementRouter.get('/r/:id', [authAdminFinanceMiddleware, (req, res) => {
  if (req.params.id == req.session.user.userId || req.session.user.role.role === 'Finance-Manager' || req.session.user.role.role === 'Admin') {
    const idParam = +req.params.id; // convert to number
    reimbursements.getReimbursementsById(idParam).then(function (result) {
      res.status(200).send(pageGenerator(['Reimbursements', reimbursementbody(result, req.session.user.role, true)], req.session.user));
    });
  } else {
    unauthorizedError(req, res);
  }
}]);

function reimbursementbody(filteredReimbursements, role, form) {
  let body = `<form action="/reimbursements/" method="post">
  <input type="hidden" name="_method" value="patch" class="button2">
  <table><tr>
  <td>ID</td>
  <td>User</td>
  <td>Amount</td>
  <td>Submitted</td>
  <td>Resolved</td>
  <td>Description</td>
  <td>Resolver</td>
  <td>Status</td>
  <td>Type</td>`;
  body += `</tr>`;
  if (filteredReimbursements.length === 0)  {
    body += '<tr><td colspan="9">No Reimbursements</td></tr>';
  } else {
    filteredReimbursements.forEach(ele => {
      const author = ele.author.firstName + ' ' + ele.author.lastName;
      const dateSubmitted = new Date(ele.dateSubmitted * 1000).toLocaleDateString('en-US');
      let dateResolved;
      if (ele.dateResolved === 0) {
        dateResolved = '';
      } else {
        dateResolved = new Date(ele.dateResolved * 1000).toLocaleDateString('en-US');
      }
      const resolver = ele.resolver.firstName + ' ' + ele.resolver.lastName;
      if (role.role === 'Finance-Manager' || role.role === 'Admin') {
        body += `<td><a href="/reimbursements/r/${ele.reimbursementId}"><input class="button2" name="reimbursementId" type="hidden" value="${ele.reimbursementId}">${ele.reimbursementId}</input></a></td>`;
      } else {
        body += `<td>${ele.reimbursementId}</td>`;
      }
      body += `
      <td>${author}</td>
      <td>\$${ele.amount}</td>
      <td>${dateSubmitted}</td>
      <td>${dateResolved}</td>
      <td>${ele.description}</td>
      <td>${resolver}</td>`;
      if (form && ele.status.status === 'Pending') {
        body += `<td><select name="status">
        <option value="1" selected="true">Pending</option>
        <option value="2">Approved</option>
        <option value="3">Denied</option>
        </select></td>
        <td>${ele.type.type}</td></tr>
        <td colspan = "9"><input type="submit" value="Update" class="button2"></input></td>`;
      } else {
        body += `<td>${ele.status.status}</td>
        <td>${ele.type.type}</td></tr>`;
      }
    });
  }
  body += '</table></form>';
  return body;
}

function userbody(u) {
  let body = `<table><tr>
  <td>ID</td>
  <td>Username</td>
  <td>Password</td>
  <td colspan="2">Name</td>
  <td>Email</td>
  <td>Role</td>
  </tr>`;
  u.forEach(element => {
    body += `<tr>
    <td><a href="/reimbursements/author/userId/${element.userId}">${element.userId}</a></td>
    <td>${element.username}</td>
    <td>********</td>
    <td>${element.firstName}</td>
    <td>${element.lastName}</td>
    <td><a href="mailto:${element.email}">${element.email}</a></td>
    <td>${element.role.role}</td>
    </tr>`;
  });
  body += `</td>
  </tr>
  </table>`;
  return body;
}

// Show all statuses
function statusbody(rs) {
  let body = `<table><tr>
  <td>ID</td>
  <td>Status</td>
  </tr>`;
  rs.forEach(element => {
    body += `<tr>
    <td><a href="/reimbursements/status/${element.statusId}">${element.statusId}</a></td>
    <td>${element.status}</td>
    </tr>`;
  });
  body += `</td>
  </tr>
  </table>`;
  return body;
}