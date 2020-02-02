'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {
    router,
    controller,
    middleware
  } = app;

  router.get('/', controller.home.index);

  // user
  router.get('/get', controller.user.get);
  router.get('/login', controller.user.login);

  // instance
  router.post('/instance/add', controller.instance.add)
  router.get('/instance/get', controller.instance.get)

  // shop
  router.get('/repo/get', controller.repo.get)
  router.post('/repo/add', controller.repo.add)

  // goods 
  router.get('/goods/get', controller.goods.get)
  router.post('/goods/add', middleware.auth(), controller.goods.add)
};