import express from "express";
import { getTicketmasterEvents } from "../controllers/eventController.js";

const router = express.Router();

router.get("/ticketmaster", getTicketmasterEvents);

export default router;

