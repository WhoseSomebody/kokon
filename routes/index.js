const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const parseString = require('xml2js').parseString;

const desc = `Идейные соображения высшего порядка, а также начало повседневной работы по формированию позиции
требуют определения и уточнения модели развития. Равным образом сложившаяся структура организации в значительной
степени обуславливает создание модели развития. `

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/prices', (req, res) => {
  res.render('prices', {
    title: "Цены"
  });
});
router.post('/sms', bodyParser.urlencoded({ extended: false }), (req, res) => {
  let mynumber = '380676903121';
  let name = req.body.name,
      number = ("38" + req.body.number).match(/\d/g).join("");
  let body_sms =`
    <?xml version="1.0" encoding="utf-8"?>
    <request>
      <operation>SENDSMS</operation>
      <message start_time=" AUTO " end_time=" AUTO " lifetime="4" rate="120" desc="" source="KOKON">
        <body>На сайте kokon.co.ua поступил новый запрос от клиента.\n`+ name +`\n+`+ number +`</body> 
        <recipient>`+ mynumber + `</recipient>
      </message>
    </request>
    `;    
  let options = {
    host: 'sms-fly.com',
    path: '/api/api.php',
    method: 'POST',
    headers: {
      'Authorization': 'Basic  MzgwOTU2MjUxNTI3Om9waXVtMTE=',
      'Content-Type': 'text/xml',
      'Accept': 'text/xml'
    }
  };

  let httpreq = http.request(options, function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      parseString(chunk, function (err, result) {
          console.dir(result.message);
          send_balance(mynumber)
      });
    });
  });
  httpreq.write(body_sms);
  httpreq.end();
});

function send_balance(number) {
  let body_balance = `
    <?xml version="1.0" encoding="utf-8"?>
    <request>
      <operation>GETBALANCE</operation>
    </request>`;
  
  let options = {
    host: 'sms-fly.com',
    path: '/api/api.php',
    method: 'POST',
    headers: {
      'Authorization': 'Basic  MzgwOTU2MjUxNTI3Om9waXVtMTE=',
      'Content-Type': 'text/xml',
      'Accept': 'text/xml'
    }
  };

  let httpreq_balance = http.request(options, function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      parseString(chunk, function (err, result) {
        if (result.message.balance[0] < 10){
          console.dir(result.message.balance[0]);
          let body_sms =`
              <?xml version="1.0" encoding="utf-8"?>
              <request>
                <operation>SENDSMS</operation>
                <message start_time=" AUTO " end_time=" AUTO " lifetime="4" rate="120" desc="" source="KOKON">
                  <body>На счете kokon.co.ua осталось `+ (result.message.balance[0] - 0.498) + ` грн.\nЭто еще около `+ parseInt(((result.message.balance[0]-0.498)/0.25)) + ` сообщений.\nПополните счет.</body> 
                  <recipient>`+ number + `</recipient>
                </message>
              </request>`;      
          let httpreq = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
              parseString(chunk, function (err, resl) {
                  console.dir(`На счете осталось `+ (result.message.balance[0] - 0.498) + `грн.\n Это еще около `+ parseInt(((result.message.balance[0]-0.498)/0.25)) + ` сообщений.`);
              });
            });
          });
          httpreq.write(body_sms);
          httpreq.end();     
        }
      });
    });
    response.on('end', function() {
    })
  });
  httpreq_balance.write(body_balance);
  httpreq_balance.end();  
}

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
