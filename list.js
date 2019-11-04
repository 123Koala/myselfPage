/*
* @Author: hp
* @Date:   2019-10-22 17:02:33
* @Last Modified by:   hp
* @Last Modified time: 2019-11-01 16:56:02
*/
const md5=require('md5')
const db=require('./model/dao.js')
const formatDate=require('formatDate')
const formidable=require('formidable')
const fs=require('fs')
var cacheFolder='public/images/uploadcache/'
const express=require('express')
const app=express()

const ejs=require('ejs')
app.set('view engine','ejs')

var bodyParser=require('body-parser')
var urlencodedParser=bodyParser.urlencoded({extended:false})

var session=require('express-session')
var NedbStore=require('nedb-session-store')(session)
app.use(session({
	secret:'keyboard cat',
	resave:false,
	saveUninitialized:true,
	cookie:{
		maxAge:24*60*60*1000
	},
	store:new NedbStore({
		filename:'path_to_nedb_persistance_file.db'
	})
}))

app.use('/public',express.static('./public/'))


// 首次登陆判断
app.get('/',(req,res)=>{
	if(req.session.user==''){
		res.render('login',{url:'http://10.25.160.18:8989/',user:'',url1:'http://10.25.160.18:8989/forgetPass'})
	}
	else{
		res.render('list',{user:req.session.user})
	}
	
})

// 登录
app.get('/sign',(req,res)=>{
	res.render('sign',{url:'http://10.25.160.18:8989/'})
})

app.post('/sign',urlencodedParser,(req,res)=>{
	let obj={
		name:req.body.user,
		pass:md5(req.body.pass)
	}
	db.insert('userInfo','vipuser',obj,(a)=>{
		res.redirect(302,'http://10.25.160.18:8989/')
	})
})

// 渲染list页面
app.get('/list',(req,res)=>{
	res.render('list',{user:req.session.user})
})

// 登录
app.post('/login',urlencodedParser,(req,res)=>{
	// console.log(req.body.pass)
	let obj={
		name:req.body.user,
		pass:md5(req.body.pass)
	}
	// console.log(obj)
	// console.log(obj.pass)
	db.query('userInfo','vipuser',obj,0,0,{},(a)=>{
		// console.log(a)
		if(a.length==0){
			res.render('login',{url:'http://10.25.160.18:8989/',user:'ggg'})
		}else{
			req.session.user=obj.name
			res.redirect(302,'http://10.25.160.18:8989/list')
		}
	})
})

// 返回登录
app.get('/back',(req,res)=>{
	req.session.user=''
	res.redirect(302,'http://10.25.160.18:8989/')
})


// 更改密码
app.get('/alterPass',(req,res)=>{
	res.render('alterPass')
})
app.post('/comfirnPass',urlencodedParser,(req,res)=>{
	if(req.session.user!=''){
		let user=req.session.user
		let pass=req.body.oldpass

		let obj={
			name:user,
			pass:md5(pass)
		}
		console.log(obj)
		db.query('userInfo','vipuser',obj,0,0,{},function(a){
			// console.log(a)
			if(obj.name==a.name&&obj.pass==a.pass){
				let msg={
					msg:'ok'
				}
				res.send(msg)
			}else{
				let msg={
					msg:'用户不存在！'
				}
				res.send(msg)
			}
		})
	}else{
		let user=req.body.user
		let pass=req.body.oldpass

		let obj={
			name:user,
			pass:md5(pass)
		}
		console.log(obj)
		db.query('userInfo','vipuser',obj,0,0,{},function(a){
			console.log(a)
			console.log(obj.name==a[0].name&&obj.pass==a[0].pass)
			if(obj.name==a[0].name&&obj.pass==a[0].pass){
				let msg={                                                                            
					msg:'ok'
				}
				res.send(msg)
			}else{
				let msg={
					msg:'用户不存在！'
				}
				res.send(msg)
			}
		})
	}
	
})
app.post('/alterPass',urlencodedParser,(req,res)=>{
	let user=req.session.user
	let user1=req.body.user
	let pass=req.body.oldpass
	let pass1=req.body.newpass

	if(user!=''){
		let obj={
			name:user,
			pass:md5(pass)
		}
		let obj1={
			pass:md5(pass1)
		}
		// console.log(obj1)
		db.update('userInfo','vipuser',obj,obj1,false,function(a){
			let msg={
				msg:'ok'
			}
			req.session.user=''
			res.send(msg)

		})
	}else{
		let obj={
			name:user1,
			pass:md5(pass)
		}
		let obj1={
			pass:md5(pass1)
		}
		// console.log(obj1)
		db.update('userInfo','vipuser',obj,obj1,false,function(a){
			let msg={
				msg:'ok'
			}
			// req.session.user=''
			res.send(msg)

		})
	}
	
	
})


