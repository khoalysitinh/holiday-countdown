import { handle } from '../../server/app.mjs';

export default (req) => handle(req);

export const config = { path: '/api/*' };
