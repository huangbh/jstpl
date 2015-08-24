/**
 * JSTPL, 极速javascript template engine version 1.2.0
 * https://github.com/huangbh/jstpl
 * 完全免费,随便使用,神马BSD协议是随便选的,
 * 只是希望大家尽量保留前面的注释,你懂的...
 * 其实只是便于你更新,哈哈
 *  
 *
 * JSTPL用来生成页面, $tpl(tplfunc)(...) 
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
    function _sp2(s,p,f,x){
        var b=0,i,n=0;
        while(s.length){
            i=s.indexOf(p[b]);
            if(i<0)i=s.length;
            if(i){
                if(x&&b&&s.charAt(0)==x){
                    f(s.substr(1,i-1),0,n++);
                }else{
                    f(s.substr(0,i),b,n++);
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
     * N 表示一个换行
     * A 表示一个前大括号
     * B 表示一个后大括号
     * R 表示一个回车 
     * _ 表示为字符串合并函数
     */
    var _prefix=($ie?'var H=[]':'var H=""')+',J=$tpl,N="\\n",A="{",B="}",R="\\r",_=J._comb;';
    /*
    * 局部分析处理函数
    */
    function _analy(s,c,_p,i,j){
        if(c=='\\'){
            i=s.indexOf('\\',1)+1;
            if(i>3) j=s.substr(1,i-2);
            _p(s.substr(i||1),i,j);
        }else if(c=='/'){
            _p(s.substr(1),0,0,1);
        }else{
            _p(s);
        }
    }
    /*
    * 优化的模板编译函数,输入一个原始函数体,输出模板函数体
    */
    var _compile;
    if($ie){
        _compile=function(s){
            var c=[_prefix],_ana=_analy;
            function _p_ie(x,i,j,w){
                if(_sp2(x,['{','}'], function(s,b,n){  
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
                    if(b){
                        c.push(s);
                    }else{
                        c.push('"',_jstr(s),'"');
                    } 
                },'\\')){
                    if(i)c.push('].join("")\n');
                    else if(!w)c.push(');');
                }
            }
            _sp2(s,['/*','*/'],function(s,b){
                if(b){
                    var l=s.charAt(0);
                    if(l=='*'){
                        c.push('H.push("',_jstr(s.substr(1)),'");'); 
                    }else _ana(s,l,_p_ie);
                }else c.push(s);
            });
            c.push(';return H.join("");');
            return c.join('');
        }
    }else{
        _compile=function(s){ 
            var c=_prefix,_ana=_analy;
            function _p(x,i,j,w){
                w =_sp2(x,['{','}'],function(s,b,n){
                    if(i){
                        if(n){
                            c+=',';  
                        }else{
                            if(j)c+=j;
                            c+='J._combx([';
                        }
                    }else{
                        if(!w)c+='H+=';
                    }
                    if(b){
                        c+=s;
                    }else{
                        c+='"';
                        c+=_jstr(s);
                        c+='"';
                    }
                    if(!i&&!w)c+=';';
                },'\\');
                if(i&&w){
                    c+='],0,';
                    c+=w;
                    c+=')\n'; 
                }
            }
            _sp2(s,['/*','*/'],function(s,b){
                if(b){
                    var l=s.charAt(0);
                    if(l=='*'){ 
                        c+='H+="';
                        c+=_jstr(s.substr(1));
                        c+='";';
                    }else _ana(s,l,_p);
                }else c+=s;
            });
            c+=";return H;";
            return c;
        }
    }
    /**
    * 模板生成函数,输入一个原始函数及函数生成器,生成原始函数的模板函数
    */
    function _create_jstpl(f,newfunc){
        var s=f.toString(),i=s.indexOf('{'),a=s.substr(0,i);
        s=_compile(s.substr(i+1,s.length-i-2));
       // alert(s);
        i=a.indexOf('(');
        f=newfunc(a.substring(i+1,a.indexOf(')',i)), s);
        f._is_jstpl=1;
        return f;
    }
    function _init(win,newfunc){
        function _jstpl(f,recreate){
            if(f._is_jstpl)return f;
            if(recreate || !f._jstpl){
                f._jstpl = _create_jstpl(f,newfunc);
            }
            return f._jstpl;
        }
        _jstpl._comb = _comb;
        _jstpl._combx = _combx;
        _jstpl._init=_init;
        win.$tpl=_jstpl;
    };
    _init($win,$newfunc);
}(window, (!-[1,]), function(a,b){
    return new Function(a,b);
});
 