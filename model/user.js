const mongoose = require('./db');

const userSchema = mongoose.Schema({
  user_id: { type: String, required: true },
  password_hash: { type: String, required: true },
  sex: { type: Number, enum: [0, 1] },
  email: { type: String },
  confirmed: { type: Boolean, default: false },
  token: { type: String, default: '' },
  profile: { type: String },
  good_at: [{ type: String }],
  tasks_publih: [{
    t_id: { type: String },
    status: { type: Number, enum: [1,2,3] }
  }],
  tasks_receive: [{
    t_id: { type: String },
    status: { type: Number, enum: [1,2,3] }
  }],
  account: {
    total: { type: Number, default: 0},
    history: [{
      offset: { type: Number }
    }]
  }
})


const User = mongoose.model('User', userSchema);

module.exports = User;


// 用户的基本信息
// 用户名，密码，绑定邮箱，是否绑定了邮箱，
// 发送的token
// 个人简介
// 性别
// 擅长任务类型
// 发布的任务
// 接收的任务
// 个人成就
// 所获悬赏
// 

// 还包括成就集合和账单集合，这里暂时不创建了