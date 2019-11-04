/*
* @Author: hp
* @Date:   2019-10-17 13:52:33
* @Last Modified by:   hp
* @Last Modified time: 2019-10-19 15:55:42
*/

// 引入模块和地址
var MongoClient=require('mongodb').MongoClient
var url="mongodb://localhost:27017/"
// var mongoose=require('mongoose')
// mongoose.connect('mongodb://localhost:27017');



//连接数据文件封装函数
function connect(callback){

	// url是传进来的数据库连接地址
		MongoClient.connect(url,{ useNewUrlParser: true},function(err,db){
			if(err) throw err;
			callback(db)
		})
}

// 增
// db是传进来的数据库形参,col是集合,obj是数据,callback是回调信息
module.exports.insert=function(db,col,obj,callback){
	connect(function(a){
		var dbo=a.db(db)

		//判断插入的数据是否为数组,如果不是则变成数组形式
		if(!(obj instanceof Array)){
			obj=[obj]
		}

		// 执行插入语句
		dbo.collection(col).insertMany(obj,function(err,res1){
			if(err) throw err;
			a.close()
			callback(res1.ops)
		})
	})
}

// 查
// ,obj,skip,limit
module.exports.query=function(db,col,obj,skip,limit,sort,callback){
	connect(function(a){
		var dbo=a.db(db)
		// var obj={obj}
		dbo.collection(col).find(obj).skip(skip).limit(limit).sort(sort).toArray(function(err,result){
			if(err) throw err
			a.close()
			callback(result)
		})
	})
}

// 改
module.exports.update=function(db,col,obj,upObj,del,callback){
	connect(function(a){
		var dbo=a.db(db)
		var whereStr=obj
		var updateStr={$set:upObj}
		if(del==false){
			dbo.collection(col).updateOne(whereStr,updateStr,function(err,res){
				if(err) throw err
				a.close()
				callback(res)
			})
		}else{
			dbo.collection(col).updateMany(whereStr,updateStr,function(err,res){
				if(err) throw err
				a.close()
				callback(res)
			})
		}
		
	})
}

// 删
module.exports.delete=function(db,col,obj,del,callback){
	connect(function(a){
		var dbo=a.db(db)
		var whereStr=obj
		if(del==false){
			dbo.collection(col).deleteOne(whereStr,function(err,res){
				if(err) throw err
				a.close()
				callback(res.result)
			})
		}else{
			dbo.collection(col).deleteMany(whereStr,function(err,res){
				if(err) throw err
				a.close()
				callback(res)
			})
		}
	})
}