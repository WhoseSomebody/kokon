const router = require('express').Router();
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const parseString = require('xml2js').parseString;
const formidable = require('formidable');
const util = require('util');
const fs   = require('fs-extra');
const sharp   = require('sharp');
const Gallery = require('../models/gallery');
const Info = require('../models/info');

const desc = `Идейные соображения высшего порядка, а также начало повседневной работы по формированию позиции
требуют определения и уточнения модели развития. Равным образом сложившаяся структура организации в значительной
степени обуславливает создание модели развития. `

router.get('/', (req, res) => {
  Info.findOne({}, (err,info) => {
    if (err) {
      console.log(err);
      res.status(500);
    }
    res.render('index', {
      numbers: info ? info.numbers : ["+38 067 406 82 44","+38 067 985 48 25"] 
    });
  });
});

router.post('/sms', bodyParser.urlencoded({ extended: false }), (req, res) => {
  Info.findOne({}, (err,info) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      let mynumber = info ? info.numbers[0].split(" ").join("").substring(1) : "380674068244";
      let name = req.body.name,
      number = ("38" + req.body.number).match(/\d/g).join("");
      let body_sms =`
        <?xml version="1.0" encoding="utf-8"?>
        <request>
          <operation>SENDSMS</operation>
          <message start_time=" AUTO " end_time=" AUTO " lifetime="4" rate="120" desc="" source="KOKON">
            <body>На сайте kokon.co.ua новый запрос.\n`+ name +`\n+`+ number +`</body> 
            <recipient>`+ mynumber + `</recipient>
          </message>
        </request>
        `;    
      let options = {
        host: 'sms-fly.com',
        path: '/api/api.php',
        method: 'POST',
        headers: {
          'Authorization': 'Basic secureCode',
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
      'Authorization': 'Basic secureCode',
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
  Gallery.findOne({id: req.path.split("/")[1]},  (err, gallery) => {
    if (err) {
      console.log(err);
      res.status(404);
    }
    let name = gallery.name,
        description = gallery.description,
        title = gallery.pageTitle,
        metaDescription = gallery.metaDescription,
        keywords = gallery.keywords;
    let category_obj = {
      name: name,
      description: description,
      img_urls: gallery.image_urls
    }
    Info.findOne({}, (err,info) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      res.render('category', {
        title: 'Студия "Кокон" | Услуги | ' + category_obj.name, 
        category: category_obj,
        numbers: info ? info.numbers : ["+38 067 406 82 44","+38 067 985 48 25"] 
      });    
    });
  })
});

router.get('/login', (req, res) => {
  if (req.session.login)
    res.redirect('content-editor')
  else  
    Info.findOne({}, (err,info) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      res.render('login', {
        numbers: info ? info.numbers : ["+38 067 406 82 44","+38 067 985 48 25"],
        title: 'Студия "Кокон" | Вход в админ панель'
      });
    });
})

router.post('/login', (req, res) => {
  if (req.body.login == "LOGIN" && req.body.password == "PASSWORD"){
    req.session.login = true;
    req.session.wrongLogin = false;    
    res.redirect('/content-editor');
  } else {
    req.session.wrongLogin = true;
    res.redirect('/login');
 }
})

router.get('/logout', (req, res) => {
  console.log(req.session.login);
  if (req.session.login) {
    req.session.login = undefined;
    console.log(req.session.login);
    res.redirect('/');
  } else {
    res.redirect('back');
  }
})

router.get('/content-editor', (req, res) => {
  if (req.session.login) {
    Info.findOne({}, (err,info) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      Gallery.find({}, (err, categories) => {
        if (err) {
          console.log(err);
          res.status(500);
        }
        // console.log(categories);
        res.render('content-editor', {
          categories: categories,
          numbers: info ? info.numbers : ["+38 067 406 82 44","+38 067 985 48 25"],
          title: 'Студия "Кокон" | Админ панель',
          login: true
        });

      });
    });
  } else {
    res.redirect('/login');
  }
})

router.post('/update-order', (req, res) => {
  if (req.body.toRemove) {
    if (fs.existsSync("public/" + req.body.toRemove)) {
       fs.unlinkSync("public/" + req.body.toRemove);
    }
  }
  Gallery.findOne({id:req.body.category}, (err, category) => {
        if (err) {
          console.log(err);
          res.status(500);
        }
        category.image_urls = req.body.urls;
        category.save((err, cat) => {
          if (err) {
            console.log(err);
            res.status(500);
          }
        })
        res.status(200);
      });
})

router.post('/update-numbers', (req, res) => {
   Info.findOne({}, (err,info) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      info.numbers = req.body.numbers;
      info.save((err, info) => {
        if (err) {
          console.log(err);
          res.status(500);
        }
      })
      // console.log(info);
      
      res.status(200);
    });
})

router.post('/upload_new', (req, res) => {
  let category;
  let form = new formidable.IncomingForm();
  form.multiples = true;
  form.parse(req, function(err, fields, files) {
    category = fields.id;
    // res.writeHead(200, {'content-type': 'text/plain'});
    // res.write('received upload:\n\n');
    // res.end(util.inspect({fields: fields, files: files}));
    
  });

  form.on('field',function(name,value){

  });



  form.on('end', function(fields, files) {
    Gallery.findOne({id: category},  (err, Gallery) => {
      if (err) {
        console.log(err);
        res.status(404);
      }
      for(var x in this.openedFiles)
      {
        let temp_path = this.openedFiles[x].path
            file_name = this.openedFiles[x].name,
            new_location = 'public/img/gallery/' + category + "/";
        if (file_name.split('.').pop() != "jpg") {
          file_name = file_name.split('.')[0] + ".jpg";
        }

        Gallery.image_urls.push(new_location.split('/').slice(1).join("/") + '/' + file_name)    

        sharp(temp_path)
          .withoutEnlargement(true)
          .resize(1200,1200)
          .max()
          .toFormat('jpeg', {
            optimizeScans: true
          })
          .toFile(new_location + file_name, (err, info) => {console.log(info)});

        // fs.copy(temp_path, new_location + file_name, function(err) {  
        //   if (err) {
        //     console.log(err);
        //   }
        // });//fscopy
      }//for loop
      Gallery.save((err, gal)=>{
        if (err) {
          console.log(err);
        }
        // console.log(gal);
        res.redirect('back');
      })
      
    })
        
  });//form end
  // res.send('Done!!');
})

module.exports = router;

