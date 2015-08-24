/**
 * JSTPL, 极速javascript template engine version 2.0.1
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
 * @author huang benhua (黄本华) 
 * @email 1486736561@qq.com
*/

//JSTPL
!function($win,$ie,$newfunc){
    /*
    * 产生JavaScript Code String 风格的字符串生成函数
    */
    var rp_strs={'\"':'\\"',"\'":"\\'",'\r':'\\r','\n':'\\n','\\':'\\\\'};
    //var rp_match=/[\\\\\"\'\r\n\t\b\&\f]|[^\\\\\"\'\r\n\t\b\&\f]+/g;
    var rp_match=/[\\\\\"\'\r\n]|[^\\\\\"\'\r\n]+/g;
    var _jstr=$ie?function(s){
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
    var _combx=$ie?function(as,i,l,h){ 
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
        var i,n=0,fc;
        while(s.length){
            i=s.indexOf(p[b]);
            if(i<0)i=s.length;
            if(i){
                if(b){
                    fc=s.charAt(0);
                    f(s.substr(0,i),1,n++,(fc==x)?0:fc,_d);
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
     * 实在要自行做内容添加怎么办呢? 有一个办法,就是 H=H.contact(...)函数!
     * 这是因为js中,String和Array都有这个方法,且语法一样,当然不建议这么干...,原因么,你懂的
     */
    var _prefix=($ie?'var H=[]':'var H=""')+',J=$tpl,N="\\n",A="{",B="}",R="\\r",_=J._comb,X="*",P="%";';
 
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
    if($ie){
        _compile=function(s,sp2,ig,b){
            var c=[_prefix];
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
            return c.join('');
        }
    }else{
        _compile=function(s,sp2,ig,b){ 
            var c=_prefix;
            _analy(s,sp2,ig,b,function(x,i,j,w,_ex){
                function _build(s,b,n,fc){
                    if(i){
                        if(n){
                            c+=',';  
                        }else{
                            if(j)c+=j;
                            c+='J._combx([';
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
            return c;
        }
    }
    function _none(){return "";}
    /**
    * 模板生成函数,输入一个原始函数及函数生成器,生成原始函数的模板函数
    */
    function _create_jstpl_dom(args,dom,newfunc,n){
        if(!dom)return _none;
        if(dom&&!dom.charAt){
            n=dom; 
            if(n._jstpl) return n._jstpl;
            args=n.getAttribute('jstpl')||'data';
            dom=n.innerHTML;
            if($ie)dom=dom.replace(/^[\r\n]+/,'');
        }
        var f=newfunc(args, _compile(dom, ['%>','<%'], '%', 1));
        f._is_jstpl=1;
        if(n)n._jstpl=f;
        return f;
    }
    function _create_jstpl_func(f,newfunc){
        if(!f)return _none;
        var s=f.toString(),i=s.indexOf('{'),a=s.substr(0,i);
        s=_compile(s.substr(i+1,s.length-i-2),['/*','*/'],'*',0);
        i=a.indexOf('(');
        f=newfunc(a.substring(i+1,a.indexOf(')',i)), s);
        f._is_jstpl=1;
        return f;
    }
    function _init(win,newfunc){
        function _jstpl(af,c){
            if(af.charAt){
                if(!c){
                    c=win.document.getElementById(af);
                }
                return _create_jstpl_dom(af,c,newfunc);
            }
            if(af._is_jstpl)return af;
            if(c || !af._jstpl){
                af._jstpl = _create_jstpl_func(af,newfunc);
            }
            return af._jstpl;
        }
        _jstpl._comb = _comb;
        _jstpl._combx = _combx;
        _jstpl._init=_init;
        win.$tpl=_jstpl;
    };
    _init($win,$newfunc);
}(window, (!-[1,]), function(a,b){
    //alert(b);
    //try{ 
        return new Function(a,b);
    //}catch(e){alert(e);}
});
