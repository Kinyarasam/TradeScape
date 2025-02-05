import { Router } from "express";
import TradeController from "../controllers/tradeController";

const router = Router();

router.get("/", TradeController.fetchTrades.bind(TradeController))

export default router;
