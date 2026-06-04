import { Router } from 'express';
import { createEntityController } from '../controllers/entityController.js';

/**
 * Builds a standard CRUD router for an entity.
 * @param {string} tableName
 * @param {string[]} fields - allowed create/update fields
 * @param {boolean} userScoped - scope records to authenticated user
 */
export function buildEntityRouter(tableName, fields, userScoped = true) {
  const router = Router();
  const ctrl = createEntityController(tableName, fields, userScoped);

  // GET    /api/<resource>
  router.get('/', ctrl.list);

  // GET    /api/<resource>/:id
  router.get('/:id', ctrl.getOne);

  // POST   /api/<resource>
  router.post('/', ctrl.create);

  // PUT    /api/<resource>/:id
  router.put('/:id', ctrl.update);

  // DELETE /api/<resource>/:id
  router.delete('/:id', ctrl.remove);

  return router;
}
