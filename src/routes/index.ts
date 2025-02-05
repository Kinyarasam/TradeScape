import { Router } from "express";
import TradeController from "../controllers/tradeController";
import UserController from "../controllers/userController";
import AuthController from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Auth
router.post("/register", AuthController.register.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.post("/profile", authenticateToken, AuthController.getProfile.bind(AuthController));

router.post("/register", UserController.registerUser.bind(UserController));

router.get("/trades", TradeController.fetchTrades.bind(TradeController));

export default router;
