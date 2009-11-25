﻿// JavaScript Document
var Upload = {
	Code : function(){
		var c = "";
		c += "<div style=\"border: 1px solid #7FCAE2; padding:10px 10px 10px 10px; max-height:200px; overflow:auto\">";
		c += "<div id=\"static\">";
		  c += "<div id=\"staticHead\" style=\"border-bottom:1px solid #E6E7E1; line-height:30px; color:#444; font-weight:700; font-size:12px; height:30px; text-align:right\"><span style=\"float:left\">PJBlog上传程式</span><a href=\"javascript:;\" onclick=\"$('pjblogdoupload').parentNode.removeChild($('pjblogdoupload'))\" class=\"close\" style=\"width:12px;height:12px;\">&nbsp;&nbsp;&nbsp;</a></div>";
		c += "<div id=\"staticBody\" style=\"margin-top:10px\">";
		c += "<div id=\"UploadMessageText\"><div id=\"uploadContenter\" style=\"\"></div></div>";
		c += "</div>";
		c += "</div>";
		c += "</div>";
		c += "<iframe style=\"display:none\" name=\"pjblogUploader\"></iframe>";
		return c;
	},
	open : function(obj, inputID, ReturnType, Path, fcount){
		Box.selfWidth = true;
		Box.selefHeight = false;
		Box.offsetBoder.Border = 0;
		var AjaxUp = null;
		var c = Box.FollowBox($(inputID), $("Message").offsetWidth, 0, 5, this.Code());
		this.showUpload(obj, inputID, ReturnType, Path, fcount);
		c.id = "pjblogdoupload";
		c.style.cssText += "; text-align:left!important; background:#ffffff; top:" + (parseInt(c.style.top.replace("px", "")) + 4) + "px; left:" + (parseInt(c.style.left.replace("px", "")) + 2) + "px";
	},
	ShowFilesBox : function(id){
		Ajax({
		  url : "../pjblog.logic/log_Ajax.asp?action=GetArticledownloadInfo&id=" + escape(id) + "&s=" + Math.random(),
		  method : "GET",
		  content : "",
		  oncomplete : function(obj){
				var div = obj.responseText.json();
				try{
					var c = document.createElement("div");
					$("AttUpload").appendChild(c);
					c.id = "ArticleAttmentBox";
					c.innerHTML = div.Info;
				}catch(e){}
		  },
		  ononexception:function(obj){
			  alert(obj.state);
		  }
		});
	},
	DelFile : function(id){
		var _id = id;
		Ajax({
		  url : "../pjblog.logic/log_Ajax.asp?action=delfile&id=" + escape(id) + "&s=" + Math.random(),
		  method : "GET",
		  content : "",
		  oncomplete : function(obj){
				var div = obj.responseText.json();
				try{
					if (div.Suc){
						$("upBox_" + _id).parentNode.removeChild($("upBox_" + _id));
						var n = $("upload").value;
						$("upload").value = n.replace("{" + _id + "}", "");
						Tip.CreateLayer("恭喜 操作成功", "删除附件成功<br /><font color=red>请将文本框中对应的UBB标签手动删除!</font>");
					}else{
						Tip.CreateLayer("错误信息", div.Info);
					}
				}catch(e){}
		  },
		  ononexception:function(obj){
			  alert(obj.state);
		  }
		});
	},
	showUpload : function(obj, inputID, ReturnType, Path, fcount){
		/*
			@ obj				对象 一般为 this
			@ inputID			文本框ID
			@ ReturnType		返回类型 0
			@ Path				保存路径
			@ fcount			最大上传文件数
		*/
		try{
			AjaxUp.reset();
		}catch(ex){}
		//创建Uploader，参数Contenter	字符串	上传控件的容器，程序自动给容易四面增加3px的padding
		AjaxUp = new AjaxProcesser("uploadContenter");
		
		//设置提交到的iframe名称
		AjaxUp.target = "pjblogUploader";
		
		AjaxUp.processID = "pjblog";
		
		//上传处理页面
		AjaxUp.url = "../pjblog.logic/log_upload.asp"; 
		
		//上传处理页面
		AjaxUp.MaxFileCount = (isNaN(fcount) ? 999: fcount);
		
		//保存目录
		AjaxUp.savePath = (Path ? Path: "../upload");  
		
		//上传成功时运行的程序
		AjaxUp.succeed = function(files){
			//下面遍历所有的文件，files是一个数组，数组元素的数目就是上传文件的个数，每个元素包含的信息为文件名字和文件大小
			var info = "";
			for(var i = 0 ; i < files.length ; i++){
				//info += files[i].path + ";";
				var eviopath = files[i].path;
				var attid = files[i].attid;
				try{$("upload").value += "{"+attid+"}"}catch(e){}
				var eviotype = eviopath.substr(eviopath.lastIndexOf("."), eviopath.length);
				var ctypes = eviotype.replace(".", "").toLowerCase();
				addUploadItem(ctypes, eviopath, temp);
			}
			//info = info.substr(0, info.length - 1);
			//$(inputID).value = $(inputID).value + info; 
			//$('pjblogdoupload').parentNode.removeChild($('pjblogdoupload'));
		}
		
		//上传失败时运行的程序
		AjaxUp.faild=function(msg){
			alert("失败原因:" + msg)
		}
	}
}
/*主JS文件*/
function AjaxProcesser(objID){
	this.target = "";
	this.defaultStyle = false;
	this.interValID = 0;//计时器ID
	this.timeTick = 300; //进程查询时间间隔
	this.processID = "pjblog";//进程ID
	this.frm = null;//表单
	this.submit = null;//提交按钮\
	this.processIng = null;
	this.processBar = null;//进度条
	this.process = null;//进度
	this.processInfo = null;//进度详细信息
	this.uploader = null;//隐藏iframe
	this.split = null;//用于添加一个文件的标示
	this.appendTo = $(objID);//容器
	this.appendTo.style.cssText = "padding:3px";//容器样式
	this.files = {count:0};//文件集合
	this.createUploader();//创建AJAX上传对象
	this.startTime = 0;//上传开始时间	
	this.files = {count:0,list:{}};
	this.url = "";
	this.savePath = "";
	this.FileCount = 1;
	this.MaxFileCount = 999;
}
AjaxProcesser.prototype.succeed=function(a){
	return;
};
AjaxProcesser.prototype.faild=function(a){
	return;
};
AjaxProcesser.prototype.addFile=function(){  //对象方法--添加一个文件
	if(this.FileCount >= this.MaxFileCount){alert("超过允许的最大文件上传数量;"); return;}
	_this = this;
	var file = document.createElement("input");//创建一个文件域
	file.type = "file";
	file.name = "file" + getID();
	file.size = 40;
	if(!this.defaultStyle){file.className = "text";}
	var b = document.createElement("br");
	this.frm.insertBefore(b, this.split);
	this.frm.insertBefore(file, this.split);//添加到表单	
	var remove = document.createElement("input");//生成一个移除按钮
	remove.value = "移除";
	remove.type = "button";
	if(!this.defaultStyle){remove.className = "text";}
	remove.onclick = function(){
		_this.frm.removeChild(this.previousSibling.previousSibling);
		_this.frm.removeChild(this.previousSibling);
		_this.frm.removeChild(this);
		_this.FileCount--;
	};
	this.frm.insertBefore(remove,this.split);//添加到表单
	this.FileCount++;
};
AjaxProcesser.prototype.reset = function(){
	while(this.appendTo.childNodes){
		this.appendTo.removeChild(this.appendTo.lastChild);
	}
};
AjaxProcesser.prototype.createUploader = function(){
	_this = this;
	var frm = document.createElement("form");//创建form表单
	frm.method = "post";
	frm.encoding = "multipart/form-data";
	frm.style.cssText = "padding:0px;margin:0px;";
	var file = document.createElement("input");//创建一个文件域
	file.type = "file";
	file.name = "file" + getID();
	file.size = 40;
	if(!this.defaultStyle){file.className = "text";}
	this.files[file.name] = file; //添加到文件集合
	frm.appendChild(file);//添加到表单
	var split = document.createElement("br")
	frm.appendChild(split);//创建一个换行,此换行作为添加文件的标示
	this.split = split;

	var button = document.createElement("input");//创建一个按钮,用于上传
	button.value = "上传";
	button.type = "button";
	if(!this.defaultStyle){button.className = "text";}
	button.onclick = function(){
		_this.processID = "pjblog" + getID();
		var action = "";
		action = _this.url + "?path=" + _this.savePath + "&processid=" + _this.processID;
		_this.frm.action = action;
		_this.frm.target = _this.target;
		_this.frm.submit();
		_this.startTime = Date.parse(new Date());
		_this.processDiv.style.display = "block";
		_this.interValID = window.setInterval("_this.getProcess()", _this.timeTick);
	};
	var add=document.createElement("input");//创建一个按钮
	add.value = "添加更多文件";
	add.type = "button";
	if(!_this.defaultStyle){add.className = "text";}
	add.onclick = function(){
		_this.addFile();
	};
	frm.appendChild(button);//把按钮添加到表单
	frm.appendChild(add);//把按钮添加到表单
	this.frm = frm;
	this.appendTo.appendChild(frm);//把表单添加到容器中
	
	var processDiv = document.createElement("div");//创建第二个容器来容纳信息
	processDiv.style.cssText = "display:none;padding:3px;font-size:9pt;border:1px #A69588 solid;width:406px;margin:5px 2px 2px 0px;";
	
	var processIng = document.createElement("div");//创建进度详细信息显示
	processIng.style.cssText = "padding:2px 5px 2px 1px;font-size:9pt;margin:0px;";
	processIng.innerHTML = "进度";
	this.processIng = processIng;
	processDiv.appendChild(processIng);//把进度详细信息显示添加到容器
	
	var processBar = document.createElement("div");//创建一个进度条
	processBar.style.cssText = "font-size:9pt;width:400px;padding:0px;margin:0px;height:auto;border:1px #dddddd solid;background-color:#eeeeee;";
	var process = document.createElement("div");//创建进度
	process.style.cssText = "font-size:9pt;text-align:center;background-color:#aaaaaa;width:0px;height:13px;padding:1px 0px 0px 2px;"
	//process.innerHTML="0.00%";
	this.process = process;
	processBar.appendChild(process);//把进度添加到进度条
	this.processBar = processBar;
	processDiv.appendChild(processBar);//把进度条添加到容器
	
	var processInfo = document.createElement("div");//创建进度详细信息显示
	processInfo.style.cssText = "padding:2px 5px 2px 1px;font-size:9pt;"
	this.processInfo = processInfo;
	processDiv.appendChild(processInfo);//把进度详细信息显示添加到容器
	this.processDiv = this.appendTo.appendChild(processDiv);
};

