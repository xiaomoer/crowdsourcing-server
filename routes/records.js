const express = require('express');
const handle = require('../util/handleResponseError');
const Record = require('../model/record');
const Task = require('../model/task');
const User = require('../model/user');

const router = express.Router();
const SU_ID = '5ad17820fcc7a4b2a8ae1d80';

router.post('/pay', (req, res, next) => {
  const { count, offset, t_id } = req.body.data;
  const _id = req.decoded._id; // 这是用户的id
  // 进行用户扣费，创建交易记录，修改任务状态
  
  User.findById(_id, (err, user) => {
    if(err) {
      handle.handleServerError(res);
    }else {
      if(user.account < count*offset) {
        // 此时余额不足无法支付
        res.json({ status: 7, error: '', data: '' })
      }else {
        user.account = user.account - count*offset;
        user.save((err, user) => {
          if(err) {
            handle.handleServerError(res);
          }else {
            new Record({
              offset: offset,
              count: count,
              send: _id,
              receive: SU_ID,
              status: 0,
              date: Date.now(),
              ref: t_id,
              type: 1
            }).save((err, record) => {
              if(err) {
                handle.handleServerError(res)
              }else {
                // 更新任务状态，把订单添加到user的records字段下
              Task.findByIdAndUpdate(t_id, { status: 0 }).exec().then(() => {
                User.findByIdAndUpdate(_id, { $push: { records: record._id } }).exec().then(() => {
                  res.json({ data: '', status: 0, error: '' })
                })
              }).catch(() => {
                handle.handleServerError(res);
              })
              }
            })
          }
        })
      }
    }
  })
  
})


router.get('/latest', (req, res, next) => {
  let _id = req.decoded._id; // 用户的_id
  let timeBase = Date.now() - 24 * 3600000; // 基准时间戳
  Record
    .find({ date: { '$gte': timeBase }})
    .populate('send', '-password_hash')
    .populate('receive', '-password_hash')
    .sort({ date: -1 }) // 时间降序排序
    .exec((err, records) => {
      if(err) {
        handle.handleServerError(res);
      }else {
        console.log(records.length);
        let sendList = [];
        let receiveList = [];
        // 如果是充值的话，是没有send这个字段的；如果是提现，也没有receive这个字段
        for(let record of records) {
          if( record.send && record.send._id == _id ) {
            sendList.push(record);
          }
          if(record.receive && record.receive._id == _id) {
            receiveList.push(record);
          }

        }
        res.json({ status: 0, error: '', data: { sendList, receiveList } })
      }
    })
});


module.exports = router;
