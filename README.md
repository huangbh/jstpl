#  JSTPL 2.0.1
极速 JavaScript Template Engine V2.0.1 (最新)

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
	
	从上面的示例, 其实可以看出, 
	在函数式下, 除了模板文本都是放在/* */里面的,其余都是正常的js代码, 
	解析后所有的模板文本会自动拼接并返回
	而{...}中的内容,则表示为模板文本中的变量

	而DOM声明模式下恰好相反, 所有的js代码都放在 <% %> 中间,
	告诉大家一个秘密,其实解析时,
	不过是把函数式中的/*和*/换成了 %>和<%而已,剩下的就好理解了.

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
    H最终生成结果,在老版IE下是一个数组,其他都是字符串

##第五章 特殊解析
	
	第一类, 模板文本需要放入一个中间变量该怎么处理?
		方式是通过 \ 转义, 例子如下
		/*\x=\hello,{name}*/
		...%>\x=\hello,{name}<%...
		alert(/*\\hello,{name}*/)
		简单地说该语法将会把第二个\之后的内容解析后返回, 当然还有如下用法:
		/*\var x=\...*/
		/*\x+=\...*/

	第二类, 系统还提供了另外一个转义符号 / 和 _(...)的系统函数,第一类的例子也可以改写为:
		x=_(/*/hello,{name}*/)
		x=_(%>/hello,{name}<%)
		alert(_(/*/hello,{name}*/))

		如果你有一个函数是类似于_(...)接收不定参数的, 例如myfunc(...),那么你就可以直接用这种方式来做
		myfunc(/*/hello,{name}*/);

##第六章 控制输出
	
	H是最终输出结果存储的地方, 或许有时候你需要自己来操作这个变量(当然不建议这么干),也可以.
	只是你只有一种办法来自己控制添加数据, 那就是H=H.concat(...)函数
	其他的都不支持.
	















