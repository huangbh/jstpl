#  JSTPL 2.0.1 
极速 JavaScript Template Engine V2.0.1 (最新)
[https://codeload.github.com/huangbh/jstpl/zip/master]

##第一章 基本示例

	本引擎支持两种方式的模板定义:
	第一种, 函数式:
	function tpl_test_func(mydata){
		/* title is: {mydata.title} 
		*/
		var ls=mydata.list;
		for(var i=0;i<ls.length;i++){
			/* id is {ls[i].id} and name is {ls[i].name} {N}*/ 
		}
		/** good work! */
	}
	然后调用方式如下:
		var data={title:"JSTPL", list:[{id:1,name:"laohuang"},{id:2,name:"JSTPL"}]}
		var tpl_func = $tpl(tpl_test_func);
		var html_func = tpl_func(data); 
		
	第二种,DOM声明:
	<script type="text/jstpl" id="tpl_test_dom" jstpl="mydata">
		title is :{mydata.title}
		<% var ls=mydata.list; 
		for(var i=0;i<ls.length;i++){ 
		%> id is {ls[i].id} and name is {ls[i].name}
		<% } %>%
		good work!
	</script>
	
	其调用方式如下:
		var tpl_dom = $tpl('tpl_test_dom');
		var html_dom = tpl_dom(data);
	
	以上调用, 会产生相同的结果
	
	请注意到函数的参数和 DOM 模板的 jstpl 属性,都是模板的参数定义,是可以有无限多个的,逗号隔开即可.
	你甚至可以在模板里使用 arguments ,以获取随意长的不定参数
	function tpl_test(arg1,arg2){/*{arg1}/{arg2}/{arguments.length}*/}
	
	另外 DOM 模式下, jstpl 属性如果没有,将缺省给一个参数名为 data:
	<script type="text/jstpl" id="tpl_test_dom">{data}</script>
	

##第二章 基本语法
	
	(1)
	从上面的示例, 其实可以看出, 
	在函数式下, 除了模板文本都是放在/* */里面的,其余都是正常的js代码, 
	(注意//这样的注释也是正常的 js 代码)
	解析后所有的模板文本会自动拼接并返回
	而{...}中的内容,则表示为模板文本中的变量

	而DOM声明模式下恰好相反, 所有的js代码都放在 <% %> 中间,
	告诉大家一个秘密,其实解析时,
	不过是把函数式中的/*和*/换成了 %>和<%而已,剩下的就好理解了.
	
	(2)
	对于函数式而言,简单用法可以如下:
	var str = $tpl(function(mydata){if(mydata){/*{mydata}*/}})("laohuang");
	
	对于DOM 方式而言,简单用法可以直接用文本解决:
	var str = $tpl("mydata", "<%if(mydata){%>{mydata}<%}%>")("JSTPL");
	
	(3)
	无论哪种方式,$tpl(...)都将产生一个函数,确保这样,
	因为是函数,你可以按照函数方式任意调用,包括 apply 和 call方式.
	
	(4)
	另外必须注意的是,由于是用 new Function(...)方式生成的函数,
	其作用域将是全局的,不要试图在模板函数里引用局部作用域的变量,
	你可以通过传参或者apply和 call 设置 this 的方式来使用局部变量.
	
	
##第三章 转义处理
	
	对于有些模板文本, 其实大家不希望解析, 尤其存在{} 这类特殊字符时
	第一类的办法是整体不解析
		如在函数式下, 是用 /** */来包含, 比如 /**{data.title}*/将不会被解析
		如在DOM下, 是判断第一个字符是否为 % , 
		比如 ...%>% {data.title}<% ..., 
		其实大家看得出来跟上面一样,只不过是把*变成了%而已


	第二类办法是在{}中通过\转义, 形式为{\...}, 
		比如{\*} {\/}{\\}, {\<hello>},{\%},都不会被解析为js, 而只是简单地认为是一个文本了
		这个办法产生一些值得注意的小技巧,
		比如如果我要在模板文件的第一字符输出*或%或/或\,
		都可以通过{\...}的形式来转义

	当然上面办法仍有不逮之处, 尤其对于 {} 这两个字符而言. 
	系统为这种情况准备了两个特殊的变量 A='{', B='}', 这样如果要输出{}, 你可以用{A}和{B}来代替了

	在实际模板代码编写过程中,仍有一种情况会产生麻烦,
	就是输出</script>,当然拆开是好办法,我介绍最好的写法是这样的</{\script}>这样看起来比较好一点

##第四章 保留字符
	
	本模板的实现最终是生成js函数,而且语法也是极度自由,只有一条规则需要大家遵守: 

	A-Z的26个单个大写字母和单个下划线_是保留的,在生成函数时会用到!

	也就是说模板中无论什么时候,你都不要试图用单个大写字母和单个下划线来声明变量, 
	注意是单个字母, 双字母是随你的.

	简单介绍一下系统目前用到的单字母系统变量:

    H 为最终生成html的内容容器
    J 表示为JSTPL环境
    A 表示 { 
    B 表示 }
    _ 表示为字符串合并函数 _(...)
    R 表示 \r
    N 表示 \n
    X 表示 *
    P 表示 %

    这些是方便写模板用, 比如{N}以输出一个换行符, {X}输出一个*, {A}和{B}上面介绍过的,输出{和}
    H是最终生成结果,在老版IE下是一个数组,其他都是字符串

##第五章 特殊解析
	
	第一类, 模板文本如何赋值给一个中间变量?
		方式是通过 \ 转义, 例子如下
		/*\x=\hello,{name}*/
		...%>\x=\hello,{name}<%...
		alert(/*\\hello,{name}*/)
		简单地说该语法将会把第二个\之后的内容解析后返回, 
		且第一个\必须是模板文本的第一个字符
		当然还有如下用法:
		/*\var x=\...*/
		/*\x+=\...*/

	第二类, 系统还提供了另外一个转义符号 / 和 _(...)的系统函数,第一类的例子也可以改写为:
		x=_(/*/hello,{name}*/)
		x=_(%>/hello,{name}<%)
		alert(_(/*/hello,{name}*/))

		如果你有一个函数是类似于_(...)接收不定参数的, 例如myfunc(...),那么你就可以直接用这种方式来做
		myfunc(/*/hello,{name}*/);

##第六章 嵌套复用
	
	模板嵌套有两种方式
	一种是直接调用$ tpl(...) 的方式,这种方式有点 hard code 的味道,
		不过简单粗暴直接,简单情况下是不错的.例如:
		/*{$tpl(my_tpl_func)(data)}*/
		
	另一种是采取模板参数化方式,具体例子如下:
		function tpl_panel(data, nested){
			/*<div>
				<span>{data.title}</span>
				<div>{nested(data.list)}</div>
			</div>*/
		}
		在调用的时候可以这样:
		var tpl_nested = ...// 可以来自function 或 DOM, 
		var html = $tpl(tpl_panel)(data,tpl_nested);
		
	这么一来, tpl_panel就变成一个通用的模板,可以完全被复用在各种地方了
	
	当然这个nested也可以是你自己随便写的函数...
	你还可以把更多函数当做参数...
	你甚至可以由此引入各种运行时环境...
	
##第七章 控制输出
	
	H是最终输出结果存储的地方, 或许有时候你需要自己来操作这个变量(当然不建议这么干),也可以.
	只是你只有一种办法来自己控制添加数据, 那就是H=H.concat(...)函数
	其他的都不支持.
	
##第八章 王婆卖瓜
	
	1,本模板的实现不依赖于任何其他框架
	2,经过测试,目前为止本模板的解析与渲染速度表现最好
	3,函数式的模板实现可以让模板以 js 的方式下载,降低页面加载的模板数量
	4,模板的两种方式极大地扩展了模板的自由度,且两种模板之间转换非常容易
	5,模板完全使用 JavaScript 来控制条件与循环,赋予开发者最大的自由度
	6,函数式模板能够借助现有的各种JavaScript 编译环境规避大多数语法问题
	7,最终生成的模板实际是一个JavaScript函数,调用方式极度自由
	8,非常自由的模板嵌套调用方式,能大大降低模板的代码量,便于模块化管理














