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
  router.get('/user/get', controller.user.get);
  router.get('/user/login', controller.user.login);
  router.post('/user/update', middleware.auth(), controller.user.update);

  // instance
  router.post('/instance/add', controller.instance.add)
  router.get('/instance/get', controller.instance.get)

  // repo
  router.get('/repo/get', controller.repo.get)
  router.post('/repo/add', controller.repo.add)
  router.post('/repo/invite', middleware.auth(), controller.repo.invite)
  router.post('/repo/update', middleware.auth(), controller.repo.update)

  // goods 
  router.get('/goods/get', controller.goods.get)
  router.post('/goods/add', middleware.auth(), controller.goods.add)
  router.post('/goods/upload', middleware.auth(), controller.goods.upload)


};