const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const desc = `Идейные соображения высшего порядка, а также начало повседневной работы по формированию позиции
требуют определения и уточнения модели развития. Равным образом сложившаяся структура организации в значительной
степени обуславливает создание модели развития. `

router.get('/', (req, res) => {
  res.render('index');
});

router.get(['/tv', '/movie', '/corporate', '/wedding', '/special-makeup', '/show-business'], (req, res) => {
  let name;
  switch(req.path){
    case '/tv':
      name = 'Телевидение';
      descript = desc;
      break;
    case '/movie':
      name = 'Кино';
      descript = desc;
      break;
    case '/corporate':
      name = 'Корпоратив';
      descript = desc;
      break;
    case '/wedding':
      name = 'Свадьба';
      descript = desc;
      break;
    case '/special-makeup':
      name = 'Спецгрим';
      descript = desc;
      break;
    case '/show-business':
      name = 'Шоу-бизнес';
      descript = desc;
      break;
    default:
      descript = desc;
      name = "DEFAULT";
  }

  fs.readdir(path.join(__dirname, '../public/img/galery' + req.path), (err, images) => {
    if (err){
      console.log(err)
      res.render('index');
    }
    let category_obj = {
      name: name,
      description: descript,
      img_urls: images.map((url) => {
        return '/img/galery' + req.path + '/' + url
      })
    }
    res.render('category', {title: 'Студия "Кокон" | Услуги | ' + category_obj.name, category: category_obj});
  })
});



module.exports = router;
