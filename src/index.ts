import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { authRouter } from './routers/auth.router';
import { userRouter } from './routers/user.router';
import { reimbursementRouter } from './routers/reimbursement.router';
import { notFound, internalError } from './middleware/error.middleware';


const methodOverride = require('method-override');


const app = express();
app.use('/', express.static(__dirname + '/views/'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.use((req, res, next) => {
  console.log(`request was made with url: ${req.path}
  and method: ${req.method}`);
  next(); 
});


const sess = {
  secret: '12345678',
  cookie: { secure: false },
  resave: false,
  saveUninitialized: false
};


app.use(session(sess));

app.use('/', authRouter);
app.use('/users', userRouter);
app.use('/reimbursements', reimbursementRouter);

app.use(function(req, res) {
  notFound(req, res);
});
app.use(function(error, req, res) {
 internalError(req, res);
});


app.listen(3000);
console.log(`application started on port: ${3000}`);