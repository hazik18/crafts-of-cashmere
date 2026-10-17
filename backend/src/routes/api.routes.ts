import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller.js';
import { OrderController } from '../controllers/order.controller.js';
import { SubscriberController } from '../controllers/subscriber.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { UploadController } from '../controllers/upload.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { loginRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

/* Public Routes */
router.get('/catalog', CatalogController.getCatalog);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/subscribe', SubscriberController.subscribe);
router.post('/orders', OrderController.createOrder);

/* Admin Protected Routes */
router.use(requireAdmin);

router.get('/orders', OrderController.getOrders);
router.get('/subscribers', SubscriberController.getSubscribers);
router.post('/products', CatalogController.createProduct);
router.put('/products/:id', CatalogController.updateProduct);
router.delete('/products/:id', CatalogController.deleteProduct);
router.post('/upload', UploadController.upload);

export default router;
