'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    console.log('home')
    ctx.body = 'hi, egg';
  }
}

module.exports = HomeController;
