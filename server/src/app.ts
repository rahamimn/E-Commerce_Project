const mongoose = require('mongoose');
import express = require('express');

// import { EDESTADDRREQ } from 'constants';
// import { usersApi } from './usersApi/usersApi';
import {usersApiRouter} from './usersApi/userRoutes';
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
console.log('connection to :' + dbName);
mongoose.connect('mongodb+srv://'+dbUser+':'+dbPassword+'@'+dbHost+'/'+dbName+
                    '?retryWrites=true', {useNewUrlParser: true});

const app = express();
app.use(usersApiRouter);
//app.use(storesApiRouter);
//app.use(productsApiRouter);
//app.use(oredersApiRouter);

const port = 3000;
app.listen(port, () => console.log(`listening on port ${port}!`));


// (async () => {
//     const u = new UserModel({ name: 'JohnDoe' , password:'ad'});
//     await u.save();
//     const user = await UserModel.findOne();

//     if(user) {
//         await user.save();
//         await user.changeName('new');
//         user.save();
//         let role = new RoleModel({ name: 'role10', nominee: user, code :10});
//         const a = await role.save();
//         await user.setRole(role);
//         console.log(await user.getMinCode());
//     }
//     //     let r;
//     //     if(user.roles)
//     //         r = await RoleModel.findById(user.roles[0]);
//     //     console.log(r);
//     const roles = await RoleModel.find();
//     RoleModel.save();
//     roles.save();
//     // prints { _id: 59218f686409d670a97e53e0, name: 'JohnDoe', __v: 0 }
//     console.log(roles);
//   })();