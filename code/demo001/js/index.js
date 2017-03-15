var FunUtil = {};

FunUtil.compile = function(data){
	var node = data.node;
	var vm 	 = data.vm;
	
	var $this = this;
	
	var execuFun = {};
	
	execuFun.nodeToFragment = function(){
		
		
		var frag  = document.createDocumentFragment();
		var child ;
		
		while(child = node.firstChild){
			execuFun.complieElement({"child":child,"vm":vm});
			frag.append(child);
		}
		
		return frag;
	}
	
	execuFun.complieElement = function(parm){
		var node = parm.child;
		
		var reg = /\{\{(.*)\}\}/;
		
		if(node.nodeType === 1 ){
			var attr = node.attributes;
			var len  = attr.length;
			
			for (var i =0 ;i<len ;i++) {
				
				if(attr[i].nodeName == 'v-model'){
					var name = attr[i].nodeValue;
					node.addEventListener("input",function(e){
						vm[name] = e.target.value;
					});
					FunUtil.watcher({"vm":vm, "node":node, "name":name, 'type':'value'});
				}
				
			}
		}
		
		
		if(node.nodeType === 3){
			if(reg.test(node.nodeValue)){
				var name = RegExp.$1;
				name = name.trim();
				FunUtil.watcher({"vm":vm, "node":node, "name":name, 'type':'nodeValue'})
			}
		}
	};
	
	execuFun.pub = function(){
		if(node) {return execuFun.nodeToFragment(node, vm)};
	};
	
	return	execuFun.pub();

};

 

FunUtil.dep = {
	"subs" :[],
	"addSub":function(sub){
		console.log(this);
		FunUtil.dep.subs.push(sub);
	},
	"notify":function(){
		FunUtil.dep.subs.forEach(function(sub){
			sub.update();
		});
	}
};



FunUtil.watcher = function(data){
	var $this = this;
	 
	$this.name 	= data.name;
    $this.node 	= data.node;
    $this.vm 	= data.vm;
    $this.type 	= data.type;
	
	
	var execuFun = {};
    
    
    execuFun.update = function(){
    	execuFun.get();
    	$this.node[$this.type] = $this.value;//订阅者 执行相应的操作
    	
    	console.log($this.type+"==="+ $this.value);
    };
    execuFun.get 	= function(){
    	
    	$this.value = $this.vm[$this.name];//触发相应属性的get
    };
	
	
    execuFun.update();
    
    FunUtil.dep.addSub(execuFun);
    
   return execuFun; 
};

FunUtil.defineReactive = function(data){
	
	var obj = data.obj;
	var key = data.key;
	var val = data.val;
	
	var dep = FunUtil.dep;
	
	
	Object.defineProperty(obj,key,{
		"get":function(){
			
			if(dep.target) dep.addSub(dep.target);
			
			return val;
		},
		"set":function(newVal){
			if(newVal === val) return;
			val  = newVal;
			
			
			dep.notify();
		},
	});
};

FunUtil.observe = function(data){
	var obj = data.data;
	var vm 	= data.vm;
	
	
	Object.keys(obj).forEach(function(key){
		FunUtil.defineReactive({"obj":vm, "key":key,"val":obj[key]});
	});
	
};


function Vue(options){
	var $this = this;
	
	$this.data = options.data;
	FunUtil.observe({"data":$this.data,"vm":$this});
	
	var $id = document.getElementById(options.el);
	
	var dom = FunUtil.compile({"node":$id,"vm":$this});
	
	$id.appendChild(dom);
};


var vm  = new Vue({
	el:"app",
	data:{
		text:"hello word"
	}
});

