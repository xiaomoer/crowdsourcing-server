var express = require('express');
let router = express.Router();
let uuidv4 = require('uuid/v4');
let fs = require("fs");
let handle = require("../util/handleResponseError");
let Answer = require('../model/answer');
let Task = require('../model/task');

router.post('/upload', (req, res, next) => {
  const u_id = req.decoded._id; //获取用户_id
  const { t_id, answer, images } = req.body.data;
  // 第一步，进行文件上传
  console.log('开始响应！');
  const paths = [];
  console.log("图片长度", images.length);
  Answer.find({ author: u_id, task: t_id }, (err, rows) => {
    if(!err) {
      if(rows.length !== 0) {
        console.log(rows.length);
        res.json({ status: 8, error: '', data: '' });
      }else {
        try {
          for(let image of images) {
            let imageType = /^data:image\/(\w+);(\w+)/.exec(image.content);
            let fileName = uuidv4();
            let path = `public/upload/answerImage/${fileName}.${imageType[1]}`;
            console.log('图片路劲:', path);
            paths.push(path);
            let base64 = image.content.replace(/^data:image\/\w+;base64,/, "");
            let imageBuffer = new Buffer(base64, 'base64');
            fs.writeFileSync(path, imageBuffer);
          }
            // 如果不存在错误
          console.log("图片保存成功");
          new Answer({
            author: u_id,
            task: t_id,
            text: answer,
            img_src: paths
          }).save((err, result) => {
            console.log('创建回答成功');
            if(!err) {
              Task.findByIdAndUpdate(t_id, { $push: { answers_: result._id } }, ((err1, res1) =>{
                if(!err) {
                  console.log('更新task成功');
                  res.json({ status:0, data: '', error: '' })
                }
              }))
            }
          })
        } catch (error) {
          handle.handleServerError(res, '上传图片失败');
        }
      }
    }
  })
})

module.exports = router;