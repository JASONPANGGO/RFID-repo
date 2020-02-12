module.exports = {
  character: [{
      value: 0,
      name: '未加入仓库'
    },
    {
      value: 1,
      name: '创建者'
    },
    {
      value: 2,
      name: '管理员'
    },
    {
      value: 3,
      name: '员工'
    }
  ],
  repo_status: [{
      value: 0,
      name: '废弃'
    },
    {
      value: 1,
      name: '在用'
    }
  ],
  task: [{
      value: 0,
      name: '商品出库',
      text: '商品出库'
    },
    {
      value: 1,
      name: '商品入库',
      text: '商品入库'
    },
    {
      value: 2,
      name: '加入仓库',
      text: '加入仓库'
    },
    {
      value: 3,
      name: '退出仓库',
      text: '退出仓库'
    }
  ],
  status: [{
    value: 0,
    text: '新任务',
    tag_type: 'danger'
  }, {
    value: 1,
    text: '进行中',
    tag_type: 'primary'
  }, {
    value: 2,
    text: '已完成',
    tag_type: 'success'
  }, {
    value: 3,
    text: '已终止',
    tag_type: 'default'
  }]
}