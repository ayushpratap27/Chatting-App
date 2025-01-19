import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getAllContacts, getContactsForDMList, searchContacts } from '../controllers/contact.controller.js';


const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDMList);
contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;