/*获取上传进程*/
AjaxProcesser.prototype.getProcess = function(){
	var json = unescape(cookie.GET(this.processID));
	//alert(unescape(json));
	msg = json.json();
	if (msg == null){return;}
	var pro = this.getInformation(msg);            //这里返回所有的上传信息,想显示那写信息可以自由决定
	var str = "";
	var img = "∵∴";
	if(pro.finish){img = "<span style=\"font-weight:bold;color:green;\">√ ";}
	if(pro.step == "faild"){img = "<span style=\"font-weight:bold;color:red;\">×";}
	this.processIng.innerHTML = str + img + pro.alt + "</span>";
	str = str + "总大小:" + reSize(pro.total);
	str = str + "&nbsp; <span style=\"color:green;\">已上传:" + reSize(pro.cur) + "</span>";
	str = str + "&nbsp; <span style=\"color:red;\">上传速度:" + pro.speed + "</span>";
	this.processInfo.innerHTML = str;
	this.process.innerHTML = pro.percent;
	this.process.style.width = Math.floor(398 * pro.process) + "px"; //显示进度
	if(pro.finish){
		this.frm.reset();
		window.clearInterval(_this.interValID);
		if(pro.step == "faild"){
			this.faild(pro.msg);
		}
		if(pro.step == "saved"){
			this.succeed(pro.msg);
		}
	}
//	_this = this;
//	Ajax({
//        url:"../getProcess.asp?processid=" + this.processID,
//        method:"POST",
//        oncomplete:function(msg){
//	    msg = msg.responseText.json();
//	    if(msg == null){return;}
//            var pro=_this.getInformation(msg);            //这里返回所有的上传信息,想显示那写信息可以自由决定
//            var str="";
//            var img="∵∴";
//            if(pro.finish){img="<span style=\"font-weight:bold;color:green;\">√ ";}
//            if(pro.step=="faild"){img="<span style=\"font-weight:bold;color:red;\">×";}
//            _this.processIng.innerHTML= str + img + pro.alt + "</span>";
//            str= str + "总大小:" + reSize(pro.total);
//            str= str + "&nbsp; <span style=\"color:green;\">已上传:" + reSize(pro.cur) + "</span>";
//			str= str + "&nbsp; <span style=\"color:red;\">上传速度:" + pro.speed + "</span>";
//            _this.processInfo.innerHTML= str;
//            _this.process.innerHTML=pro.percent;
//            _this.process.style.width=Math.floor(398 * pro.process) + "px"; //显示进度
//            if(pro.finish){
//				_this.frm.reset();
//				window.clearInterval(_this.interValID);
//				if(pro.step=="faild"){
//					_this.faild(pro.msg);
//				}
//				if(pro.step=="saved"){
//					_this.succeed(pro.msg);
//				}
//            }
//        }
//    });
};

