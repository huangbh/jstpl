/**
 * JSTPL, 极速javascript template engine version 2.1.0
 * https://github.com/huangbh/jstpl
 * 完全免费,随便使用,神马BSD协议是随便选的,
 * 只是希望大家尽量保留前面的注释,你懂的...
 * 其实只是便于你更新,哈哈
 * 
 * 从2.0起,JSTPL是支持DOM和function两种形式的~yeah~!
 * 用法:
 *   function 形式
 *   $tpl(tplfunc)(...) 
 *   DOM 形式:
 *   $tpl(args, body)(...)
 *   $tpl(domid)(...)
 * 
 * 版本2.1
 * 升级为nodejs可以使用的modules 
 * 并提供内部函数和共享空间
 *
 * @author huang benhua (黄本华) 
 * @email 24860657@qq.com
*/

//JSTPL
!function(INITIALIZER){
    //初始化基础环境
    var $env={$template:function(txt,in_dom){return txt;}};
    INITIALIZER=INITIALIZER($env);
    var USE_TOKEN_ARRAY=INITIALIZER.use_token_array||0;
    /*
    * 产生JavaScript Code String 风格的字符串生成函数
    * USE_TOKEN_ARRAY, 只有在老版本的ie才需要
    */
    var rp_strs={'\"':'\\"',"\'":"\\'",'\r':'\\r','\n':'\\n','\\':'\\\\'};
    //var rp_match=/[\\\\\"\'\r\n\t\b\&\f]|[^\\\\\"\'\r\n\t\b\&\f]+/g;
    var rp_match=/[\\\\\"\'\r\n]|[^\\\\\"\'\r\n]+/g;
    var _jstr=USE_TOKEN_ARRAY?function(s){
        var ar=s.match(rp_match),l=ar.length,i=0,p,rps=rp_strs; 
        while(i < l){
            if(ar[i].length==1){
                p=rps[ar[i]];
                if(p)ar[i]=p;
            }
            ++i;
        }
        return ar.join('');
    }:function(s){
        var ar=s.match(rp_match),l=ar.length,i=0,p,rps=rp_strs,h='';
        while(i < l){
            p=ar[i++];
            if(p.length>1) h+=p;
            else h+=rps[p]||p;
        }
        return h;
    }
    /*
    * 合并一个数组到字符串
    * 当然是专门针对IE做了个优化
    */
    var _combx=USE_TOKEN_ARRAY?function(as,i,l,h){ 
        if(!l)return h;
        h=h?[h]:[];
        while(i<l) h.push(as[i++]); 
        return h.join('');
    }:function(as,i,l,h){
        if(!l)return h;
        h=h||'';
        while(i<l) h+=as[i++];
        return h;
    }
    /*
    * 这个也是用于合并字符串,只不过是把arguments当数组处理了
    * 在模板中您也是可以使用的,将会被重命名为: _(...)
    */
    function _comb(){return _combx(arguments,0,arguments.length);}

    /**
    * 这是个纯内部使用的函数,专门用以分解一对分隔符之间的内容,直到分解完毕
    **/
    function _sp2(s,p,f,x,b,_d){
        var i,n=0,fc,jb;
        while(s.length){
            i=s.indexOf(p[b]);
            if(i<0)i=s.length;
            if(i){
                if(b){
                    fc=s.charAt(0);
                    jb=(fc==x)?1:0;
                    f(s.substring(jb,i),1,n++,jb?0:fc,_d);
                }else{
                    f(s.substr(0,i),0,n++,0,_d);
                }
            }
            s=s.substr(i+p[b].length);
            b=1-b;
        }
        return n;
    }

    /*
     * 每一个模板函数的开头部分
     * 注意这里的定义,模板函数的单个大写字母,包括下划线_,都是保留的,目前用到的如下
     * H 为最终生成html的内容容器
     * J 表示为JSTPL环境
     * A 表示 { 
     * B 表示 }
     * _ 表示为字符串合并函数 _(...)
     * R 表示 \r
     * N 表示 \n
     * X 表示 *
     * P 表示 %
     * 
     * C 表示为this
     * S 表示arguments
     * T 表示为当前模板
     *
     * 实在要自行做内容添加怎么办呢? 有一个办法,就是 H=H.concat(...)函数!
     * 这是因为js中,String和Array都有这个方法,且语法一样,当然不建议这么干...,原因么,你懂的
     */
    var _prefix=(USE_TOKEN_ARRAY?'var H=[]':'var H=""')
    + ',S=arguments,T=S.callee,$tpl=T._$tpl,J=T._$env,C=this' 
    + ',N="\\n",A="{",B="}",R="\\r",_=$tpl._comb,X="*",P="%";';
 
    /**
    * 解析函数
    **/
    function _analy(s,sp2,ig,b,_p){
        _sp2(s,sp2,function(s,b,n,fc,_p,i,j){
            if(fc){
                if(fc=='\\'){
                    i=s.indexOf('\\',1)+1;
                    if(i>3) j=s.substr(1,i-2);
                    _p(s.substr(i||1),i,j);
                }else if(fc=='/'){
                    _p(s.substr(1),0,0,1);//w, 是要求必须在外面使用 (,)或[,]形式的,至少要用_(...)函数,否则后果自负
                }else{
                    _p(s);
                }
            }else if(b){
                _p(s.substr(1),0,0,0,1);
            }else{
                _p(s,1,0,0,1);
            }
        },ig,b,_p);
    }
    
    /*
    * 优化的模板编译函数,输入一个原始函数体,输出模板函数体
    */
    var _compile;
    if(USE_TOKEN_ARRAY){
        _compile=function(s,sp2,ig,b){
            s=$env.$template(s,b);
            var c=[_prefix];
            if($env.$tpl_prefix){
                c.push($env.$tpl_prefix);
            }
            if($env.use_with)c.push('with(S[0]){');
            _analy(s,sp2,ig,b,function(x,i,j,w,_ex){
                function _build_ie(s,b,n,fc){  
                    if(n){
                        c.push(',');
                    }else{
                        if(i){
                            if(j)c.push(j);
                            c.push('[');
                        }else if(!w){
                            c.push('H.push(');
                        }
                    }
                    if(fc){
                        c.push(s);
                    }else{
                        c.push('"',_jstr(s),'"');
                    }
                }
                if(_ex){
                    if(i)return c.push(x);
                    _build_ie(x,0,0,j);
                }
                if(_ex||_sp2(x,['{','}'], _build_ie,'\\',0)){
                    if(i)c.push('].join("")\n');
                    else if(!w)c.push(');');
                }
            });
            c.push(';return H.join("");');
            if($env.use_with)c.push('}');
            return c.join('');
        }
    }else{
        _compile=function(s,sp2,ig,b){
            s=$env.$template(s,b);
            var c=_prefix;
            if($env.$tpl_prefix){
                c += $env.$tpl_prefix;
            }
            if($env.use_with)c+='with(S[0]){';
            _analy(s,sp2,ig,b,function(x,i,j,w,_ex){
                function _build(s,b,n,fc){
                    if(i){
                        if(n){
                            c+=',';  
                        }else{
                            if(j)c+=j;
                            c+='$tpl._combx([';
                        }
                    }else{
                        if(!w)c+='H+=';
                        else if(n) c+=',';
                    }
                    if(fc){
                        c+=s;
                    }else{
                        c+='"';
                        c+=_jstr(s);
                        c+='"';
                    }
                    if(!i&&!w)c+=';';
                };
                if(_ex){
                    if(i)c+=x;
                    else _build(x,0,0,j);
                    return;
                }
                w =_sp2(x,['{','}'],_build,'\\',0);
                if(i&&w){
                    c+='],0,';
                    c+=w;
                    c+=')\n'; 
                }
            });
            c+=";return H;";
            if($env.use_with)c+='}';
            return c;
        }
    }
    function _none(){return "";}
    _none._$tpl=1;

    /**
    * 模板生成函数,输入一个原始函数及函数生成器,生成原始函数的模板函数
    */
    function _create_jstpl_txt(args,txt,func_creator,_$tpl){
        var f=func_creator(args, _compile(txt, ['%>','<%'], '%', 1));
        f._$tpl=_$tpl;
        f._$env=$env;
        return f;
    }
    function _create_jstpl_func(f,func_creator,_$tpl,n){
        n=f;
        var s=f.toString(),i=s.indexOf('{'),a=s.substr(0,i);
        s=_compile(s.substr(i+1,s.length-i-2),['/*','*/'],'*',0);
        i=a.indexOf('(');
        f=func_creator(a.substring(i+1,a.indexOf(')',i)), s);
        f._$tpl=_$tpl;
        f._$env=$env;
        n._jstpl=f;
        return f;
    }
    function _create_jstpl_dom(args,dom,func_creator,_$tpl,n){ 
        n=dom; 
        args=n.getAttribute(args||'jstpl')||'data';
        dom=n.innerHTML;
        if(USE_TOKEN_ARRAY)dom=dom.replace(/^[\r\n]+/,''); 
        var f=_create_jstpl_txt(args, dom, func_creator,_$tpl);
        n._jstpl=f;
        return f;
    }
    function _create_jstpl(func_creator, node_loader){
        function _jstpl(af,c){
            if(!af || af.charAt){
                if(c && c.charAt){
                    return _create_jstpl_txt(af||'data',c,func_creator,_jstpl);
                }
                if(node_loader){
                    if(!c)c=node_loader(af);
                    if(c){
                        if(c._jstpl) return c._jstpl;
                        return _create_jstpl_dom(0,c,func_creator,_jstpl);
                    }
                }
                if(!af)return _none;
                if(!c) return _create_jstpl_txt('data', af, func_creator,_jstpl);
                return _none;//_create_jstpl_txt(af, c + '',func_creator);//不接受其他类型数据,没有意义
            }
            if(af._$tpl)return af;
            if(af._jstpl && !c)return af._jstpl;
            if(node_loader && af.getTagName){
                return _create_jstpl_dom(c,af,func_creator,_jstpl);//这种情况下允许自己指定参数属性名
            }
            return _create_jstpl_func(af,func_creator,_jstpl);
        }
        _jstpl._comb = _comb;
        _jstpl._combx = _combx;
        _jstpl.J=_jstpl.set=function(k,v){
            switch(arguments.length){
                case 0:break;
                case 1:{
                    for(var p in k){
                        $env[p] = k[p];
                    }
                };break;
                default:
                    $env[k]=v;
            }
            return $env;
        };
        return _jstpl;
    }
    INITIALIZER(_create_jstpl);
}(function($env){
    function func_creator(a,b){
        //alert(b);
        //console.log(b);
        //try{
            var f=new Function(a, b);
            f.render=function(){
                return f.apply(this||f,arguments);
            };
            return f;
        //}catch(e){alert(e);}
    }
    try{if(window){
        function initializer(create_jstpl){
            function _init(win, fc){
                var jstpl=create_jstpl(func_creator, function(n){
                    return n?win.document.getElementById(n):0;
                });
                jstpl._init = _init;
                win.$tpl=jstpl; 
            }
            _init(window, func_creator);
        };
        initializer.use_token_array=(!-[1,]);
        return initializer;
    }}catch(ex){console.log('JSTPL initializing in Node.js...');}
    return function(create_jstpl){ 
        var jstpl = create_jstpl(func_creator);
        var fs=require('fs');
        var views={};
        $env.use_with = 1;//在nodejs上缺省用这个
        $env.suffix='.htm';
        $env.$tpl_prefix="function $include(_p,_d){return $tpl.view(_p).apply(C,_d?_d:S);};";
        
        jstpl.view=function(path,reload){
            var v = views[path];
            if(!v || reload){
                v = fs.readFileSync(($env.root||'') + '/' + path + ($env.suffix||'.htm'));
                v = v?v.toString():0;
                //console.log(v);
                v = jstpl($env.args||'data', v);
                //console.log(v);
                if(!$env.debug){
                    views[path] = v;
                }
            }
            return v;
        };
        jstpl.render=function(){
            var as=arguments;
            return function(){
                var htm = '',a=arguments;
                if($env.header){
                    htm += jstpl.view($env.header).apply(this,a);
                }
                for(var i=0;i<as.length;i++){
                    htm += jstpl.view(as[i]).apply(this,a);
                }
                if($env.footer){
                    htm += jstpl.view($env.footer).apply(this,a);
                }
                return htm;
            };
        };
        jstpl.compile=function(txt,af,c){
            if(af){ 
                var v = jstpl(af,c);
                views[txt]=v;
                return v;
            };
            return jstpl($env.args||'data',txt);
        };
        module.exports = jstpl;
        console.log('JSTPL initialized in Node.js.');
        return;
    };
});

