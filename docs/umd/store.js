var e,t;e=this,t=function(e){"use strict";const t=e=>typeof e,s="",l=t(s),n=t(!0),a=t(0),o=t(t),r="type",c="default",i="Has",d="Ids",u="Table",h=u+"s",f=u+d,g="Row",T=g+"Count",b=g+d,V="Cell",C=V+d,S="Value",v=S+"s",y=S+d,p=e=>s+e,m=isFinite,w=e=>null==e,I=(e,t,s)=>w(e)?s?.():t(e),R=e=>e==l||e==n,J=e=>t(e)==o,L=(e,t,s)=>e.slice(t,s),E=e=>e.length,F=(e,t)=>e.forEach(t),O=(e,t)=>e.map(t),x=(e,...t)=>e.push(...t),z=Object,P=e=>z.getPrototypeOf(e),j=z.entries,k=z.keys,A=z.isFrozen,M=z.freeze,N=e=>!w(e)&&I(P(e),(e=>e==z.prototype||w(P(e))),(()=>!0)),B=(e,t)=>!w(((e,t)=>I(e,(e=>e[t])))(e,t)),D=(e,t)=>(delete e[t],e),H=(e,t)=>O(j(e),(([e,s])=>t(s,e))),W=e=>N(e)&&0==(e=>E(k(e)))(e),$=e=>e?.size??0,q=(e,t)=>e?.has(t)??!1,G=e=>w(e)||0==$(e),K=e=>e.clear(),Q=(e,t)=>e?.forEach(t),U=(e,t)=>e?.delete(t),X=e=>new Map(e),Y=e=>[...e?.keys()??[]],Z=(e,t)=>e?.get(t),_=(e,t)=>Q(e,((e,s)=>t(s,e))),ee=(e,t,s)=>w(s)?(U(e,t),e):e?.set(t,s),te=(e,t,s)=>(q(e,t)||ee(e,t,s()),Z(e,t)),se=(e,t,s,l=ee)=>(H(t,((t,l)=>s(e,l,t))),_(e,(s=>B(t,s)?0:l(e,s))),e),le=(e,t,s)=>{const l={};return Q(e,((e,n)=>{const a=t?t(e,n):e;!s?.(a,e)&&(l[n]=a)})),l},ne=(e,t,s)=>le(e,(e=>le(e,t,s)),W),ae=(e,t,s)=>le(e,(e=>ne(e,t,s)),W),oe=(e,t)=>{const s=X();return Q(e,((e,l)=>s.set(l,t?.(e)??e))),s},re=e=>oe(e,oe),ce=e=>oe(e,re),ie=(e,t,s,l,n=0)=>I((s?te:Z)(e,t[n],n>E(t)-2?s:X),(a=>{if(n>E(t)-2)return l?.(a)&&ee(e,t[n]),a;const o=ie(a,t,s,l,n+1);return G(a)&&ee(e,t[n]),o})),de=e=>new Set(Array.isArray(e)||w(e)?e:[e]),ue=(e,t)=>e?.add(t),he=/^\d+$/,fe=()=>{const e=[];let t=0;return[l=>(l?e.shift():null)??s+t++,t=>{he.test(t)&&E(e)<1e3&&x(e,t)}]},ge=e=>[e,e],Te=()=>[X(),X()],be=e=>[...e],Ve=([e,t])=>e===t,Ce=e=>{const s=t(e);return R(s)||s==a&&m(e)?s:void 0},Se=(e,t,s,l,n)=>w(n)?e.delCell(t,s,l,!0):e.setCell(t,s,l,n),ve=(e,t,s)=>w(s)?e.delValue(t):e.setValue(t,s),ye=e=>JSON.stringify(e,((e,t)=>t instanceof Map?z.fromEntries([...t]):t)),pe=JSON.parse,me=(e,t,s)=>w(e)||!N(e)||W(e)||A(e)?(s?.(),!1):(H(e,((s,l)=>{t(s,l)||D(e,l)})),!W(e)),we=(e,t,s)=>ee(e,t,Z(e,t)==-s?void 0:s),Ie=()=>{let e,t,l=!1,n=!1,o=!1,d=!1,m=0;const z=X(),P=X(),j=X(),k=X(),A=X(),N=X(),he=X(),Re=X(),Je=X(),Le=X(),Ee=X(),Fe=X(),Oe=X(),xe=X(),ze=de(),Pe=X(),je=X(),ke=X(),Ae=X(),Me=Te(),Ne=Te(),Be=Te(),De=Te(),He=Te(),We=Te(),$e=Te(),qe=Te(),Ge=Te(),Ke=Te(),Qe=Te(),Ue=Te(),Xe=Te(),Ye=Te(),Ze=Te(),_e=Te(),et=Te(),tt=Te(),st=Te(),lt=Te(),nt=Te(),at=Te(),ot=X(),rt=Te(),[ct,it,dt,ut]=(e=>{let t;const[l,n]=fe(),a=X();return[(e,n,o,r=[],c=(()=>[]))=>{t??=zs;const i=l(1);return ee(a,i,[e,n,o,r,c]),ue(ie(n,o??[s],de),i),i},(e,l,...n)=>F(((e,t=[s])=>{const l=[],n=(e,s)=>s==E(t)?x(l,e):null===t[s]?Q(e,(e=>n(e,s+1))):F([t[s],null],(t=>n(Z(e,t),s+1)));return n(e,0),l})(e,l),(e=>Q(e,(e=>Z(a,e)[0](t,...l??[],...n))))),e=>I(Z(a,e),(([,t,l])=>(ie(t,l??[s],void 0,(t=>(U(t,e),G(t)?1:0))),ee(a,e),n(e),l))),e=>I(Z(a,e),(([e,,s=[],l,n])=>{const a=(...o)=>{const r=E(o);r==E(s)?e(t,...o,...n(o)):w(s[r])?F(l[r]?.(...o)??[],(e=>a(...o,e))):a(...o,s[r])};a()}))]})(),ht=e=>{if(!me(e,((e,t)=>[r,c].includes(t))))return!1;const t=e[r];return!(!R(t)&&t!=a||(Ce(e[c])!=t&&D(e,c),0))},ft=(t,s)=>(!e||q(Ee,s)||Wt(s))&&me(t,((e,t)=>gt(s,t,e)),(()=>Wt(s))),gt=(e,t,s,l)=>me(l?s:Ct(s,e,t),((l,n)=>I(Tt(e,t,n,l),(e=>(s[n]=e,!0)),(()=>!1))),(()=>Wt(e,t))),Tt=(t,s,l,n)=>e?I(Z(Z(Ee,t),l),(e=>Ce(n)!=e[r]?Wt(t,s,l,n,e[c]):n),(()=>Wt(t,s,l,n))):w(Ce(n))?Wt(t,s,l,n):n,bt=(e,t)=>me(t?e:St(e),((t,s)=>I(Vt(s,t),(t=>(e[s]=t,!0)),(()=>!1))),(()=>$t())),Vt=(e,s)=>t?I(Z(Oe,e),(t=>Ce(s)!=t[r]?$t(e,s,t[c]):s),(()=>$t(e,s))):w(Ce(s))?$t(e,s):s,Ct=(e,t,s)=>(I(Z(Fe,t),(([l,n])=>{Q(l,((t,s)=>{B(e,s)||(e[s]=t)})),Q(n,(l=>{B(e,l)||Wt(t,s,l)}))})),e),St=e=>(t&&(Q(xe,((t,s)=>{B(e,s)||(e[s]=t)})),Q(ze,(t=>{B(e,t)||$t(t)}))),e),vt=e=>se(Ee,e,((e,t,s)=>{const l=X(),n=de();se(te(Ee,t,X),s,((e,t,s)=>{ee(e,t,s),I(s[c],(e=>ee(l,t,e)),(()=>ue(n,t)))})),ee(Fe,t,[l,n])}),((e,t)=>{ee(Ee,t),ee(Fe,t)})),yt=e=>se(Oe,e,((e,t,s)=>{ee(Oe,t,s),I(s[c],(e=>ee(xe,t,e)),(()=>ue(ze,t)))}),((e,t)=>{ee(Oe,t),ee(xe,t),U(ze,t)})),pt=e=>W(e)?ws():Ss(e),mt=e=>se(ke,e,((e,t,s)=>wt(t,s)),((e,t)=>zt(t))),wt=(e,t)=>se(te(ke,e,(()=>(At(e,1),ee(Pe,e,fe()),ee(je,e,X()),X()))),t,((t,s,l)=>It(e,t,s,l)),((t,s)=>Pt(e,t,s))),It=(e,t,s,l,n)=>se(te(t,s,(()=>(Mt(e,s,1),X()))),l,((t,l,n)=>Rt(e,s,t,l,n)),((l,a)=>jt(e,t,s,l,a,n))),Rt=(e,t,s,l,n)=>{q(s,l)||Nt(e,t,l,1);const a=Z(s,l);n!==a&&(Bt(e,t,l,a,n),ee(s,l,n))},Jt=(e,t,s,l,n)=>I(Z(t,s),(t=>Rt(e,s,t,l,n)),(()=>It(e,t,s,Ct({[l]:n},e,s)))),Lt=e=>W(e)?Js():vs(e),Et=e=>se(Ae,e,((e,t,s)=>Ft(t,s)),((e,t)=>kt(t))),Ft=(e,t)=>{q(Ae,e)||Dt(e,1);const s=Z(Ae,e);t!==s&&(Ht(e,s,t),ee(Ae,e,t))},Ot=(e,t)=>{const[s]=Z(Pe,e),l=s(t);return q(Z(ke,e),l)?Ot(e,t):l},xt=e=>Z(ke,e)??wt(e,{}),zt=e=>wt(e,{}),Pt=(e,t,s)=>{const[,l]=Z(Pe,e);l(s),It(e,t,s,{},!0)},jt=(e,t,s,l,n,a)=>{const o=Z(Z(Fe,e)?.[0],n);if(!w(o)&&!a)return Rt(e,s,l,n,o);const r=t=>{Bt(e,s,t,Z(l,t)),Nt(e,s,t,-1),ee(l,t)};w(o)?r(n):_(l,r),G(l)&&(Mt(e,s,-1),G(ee(t,s))&&(At(e,-1),ee(ke,e),ee(Pe,e),ee(je,e)))},kt=e=>{const t=Z(xe,e);if(!w(t))return Ft(e,t);Ht(e,Z(Ae,e)),Dt(e,-1),ee(Ae,e)},At=(e,t)=>we(z,e,t),Mt=(e,t,s)=>we(te(k,e,X),t,s)&&ee(j,e,te(j,e,(()=>0))+s),Nt=(e,t,s,l)=>{const n=Z(je,e),a=Z(n,s)??0;(0==a&&1==l||1==a&&-1==l)&&we(te(P,e,X),s,l),ee(n,s,a!=-l?a+l:null),we(te(te(A,e,X),t,X),s,l)},Bt=(e,t,s,l,n)=>te(te(te(N,e,X),t,X),s,(()=>[l,0]))[1]=n,Dt=(e,t)=>we(he,e,t),Ht=(e,t,s)=>te(Re,e,(()=>[t,0]))[1]=s,Wt=(e,t,s,l,n)=>(x(te(te(te(Je,e,X),t,X),s,(()=>[])),l),n),$t=(e,t,s)=>(x(te(Le,e,(()=>[])),t),s),qt=(e,t,s)=>I(Z(Z(Z(N,e),t),s),(([e,t])=>[!0,e,t]),(()=>[!1,...ge(cs(e,t,s))])),Gt=e=>I(Z(Re,e),(([e,t])=>[!0,e,t]),(()=>[!1,...ge(us(e))])),Kt=e=>G(Je)||G(_e[e])?0:Q(e?ce(Je):Je,((t,s)=>Q(t,((t,l)=>Q(t,((t,n)=>it(_e[e],[s,l,n],t))))))),Qt=e=>G(Le)||G(et[e])?0:Q(e?oe(Le):Le,((t,s)=>it(et[e],[s],t))),Ut=(e,t,s,l)=>{if(!G(e))return it(t,l,(()=>le(e))),_(e,((e,t)=>it(s,[...l??[],e],1==t))),1},Xt=e=>{const t=hs();t!=o&&it(Me[e],void 0,t);const s=G(Ke[e]),l=G(Xe[e])&&G(Ye[e])&&G(Ge[e])&&G(Qe[e])&&G(We[e])&&G($e[e])&&G(qe[e])&&s&&G(Be[e])&&G(De[e]),n=G(Ze[e])&&G(Ue[e])&&G(He[e])&&G(Ne[e]);if(!l||!n){const t=e?[oe(z),re(P),oe(j),re(k),ce(A),ce(N)]:[z,P,j,k,A,N];if(!l){Ut(t[0],Be[e],De[e]),Q(t[1],((t,s)=>Ut(t,We[e],$e[e],[s]))),Q(t[2],((t,s)=>{0!=t&&it(qe[e],[s],ns(s))}));const l=de();Q(t[3],((t,n)=>{Ut(t,Ge[e],Qe[e],[n])&&!s&&(it(Ke[e],[n,null]),ue(l,n))})),s||Q(t[5],((t,s)=>{if(!q(l,s)){const l=de();Q(t,(e=>Q(e,(([t,s],n)=>s!==t?ue(l,n):U(e,n))))),Q(l,(t=>it(Ke[e],[s,t])))}})),Q(t[4],((t,s)=>Q(t,((t,l)=>Ut(t,Xe[e],Ye[e],[s,l])))))}if(!n){let s;Q(t[5],((t,l)=>{let n;Q(t,((t,a)=>{let o;Q(t,(([t,r],c)=>{r!==t&&(it(Ze[e],[l,a,c],r,t,qt),s=n=o=1)})),o&&it(Ue[e],[l,a],qt)})),n&&it(He[e],[l],qt)})),s&&it(Ne[e],void 0,qt)}}},Yt=e=>{const t=Vs();t!=d&&it(tt[e],void 0,t);const s=G(lt[e])&&G(nt[e]),l=G(at[e])&&G(st[e]);if(!s||!l){const t=e?[oe(he),oe(Re)]:[he,Re];if(s||Ut(t[0],lt[e],nt[e]),!l){let s;Q(t[1],(([t,l],n)=>{l!==t&&(it(at[e],[n],l,t,Gt),s=1)})),s&&it(st[e],void 0,Gt)}}},Zt=(e,...t)=>(Fs((()=>e(...O(t,p)))),zs),_t=()=>[le(N,((e,t)=>-1===Z(z,t)?null:le(e,((e,s)=>-1===Z(Z(k,t),s)?null:le(e,(([,e])=>e??null),((e,t)=>Ve(t)))),W)),W),le(Re,(([,e])=>e??null),((e,t)=>Ve(t)))],es=()=>({cellsTouched:l,valuesTouched:n,changedCells:ae(N,be,Ve),invalidCells:ae(Je),changedValues:le(Re,be,Ve),invalidValues:le(Le),changedTableIds:le(z),changedRowIds:ne(k),changedCellIds:ae(A),changedValueIds:le(he)}),ts=()=>ae(ke),ss=()=>Y(ke),ls=e=>Y(Z(je,p(e))),ns=e=>$(Z(ke,p(e))),as=e=>Y(Z(ke,p(e))),os=(e,t,s,l=0,n)=>{return O(L((o=Z(ke,p(e)),r=(e,s)=>[w(t)?s:Z(e,p(t)),s],a=([e],[t])=>((e??0)<(t??0)?-1:1)*(s?-1:1),O([...o?.entries()??[]],(([e,t])=>r(t,e))).sort(a)),l,w(n)?n:l+n),(([,e])=>e));var a,o,r},rs=(e,t)=>Y(Z(Z(ke,p(e)),p(t))),cs=(e,t,s)=>Z(Z(Z(ke,p(e)),p(t)),p(s)),is=()=>le(Ae),ds=()=>Y(Ae),us=e=>Z(Ae,p(e)),hs=()=>!G(ke),fs=e=>q(ke,p(e)),gs=(e,t)=>q(Z(je,p(e)),p(t)),Ts=(e,t)=>q(Z(ke,p(e)),p(t)),bs=(e,t,s)=>q(Z(Z(ke,p(e)),p(t)),p(s)),Vs=()=>!G(Ae),Cs=e=>q(Ae,p(e)),Ss=e=>Zt((()=>(e=>me(e,ft,Wt))(e)?mt(e):0)),vs=e=>Zt((()=>bt(e)?Et(e):0)),ys=e=>{try{pt(pe(e))}catch{}return zs},ps=t=>Zt((()=>{if((e=me(t,(e=>me(e,ht))))&&(vt(t),!G(ke))){const e=ts();ws(),Ss(e)}})),ms=e=>Zt((()=>{if(t=(e=>me(e,ht))(e)){const s=is();Es(),Js(),t=!0,yt(e),vs(s)}})),ws=()=>Zt((()=>mt({}))),Is=e=>Zt((e=>q(ke,e)?zt(e):0),e),Rs=(e,t)=>Zt(((e,t)=>I(Z(ke,e),(s=>q(s,t)?Pt(e,s,t):0))),e,t),Js=()=>Zt((()=>Et({}))),Ls=()=>Zt((()=>{vt({}),e=!1})),Es=()=>Zt((()=>{yt({}),t=!1})),Fs=(e,t)=>{if(-1!=m){Os();const s=e();return xs(t),s}},Os=()=>(-1!=m&&m++,1==m&&it(ot,void 0,_t,es),zs),xs=e=>(m>0&&(m--,0==m&&(l=!G(N),n=!G(Re),m=1,Kt(1),l&&Xt(1),Qt(1),n&&Yt(1),e?.(_t,es)&&(Q(N,((e,t)=>Q(e,((e,s)=>Q(e,(([e],l)=>Se(zs,t,s,l,e))))))),Q(Re,(([e],t)=>ve(zs,t,e))),l=n=!1),it(rt[0],void 0,_t,es),m=-1,Kt(0),l&&Xt(0),Qt(0),n&&Yt(0),it(rt[1],void 0,_t,es),m=0,l=n=!1,o=hs(),d=Vs(),F([z,P,j,k,A,N,Je,he,Re,Le],K))),zs),zs={getContent:()=>[ts(),is()],getTables:ts,getTableIds:ss,getTable:e=>ne(Z(ke,p(e))),getTableCellIds:ls,getRowCount:ns,getRowIds:as,getSortedRowIds:os,getRow:(e,t)=>le(Z(Z(ke,p(e)),p(t))),getCellIds:rs,getCell:cs,getValues:is,getValueIds:ds,getValue:us,hasTables:hs,hasTable:fs,hasTableCell:gs,hasRow:Ts,hasCell:bs,hasValues:Vs,hasValue:Cs,getTablesJson:()=>ye(ke),getValuesJson:()=>ye(Ae),getJson:()=>ye([ke,Ae]),getTablesSchemaJson:()=>ye(Ee),getValuesSchemaJson:()=>ye(Oe),getSchemaJson:()=>ye([Ee,Oe]),hasTablesSchema:()=>e,hasValuesSchema:()=>t,setContent:([e,t])=>Zt((()=>{(W(e)?ws:Ss)(e),(W(t)?Js:vs)(t)})),setTables:Ss,setTable:(e,t)=>Zt((e=>ft(t,e)?wt(e,t):0),e),setRow:(e,t,s)=>Zt(((e,t)=>gt(e,t,s)?It(e,xt(e),t,s):0),e,t),addRow:(e,t,s=!0)=>Fs((()=>{let l;return gt(e,l,t)&&(e=p(e),It(e,xt(e),l=Ot(e,s?1:0),t)),l})),setPartialRow:(e,t,s)=>Zt(((e,t)=>{if(gt(e,t,s,1)){const l=xt(e);H(s,((s,n)=>Jt(e,l,t,n,s)))}}),e,t),setCell:(e,t,s,l)=>Zt(((e,t,s)=>I(Tt(e,t,s,J(l)?l(cs(e,t,s)):l),(l=>Jt(e,xt(e),t,s,l)))),e,t,s),setValues:vs,setPartialValues:e=>Zt((()=>bt(e,1)?H(e,((e,t)=>Ft(t,e))):0)),setValue:(e,t)=>Zt((e=>I(Vt(e,J(t)?t(us(e)):t),(t=>Ft(e,t)))),e),setTransactionChanges:e=>Zt((()=>{H(e[0],((e,t)=>w(e)?Is(t):H(e,((e,s)=>w(e)?Rs(t,s):H(e,((e,l)=>Se(zs,t,s,l,e))))))),H(e[1],((e,t)=>ve(zs,t,e)))})),setTablesJson:ys,setValuesJson:e=>{try{Lt(pe(e))}catch{}return zs},setJson:e=>Zt((()=>{try{const[t,s]=pe(e);pt(t),Lt(s)}catch{ys(e)}})),setTablesSchema:ps,setValuesSchema:ms,setSchema:(e,t)=>Zt((()=>{ps(e),ms(t)})),delTables:ws,delTable:Is,delRow:Rs,delCell:(e,t,s,l)=>Zt(((e,t,s)=>I(Z(ke,e),(n=>I(Z(n,t),(a=>q(a,s)?jt(e,n,t,a,s,l):0))))),e,t,s),delValues:Js,delValue:e=>Zt((e=>q(Ae,e)?kt(e):0),e),delTablesSchema:Ls,delValuesSchema:Es,delSchema:()=>Zt((()=>{Ls(),Es()})),transaction:Fs,startTransaction:Os,finishTransaction:xs,forEachTable:e=>Q(ke,((t,s)=>e(s,(e=>Q(t,((t,s)=>e(s,(e=>_(t,e))))))))),forEachTableCell:(e,t)=>_(Z(je,p(e)),t),forEachRow:(e,t)=>Q(Z(ke,p(e)),((e,s)=>t(s,(t=>_(e,t))))),forEachCell:(e,t,s)=>_(Z(Z(ke,p(e)),p(t)),s),forEachValue:e=>_(Ae,e),addSortedRowIdsListener:(e,t,s,l,n,a,o)=>{let r=os(e,t,s,l,n);return ct((()=>{const o=os(e,t,s,l,n);var c,i,d;i=r,E(c=o)===E(i)&&(d=(e,t)=>i[t]===e,c.every(d))||(r=o,a(zs,e,t,s,l,n,r))}),Ke[o?1:0],[e,t],[ss])},addStartTransactionListener:e=>ct(e,ot),addWillFinishTransactionListener:e=>ct(e,rt[0]),addDidFinishTransactionListener:e=>ct(e,rt[1]),callListener:e=>(ut(e),zs),delListener:e=>(dt(e),zs),getListenerStats:()=>({}),createStore:Ie,addListener:ct,callListeners:it};return H({[i+h]:[0,Me,[],()=>[hs()]],[h]:[0,Ne],[f]:[0,Be],[i+u]:[1,De,[ss],e=>[fs(...e)]],[u]:[1,He,[ss]],[u+C]:[1,We,[ss]],[i+u+V]:[2,$e,[ss,ls],e=>[gs(...e)]],[T]:[1,qe,[ss]],[b]:[1,Ge,[ss]],[i+g]:[2,Qe,[ss,as],e=>[Ts(...e)]],[g]:[2,Ue,[ss,as]],[C]:[2,Xe,[ss,as]],[i+V]:[3,Ye,[ss,as,rs],e=>[bs(...e)]],[V]:[3,Ze,[ss,as,rs],e=>ge(cs(...e))],InvalidCell:[3,_e],[i+v]:[0,tt,[],()=>[Vs()]],[v]:[0,st],[y]:[0,lt],[i+S]:[1,nt,[ds],e=>[Cs(...e)]],[S]:[1,at,[ds],e=>ge(us(e[0]))],InvalidValue:[1,et]},(([e,t,s,l],n)=>{zs["add"+n+"Listener"]=(...n)=>ct(n[e],t[n[e+1]?1:0],e>0?L(n,0,e):void 0,s,l)})),M(zs)};e.createStore=Ie},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseStore={});