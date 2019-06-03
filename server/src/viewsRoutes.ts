import express = require("express");
import { Request } from "../types/moongooseArray";
import { Response } from "express-serve-static-core";
// import { verifyToken, createToken } from './jwt';
import {
  MISSING_PARAMETERS,
  BAD_REQUEST,
  STORE_OWNER,
  STORE_MANAGER,
  APPOINT_STORE_MANAGER,
  ADD_PRODUCT_PERMISSION,
  EMPTY_PERMISSION,
  SEND_STORE_MESSAGE_PERMISSION,
  GET_STORE_MESSAGE_PERMISSION,
  REMOVE_ROLE_PERMISSION,
  REMOVE_PRODUCT_PERMISSION,
  UPDATE_PRODUCT_PERMISSION,
  WATCH_WORKERS_PERMISSION,
  MANAGE_SALES_PERMISSION,
  MANAGE_PURCHASE_POLICY_PERMISSION,
  CONNECTION_LOST
} from "./consts";
import { UsersApi } from "./usersApi/usersApi";
import { ProductsApi } from "./productApi/productsApi";
import { StoresApi } from "./storeApi/storesApi";
import { addToSystemFailierLogger } from "./utils/addToLogger";

export const webRoutes = express.Router();

const usersApi = new UsersApi();
const productApi = new ProductsApi();
const storesApi = new StoresApi();

const categories = ["Home", "Garden", "Kitchen"];

const loginSection = (req: Request, res: Response, next) => {
  if (!req.session.user) res.redirect("/");
  else next();
};

const adminSection = (req: Request, res: Response, next) => {
  if (!req.session.user || !req.session.user.isAdmin) res.redirect("/");
  else next();
};

const checkPermission = (role, permission) => {
  return (
    permission &&
    role.name === STORE_MANAGER &&
    permission &&
    !role.permissions.some(perm => perm === permission)
  );
};

const dbCheckError = (responseType, response) => {
  if (responseType === CONNECTION_LOST) {
    response.redirect("/server-error");
    return true;
  }
  return false;
};
const storeSection = (permission = undefined) => async (
  req: Request,
  res: Response,
  next
) => {
  if (
    !req.session.user.role ||
    req.session.user.role.store !== req.params.storeId
  ) {
    const response = await usersApi.getUserRole(
      req.session.user.id,
      req.params.storeId
    );
    if (response.status < 0) {
      res.redirect(`/user-panel`);
    } else {
      const role = response.role;
      req.session.user.role = role;
    }
  }

  if (checkPermission(req.session.user.role, permission)) {
    res.redirect(`/store-panel/${req.params.storeId}/no-permission`);
  } else {
    next();
  }
};

webRoutes.get("/", async (req: Request, res: express.Response) => {
  const response = await storesApi.getAllStores();
  if (!dbCheckError(response.status, res)) {
    res.render("pages/home", {
      user: req.session.user,
      stores: response.stores
    });
  }
});

webRoutes.get("/server-error", async (req: Request, res: express.Response) => {
  res.render("pages/serverError", {
    user: req.session.user
  });
});

webRoutes.get("/products", async (req: Request, res: express.Response) => {
  const response = await productApi.getProducts({});
  if (!dbCheckError(response.status, res)) {
    if (response.status < 0) {
      console.log(response);
      res.redirect("/");
    }
    res.render("pages/products", {
      user: req.session.user,
      categories,
      products: response.products,
      storeId: null
    });
  }
});

webRoutes.post("/products", async (req: Request, res: express.Response) => {
  const keyWords = req.body.keywords.split(",");
  const storeId = req.body.storeId;
  const response = await productApi.getProducts({
    name: req.body.name !== "" ? req.body.name : undefined,
    keyWords: req.body.keywords !== "" ? keyWords : undefined,
    category: req.body.category !== "Category" ? req.body.category : undefined,
    storeId
  });
  if (!dbCheckError(response.status, res)) {
    if (response.status < 0) {
      console.log(response);
      res.redirect("/");
    }

    res.render("pages/products", {
      user: req.session.user,
      categories,
      products: response.products,
      storeId
    });
  }
});

webRoutes.get(
  "/products/:productId",
  async (req: Request, res: express.Response) => {
    const response = await productApi.getProductDetails(req.params.productId);
    if (!dbCheckError(response.status, res)) {
      if (response.status < 0) {
        console.log(response);
        res.redirect("/");
      }

      res.render("pages/productPage", {
        user: req.session.user,
        product: response.product
      });
    }
  }
);

webRoutes.get(
  "/stores/:storeId",
  async (req: Request, res: express.Response) => {
    const response = await storesApi.getStore(req.params.storeId);
    //mocking store purches rules
    if (!dbCheckError(response.status, res)) {
      res.render("pages/store", {
        user: req.session.user,
        store: response.store
      });
    }
  }
);

