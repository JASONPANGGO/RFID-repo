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
  router.post('/user/login', controller.user.login);
  router.post('/user/update', middleware.auth(), controller.user.update);
  router.post('/user/join', middleware.auth(), controller.user.join);
  router.post('/user/quit', middleware.auth(), controller.user.quit);

  // instance
  router.post('/instance/add', middleware.auth(), controller.instance.add)
  router.get('/instance/get', middleware.auth(), controller.instance.get)
  router.post('/instance/update', middleware.auth(), controller.instance.update)

  // repo
  router.get('/repo/get', middleware.auth(), controller.repo.get)
  router.post('/repo/add', middleware.auth(), controller.repo.add)
  router.post('/repo/invite', middleware.auth(), controller.repo.invite)
  router.post('/repo/update', middleware.auth(), controller.repo.update)

  // goods 
  router.get('/goods/get', middleware.auth(), controller.goods.get)
  router.post('/goods/add', middleware.auth(), controller.goods.add)
  router.post('/goods/update', middleware.auth(), controller.goods.update)
  router.post('/goods/delete', middleware.auth(), controller.goods.delete)

  // task
  router.get('/task/get', middleware.auth(), controller.task.get)
  router.post('/task/add', middleware.auth(), controller.task.add)
  router.post('/task/update', middleware.auth(), controller.task.update)
  router.post('/task/finish', middleware.auth(), controller.task.finish)

  // rfid
  router.get('/rfid/get', middleware.auth(), controller.rfid.get)
  router.post('/rfid/add', middleware.auth(), controller.rfid.add)
  router.post('/rfid/update', middleware.auth(), controller.rfid.update)

  // util
  router.post('/util/upload', middleware.auth(), controller.util.upload)

  // test
  router.get('/test/add', controller.test.add)

};