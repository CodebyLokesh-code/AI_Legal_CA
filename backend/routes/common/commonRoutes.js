const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  addClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} = require("../../controllers/common/clientController");

// Client Routes
router.post(
  "/clients",
  authMiddleware,
  roleMiddleware("ca", "lawyer", "hybrid"),
  addClient,
);
router.get(
  "/clients",
  authMiddleware,
  roleMiddleware("ca", "lawyer", "hybrid"),
  getClients,
);
router.get(
  "/clients/:id",
  authMiddleware,
  roleMiddleware("ca", "lawyer", "hybrid"),
  getClient,
);
router.put(
  "/clients/:id",
  authMiddleware,
  roleMiddleware("ca", "lawyer", "hybrid"),
  updateClient,
);
router.delete(
  "/clients/:id",
  authMiddleware,
  roleMiddleware("ca", "lawyer", "hybrid"),
  deleteClient,
);

module.exports = router;
