import { Router } from 'express';

const routes: Router[] = [];

const v1Routes = Router();

routes.forEach((route) => v1Routes.use(route));

export default v1Routes;


/**
 * module/module_name
 * module_name.controllers.ts //with comes with template and resolve dependency
 * module_name.services.ts //with comes with template and resolve dependency
 * module_name.middlewares.ts //with comes with template and resolve dependency
 * module_name.routes.ts //with comes with template and resolve dependency
 * module_name.schemas.ts
 * module_name.model.ts //basic import like mongoose,model etc
 * module_name.dto.ts
 * module_name.types.ts
 * module_name.container.ts //resolved all dependency and also add it to ./src/container.ts const registerContainers = () => {
  // all module container will be registered here
};

export default registerContainers;
 */