/*获取上传信息*/
AjaxProcesser.prototype.getInformation=function(info){
    //信息对象,请不要修改
    var uploadInfo={
        ID:info.ID,         //上传的进程ID
        stepId:0,
        step:info.step,     //上传进程的英文提示
        DT:info.dt,         //上传进程时间
        total:info.total,   //上传的总数据大小(字节)
        cur:info.now,       //已经上传的数据大小
		speed:reSize(parseInt(info.now/((Date.parse(new Date())-this.startTime)/1000))) + "/秒",
        process:(Math.floor((info.now / info.total) * 100) / 100),  //上传进度的小数形式,用于进度条
        percent:(Math.floor((info.now / info.total) * 10000) / 100) + "%", //进程进度的百分比形式
        alt:"",             //上传进程的中文提示
        msg:"",             //用于显示额外信息,例如错误原因等
        finish:false        //是否已经完成
    };
    /*状态说明*/
    switch(info.step){
        case "":
            uploadInfo.alt="正在初始化上传...";
            uploadInfo.stepId=1;
            break;
        case "uploading":
            uploadInfo.alt="正在上传...";
            uploadInfo.stepId=2;
            break;
        case "uploaded":
            uploadInfo.alt="上传完毕,服务器处理数据中...";
            uploadInfo.stepId=3;
            break;
        case "processing":
            uploadInfo.alt="正在处理文件: " + info.description;
            uploadInfo.stepId=4;
            break;
        case "processed":
            uploadInfo.alt="处理数据完毕,准备保存文件...";
            uploadInfo.stepId=5;
            break;
        case "saving":
            uploadInfo.alt="正在保存文件: " + info.description;
            uploadInfo.stepId=6;
            break;
        case "saved":
            uploadInfo.alt="文件保存完毕,上传成功!";
			uploadInfo.msg=eval("[" + info.description.substr(0,info.description.length-1) + "]")
			uploadInfo.stepId=7;
            uploadInfo.finish=true;
            break;
        case "faild":
            uploadInfo.alt="上传失败!";
            uploadInfo.msg=info.description;
            uploadInfo.stepId=8;
            uploadInfo.finish=true;       
            break;
        default:
            uploadInfo.alt="无此操作!";
            uploadInfo.stepId=9;
            uploadInfo.finish=true;
    }
    return uploadInfo;
}