// 首页获取信息
app.get('/getInfo',(req,res)=>{
	let mysort={"_id":-1}
	db.query('user','user',{},0,0,mysort,function(a){
		// console.log(a)
		res.send(a)
	})	
})

app.get('/getPic',(req,res)=>{
	db.query('picture','pic',{},0,0,{},function(a){
		// console.log(a)
		res.send(a)
	})
})

// 插入信息
app.post('/addInfo',urlencodedParser,(req,res)=>{
	let obj={
		user:req.session.user,
		con:req.body.con,
		date:formatDate(new Date())
	}

	// console.log(obj)

	db.insert('user','user',obj,function(a){
		a.push(obj)
		res.send(obj)
	})
})

// 删除
app.post('/delThis',urlencodedParser,(req,res)=>{
	let obj={
		user:req.body.user,
		con:req.body.con,
		date:req.body.date
	}
	db.delete('user','user',obj,false,function(a){
		// console.log(obj)
		let msg={
			msg:1
		}
		res.send(msg)
	})
})

// 分页
app.get('/pageList',(req,res)=>{
	let skip=req.query.page
	let mysort={"_id":-1}
	skip=parseInt(skip)-1
	db.query('user','user',{},skip*10,10,mysort,function(a){
		res.send(a)
	})
})

// 删除后添加一个
app.get('/addOne',(req,res)=>{
	db.query('user','user',{},9,1,{},function(a){
		res.send(a)
	})
})

// 照片墙
app.post('/upload',urlencodedParser,(req,res)=>{

	currentUser={
		id:123
	}
	var userDirPath=cacheFolder+currentUser.id
	if(!fs.existsSync(userDirPath)){
		fs.mkdirSync(userDirPath)
	}
	var form=new formidable.IncomingForm()
	form.encoding='utf-8'
	form.uploadDir=userDirPath
	form.keepExtensions=true
	form.maxFieldsSize=2*1024*1024
	form.type=true
	var displayUrl
	form.parse(req,function(err,fields,files){
		if(err){
			res.send(err)
			return
		}
		var extName=''
		switch(files.upload.type){
			case 'image/pjpeg':
			extName='jpg';
				break;
			case 'image/jpeg':
			extName='jpg';
				break;
			case 'image/png':
			extName='png';
				break;
			case 'image/x-png':
			extName='png';
				break;
		}
		if(extName.length===0){
			res.send({
				code:202,
				msg:'只支持png和jpg格式的图片'
			})
			return
		}else{
			var avatarName='/'+Date.now()+'wqh'+'.'+extName
			var newPath=form.uploadDir+avatarName
			displayUrl='http://10.25.160.18:8989/'+userDirPath+avatarName
			// fs.renameSync(files.upload.path,newPath)
			// res.send({
			// 	code:200,
			// 	msg:displayUrl
			// })

			 // var url=JSON.stringify(displayUrl)
             let obj={
                 user:req.session.user,
                 url:displayUrl
             }
             db.insert('picture','pic',obj,function(a){
               fs.renameSync(files.upload.path,newPath)
					res.send({
						code:200,
						msg:obj.url
					})
             })
		}
	})

}) 

app.get('/picList',(req,res)=>{
	let obj={
		user:req.session.user,
		url:req.query.url
	}
	db.query('picture','pic',{},0,0,{},function(a){
		res.send({
			code:200,
			msg:obj.url
		})
	})
})


// 忘记密码
app.get('/forgetPass',(req,res)=>{
	res.render('forgetPass')
})


app.listen('8989','10.25.160.18')