webRoutes.get(
  "/stores/:storeId/products",
  async (req: Request, res: express.Response) => {
    const response = await productApi.getProducts({
      storeId: req.params.storeId
    });
    if (!dbCheckError(response.status, res)) {
      if (response.status < 0) {
        console.log(response);
        res.redirect("/");
      }
      res.render("pages/products", {
        user: req.session.user,
        categories,
        products: response.products,
        storeId: req.params.storeId
      });
    }
  }
);

webRoutes.get("/register", async (req: Request, res: express.Response) => {
  res.render("pages/register", {
    user: req.session.user
  });
});

webRoutes.get("/login", async (req: Request, res: express.Response) => {
  if (res.locals.user) res.redirect("/");

  res.render("pages/login", {
    user: req.session.user
  });
});

webRoutes.get("/logout", (req: Request, res: express.Response) => {
  req.session.user = null;
  res.redirect("/");
});

webRoutes.post("/login", async (req: Request, res: express.Response) => {
  if (req.session.user) res.redirect("/");
  try {
    if (!req.body.userName || !req.body.password)
      res.send({
        status: MISSING_PARAMETERS,
        err: "did not received user or password"
      });
    else {
      const response = await usersApi.login(
        req.body.userName,
        req.body.password
      );
      if (!dbCheckError(response.status, res)) {
        if (response.err) res.send(response);
        else {
          const user: any = response.user;
          user.isAdmin = response.isAdmin;

          req.session.user = response.user;
          res.send(response);
        }
      }
    }
  } catch (err) {
    addToSystemFailierLogger(" view routes  ");
    res.send({ status: BAD_REQUEST });
  }
});

webRoutes.get("/carts", async (req: Request, res: express.Response) => {
  let response = req.session.user
    ? await usersApi.getCarts(req.session.user.id)
    : await usersApi.getCarts(null, req.session.id);
  if (!dbCheckError(response.status, res)) {
    res.render("pages/carts", {
      user: req.session.user,
      carts: response.carts
    });
  }
});

webRoutes.get("/order/:cartId", async (req: Request, res: express.Response) => {
  const userId = req.session.user ? req.session.user.id : null;
  const sessionId = req.session.id;
  const cartId = req.params.cartId;

  const response = await usersApi.getCart(userId, cartId, sessionId);
  if (!dbCheckError(response.status, res)) {
    if (response.status < 0) {
      console.log(response);
      res.redirect("/");
    }

    res.render("pages/orderPage", {
      user: req.session.user,
      cart: response.cart
    });
  }
});

webRoutes.get(
  "/user-panel",
  loginSection,
  async (req: Request, res: express.Response) => {
    res.render("pages/userPages/userHome", {
      user: req.session.user
    });
  }
);
webRoutes.get(
  "/user-panel/addStore",
  loginSection,
  async (req: Request, res: express.Response) => {
    res.render("pages/userPages/addStore", {
      user: req.session.user
    });
  }
);

webRoutes.get(
  "/user-panel/my-stores",
  loginSection,
  async (req: Request, res: express.Response) => {
    const response = await usersApi.getUserStores(req.session.user.id);
    if (!dbCheckError(response.status, res)) {
      res.render("pages/userPages/my-stores", {
        user: req.session.user,
        stores: response.stores
      });
    }
  }
);

webRoutes.get(
  "/store-panel/:storeId/addProduct",
  loginSection,
  storeSection(ADD_PRODUCT_PERMISSION),
  async (req: Request, res: express.Response) => {
    res.render("pages/storePages/addProduct1", {
      user: req.session.user,
      storeId: req.params.storeId,
      categories
    });
  }
);

webRoutes.get(
  "/store-panel/:storeId/workers",
  loginSection,
  storeSection(WATCH_WORKERS_PERMISSION),
  async (req: Request, res: express.Response) => {
    const workersRes = await storesApi.getWorkers(req.session.user.id, req.params.storeId);
    const ownersRes = await usersApi.getStoreOwners(req.params.storeId);
    const pendingOwnersRes = await usersApi.getPendingOwners(req.params.storeId);

    if (!dbCheckError(workersRes.status, res)) {
      
      if(workersRes.status < 0)
        res.redirect(`/store-panel/${req.params.storeId}/`);

      if(ownersRes.status < 0)
        res.redirect(`/store-panel/${req.params.storeId}/`); 
        res.redirect(`/store-panel/${req.params.storeId}/`);

        
      res.render("pages/storePages/workersPage", {
        user: req.session.user,
        storeId: req.params.storeId,
        workers: workersRes.storeWorkers,
        pendingOwners: pendingOwnersRes.pendingOwners,
        owners: ownersRes.storeOwners
      });
    }
  }
);