/*格式化数据*/
var reSize =function (num){
    var Size=parseInt(num);
    var res="";
    if(Size < 1024){
       res= Math.floor(Size * 100) /100 + "B"
    }else if(Size >= 1024 && Size < 1048576){
       res= Math.floor((Size / 1024) * 100) /100  + "KB"
    }else if(Size >= 1048576){
       res= Math.floor(((Size / 1024) / 1024) *  100) /100 + "MB"
    }
    return res;
};


/*生成上传ID*/
var getID=function (){
    var mydt=new Date();
    with(mydt){
        var y=getYear();if(y<10){y='0'+y}
        var m=getMonth()+1;if(m<10){m='0'+m}
        var d=getDate();if(d<10){d='0'+d}
        var h=getHours();if(h<10){h='0'+h}
        var mm=getMinutes();if(mm<10){mm='0'+mm}
        var s=getSeconds();if(s<10){s='0'+s}
    }
    var r="000" + Math.floor(Math.random() * 1000);
    r=r.substr(r.length-4);
    return y + m + d + h + mm + s + r;
};



//插入上传附件
function addUploadItem(type,path,memberDown){
	var EditType=""
	try{
	  var oEditor = parent.FCKeditorAPI.GetInstance('Message')
	  EditType="FCkEditor"
	  var hrefLen=location.href.lastIndexOf("/")
      var Fhref=location.href.substr(0,hrefLen+1)
      path=Fhref+path
	}
	catch(e){
	  EditType="UBBEditor"
	}
	type=type.toLowerCase()
 	 switch(type){
 	  case 'gif':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[img]'+path+'[/img]\n'}
        else{oEditor.InsertHtml('<img src="'+path+'" alt=""/>')}
 	  	break;
 	  case 'jpg':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[img]'+path+'[/img]\n'}
        else{oEditor.InsertHtml('<img src="'+path+'" alt=""/>')}
 	  	break;
 	  case 'png':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[img]'+path+'[/img]\n'}
        else{oEditor.InsertHtml('<img src="'+path+'" alt=""/>')}
 	  	break;
 	  case 'bmp':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[img]'+path+'[/img]\n'}
        else{oEditor.InsertHtml('<img src="'+path+'" alt=""/>')}
 	  	break;
 	  case 'jpeg':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[img]'+path+'[/img]\n'}
        else{oEditor.InsertHtml('<img src="'+path+'" alt=""/>')}
 	  	break;
 	  case 'mp3':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[wma]'+path+'[/wma]\n'}
        else{oEditor.InsertHtml('<object classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95"  id="MediaPlayer" width="450" height="70"><param name=""showStatusBar" value="-1"><param name="AutoStart" value="False"><param name="Filename" value="'+path+'"></object>')}
 	  	break;
 	  case 'wma':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[wma]'+path+'[/wma]\n'}
        else{oEditor.InsertHtml('<object classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95"  id="MediaPlayer" width="450" height="70"><param name=""showStatusBar" value="-1"><param name="AutoStart" value="False"><param name="Filename" value="'+path+'"></object>')}
 	  	break;
 	  case 'rm':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[rm]'+path+'[/rm]\n'}
        else{oEditor.InsertHtml('<object classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA" width="400" height="300"><param name="SRC" value="'+path+'" /><param name="CONTROLS" VALUE="ImageWindow" /><param name="CONSOLE" value="one" /><param name="AUTOSTART" value="true" /><embed src="'+path+'" nojava="true" controls="ImageWindow" console="one" width="400" height="300"></object><br/><object classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA" width="400" height="32" /><param name="CONTROLS" value="StatusBar" /><param name="AUTOSTART" value="true" /><param name="CONSOLE" value="one" /><embed src="'+path+'" nojava="true" controls="StatusBar" console="one" width="400" height="24" /></object><br/><object classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA" width="400" height="32" /><param name="CONTROLS" value="ControlPanel" /><param name="AUTOSTART" value="true" /><param name="CONSOLE" value="one" /><embed src="'+path+'" nojava="true" controls="ControlPanel" console="one" width="400" height="24" autostart="true" loop="false" /></object>')}
 	  	break;
 	  case 'rmvb':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[rm]'+path+'[/rm]\n'}
        else{oEditor.InsertHtml('<object classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA" width="400" height="300"><param name="SRC" value="'+path+'" /><param name="CONTROLS" VALUE="ImageWindow" /><param name="CONSOLE" value="one" /><param name="AUTOSTART" value="true" /><embed src="'+path+'" nojava="true" controls="ImageWindow" console="one" width="400" height="300"></object><br/><object classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA" width="400" height="32" /><param name="CONTROLS" value="StatusBar" /><param name="AUTOSTART" value="true" /><param name="CONSOLE" value="one" /><embed src="'+path+'" nojava="true" controls="StatusBar" console="one" width="400" height="24" /></object><br/><object classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA" width="400" height="32" /><param name="CONTROLS" value="ControlPanel" /><param name="AUTOSTART" value="true" /><param name="CONSOLE" value="one" /><embed src="'+path+'" nojava="true" controls="ControlPanel" console="one" width="400" height="24" autostart="true" loop="false" /></object>')}
 	  	break;
 	  case 'ra':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[ra]'+path+'[/ra]\n'}
        else{oEditor.InsertHtml('<object classid="clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA" id="RAOCX" width="450" height="60"><param name="_ExtentX" value="6694"><param name="_ExtentY" value="1588"><param name="AUTOSTART" value="true"><param name="SHUFFLE" value="0"><param name="PREFETCH" value="0"><param name="NOLABELS" value="0"><param name="SRC" value="'+path+'"><param name="CONTROLS" value="StatusBar,ControlPanel"><param name="LOOP" value="0"><param name="NUMLOOP" value="0"><param name="CENTER" value="0"><param name="MAINTAINASPECT" value="0"><param name="BACKGROUNDCOLOR" value="#000000"><embed src="'+path+'" width="450" autostart="true" height="60"></embed></object>')}
 	  	break;
 	  case 'asf':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[wmv]'+path+'[/wmv]\n'}
        else{oEditor.InsertHtml('<object classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,0,02,902" type="application/x-oleobject" standby="Loading..." width="400" height="300"><param name="FileName" VALUE="'+path+'" /><param name="ShowStatusBar" value="-1" /><param name="AutoStart" value="true" /><embed type="application/x-mplayer2" pluginspage="http://www.microsoft.com/Windows/MediaPlayer/" src="'+path+'" autostart="true" width="400" height="300" /></object>')}
 	  	break;
 	  case 'avi':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[wmv]'+path+'[/wmv]\n'}
        else{oEditor.InsertHtml('<object classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,0,02,902" type="application/x-oleobject" standby="Loading..." width="400" height="300"><param name="FileName" VALUE="'+path+'" /><param name="ShowStatusBar" value="-1" /><param name="AutoStart" value="true" /><embed type="application/x-mplayer2" pluginspage="http://www.microsoft.com/Windows/MediaPlayer/" src="'+path+'" autostart="true" width="400" height="300" /></object>')}
 	  	break;
 	  case 'wmv':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[wmv]'+path+'[/wmv]\n'}
        else{oEditor.InsertHtml('<object classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,0,02,902" type="application/x-oleobject" standby="Loading..." width="400" height="300"><param name="FileName" VALUE="'+path+'" /><param name="ShowStatusBar" value="-1" /><param name="AutoStart" value="true" /><embed type="application/x-mplayer2" pluginspage="http://www.microsoft.com/Windows/MediaPlayer/" src="'+path+'" autostart="true" width="400" height="300" /></object>')}
 	  	break;
 	  case 'swf':
        if (EditType=="UBBEditor"){parent.document.forms[0].Message.value+='[swf]'+path+'[/swf]\n'}
        else{oEditor.InsertHtml('<object codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="400" height="300"><param name="movie" value="'+path+'" /><param name="quality" value="high" /><param name="AllowScriptAccess" value="never" /><embed src="'+path+'" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="400" height="300" /></object>')}
 	  	break;
 	  default :
        if (EditType=="UBBEditor"){
        if (memberDown==1)
	         {parent.document.forms[0].Message.value+='[mDown='+path+']点击下载此文件[/mDown]\n'}
         else
	         {parent.document.forms[0].Message.value+='[down='+path+']点击下载此文件[/down]\n'}
        }
        else{oEditor.InsertHtml('<a href="'+path+'"><img border="0" src="'+Fhref+'images/download.gif" alt="" style="margin:0px 2px -4px 0px"/>点击下载此文件</a>')}
        break;
     }
}