webRoutes.get(
  "/store-panel/:storeId/workers/updatePermissions/:workerId",
  loginSection,
  storeSection(REMOVE_ROLE_PERMISSION),
  async (req: Request, res: express.Response) => {
    const resp1 = await usersApi.getUserDetails(req.params.workerId);
    const resp2 = await usersApi.getUserRole(
      req.params.workerId,
      req.params.storeId
    );
    if (!dbCheckError(resp1.status, res) && !dbCheckError(resp2.status, res)) {
      const currPermissions = resp2.role.permissions;
      const allPermissions = [
        APPOINT_STORE_MANAGER,
        ADD_PRODUCT_PERMISSION,
        SEND_STORE_MESSAGE_PERMISSION,
        GET_STORE_MESSAGE_PERMISSION,
        REMOVE_ROLE_PERMISSION,
        REMOVE_PRODUCT_PERMISSION,
        UPDATE_PRODUCT_PERMISSION,
        WATCH_WORKERS_PERMISSION,
        MANAGE_SALES_PERMISSION,
        MANAGE_PURCHASE_POLICY_PERMISSION
      ];

      res.render("pages/storePages/permissionsPage", {
        user: req.session.user,
        storeId: req.params.storeId,
        worker: resp1.user,
        currPermissions: currPermissions,
        allPermissions: allPermissions
      });
    }
  }
);

webRoutes.get(
  "/admin-panel",
  adminSection,
  async (req: Request, res: express.Response) => {
    res.render("pages/adminPages/adminHome", {
      user: req.session.user
    });
  }
);

webRoutes.get(
  "/admin-panel/delete-revive",
  adminSection,
  async (req: Request, res: express.Response) => {
    res.render("pages/adminPages/deleteRevive", {
      user: req.session.user
    });
  }
);

webRoutes.get(
  "/admin-panel/appoint-admin",
  adminSection,
  async (req: Request, res: express.Response) => {
    res.render("pages/adminPages/appointAdmin", {
      user: req.session.user
    });
  }
);

webRoutes.get(
  "/store-panel/:storeId",
  loginSection,
  storeSection(),
  async (req: Request, res: express.Response) => {
    res.render("pages/storePages/storeHome", {
      user: req.session.user,
      storeId: req.params.storeId
    });
  }
);

webRoutes.get(
  "/store-panel/:storeId/manage-products",
  loginSection,
  storeSection(),
  async (req: Request, res: express.Response) => {
    const response = await productApi.getProducts(
      {
        storeId: req.params.storeId
      },
      true
    );
    if (!dbCheckError(response.status, res)) {
      res.render("pages/storePages/manageProducts", {
        user: req.session.user,
        storeId: req.params.storeId,
        products: response.products
      });
    }
  }
);

webRoutes.get(
  "/store-panel/:storeId/update-product/:productId",
  loginSection,
  storeSection(UPDATE_PRODUCT_PERMISSION),
  async (req: Request, res: express.Response) => {
    const response = await productApi.getProductDetails(req.params.productId);
    if (!dbCheckError(response.status, res)) {
      res.render("pages/storePages/updateProduct", {
        user: req.session.user,
        storeId: req.params.storeId,
        product: response.product,
        categories
      });
    }
  }
);

webRoutes.get(
  "/store-panel/:storeId/purchase-rules",
  loginSection,
  storeSection(MANAGE_PURCHASE_POLICY_PERMISSION),
  async (req: Request, res: express.Response) => {
    const response = await productApi.getProducts(
      {
        storeId: req.params.storeId
      },
      false
    );
    if (!dbCheckError(response.status, res)) {
      res.render("pages/storePages/purchaseRules", {
        user: req.session.user,
        storeId: req.params.storeId,
        products: response.products.map(product => ({
          id: product.id,
          name: product.name
        }))
      });
    }
  }
);

webRoutes.get(
  "/store-panel/:storeId/sale-rules",
  loginSection,
  storeSection(MANAGE_SALES_PERMISSION),
  async (req: Request, res: express.Response) => {
    const response = await productApi.getProducts(
      {
        storeId: req.params.storeId
      },
      false
    );
    if (!dbCheckError(response.status, res)) {
      res.render("pages/storePages/saleRules", {
        user: req.session.user,
        storeId: req.params.storeId,
        products: response.products.map(product => ({
          id: product.id,
          name: product.name
        }))
      });
    }
  }
);

webRoutes.get(
  "/store-panel/:storeId/no-permission",
  loginSection,
  storeSection(),
  async (req: Request, res: express.Response) => {
    res.render("pages/storePages/noPermission", {
      user: req.session.user,
      storeId: req.params.storeId
    });
  }
);
