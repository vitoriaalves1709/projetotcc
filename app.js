/* Cortaí — versão estática (Netlify). Os dados ficam no localStorage do navegador. */
(()=>{
const A=document.getElementById('app'),$=s=>A.querySelector(s);
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HORAS=Array.from({length:10},(_,i)=>String(9+i).padStart(2,'0')+':00'),FECHA=19*60;
const min=h=>+h.slice(0,2)*60+ +h.slice(3,5),brl=v=>'R$ '+Number(v).toFixed(2).replace('.',',');
const hoje=()=>new Date().toLocaleDateString('sv-SE'),dt=d=>d.split('-').reverse().join('/');
const tel=d=>d.length==11?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
let db;try{db=JSON.parse(localStorage.cortai)}catch{}
db=db||{n:{c:0,b:2,s:3,a:0,u:0},clientes:[],usuarios:[],agendamentos:[],
 servicos:[{id:1,nome:'Corte',valor:40,duracao:30},{id:2,nome:'Barba',valor:30,duracao:30},{id:3,nome:'Corte + Barba',valor:65,duracao:60}],
 barbeiros:[{id:1,nome:'Rafael',esp:'Degradê',status:1,servicos:[1,3]},{id:2,nome:'Diego',esp:'Barba',status:1,servicos:[2,3]}]};
const save=()=>{try{localStorage.cortai=JSON.stringify(db)}catch{}},nid=k=>++db.n[k];
const ses=()=>{try{return JSON.parse(sessionStorage.cortai||'{}')}catch{return{}}},setSes=o=>{try{sessionStorage.cortai=JSON.stringify(o)}catch{}};
const gc=i=>db.clientes.find(x=>x.id==i),gs=i=>db.servicos.find(x=>x.id==i),gb=i=>db.barbeiros.find(x=>x.id==i),dur=i=>gs(i).duracao;
let st={tipo:'cliente',modo:'login',erro:'',ok:''},flash='',fl='';
const go=(h,m)=>{flash=m||'';if(location.hash==='#'+h)route();else location.hash=h};

const pubNav=()=>`<nav class="navbar navbar-cortai"><div class="container"><a class="navbar-brand m-0" href="#entrada"><img src="logo.png" alt="Cortaí" class="logo"></a></div></nav>`;
const admNav=()=>`<nav class="navbar navbar-admin"><div class="container d-flex flex-wrap align-items-center justify-content-between gap-2"><a class="navbar-brand m-0" href="#painel">CORTAÍ ADMIN</a><div class="d-flex flex-wrap gap-2">${[['clientes','people','Clientes'],['servicos','scissors','Serviços'],['barbeiros','person-badge','Barbeiros']].map(([r,i,t])=>`<a href="#${r}" class="btn btn-admin btn-sm"><i class="bi bi-${i} me-1"></i>${t}</a>`).join('')}<button data-sair class="btn btn-danger btn-sm"><i class="bi bi-box-arrow-right me-1"></i>Sair</button></div></div></nav>`;
const adm=(t,corpo)=>admNav()+`<div class="container pagina"><div class="card-cortai"><h2 class="titulo mb-4">${t}</h2>${corpo}</div></div>`;
const tabela=(h,r,vazio)=>`<div class="table-responsive"><table class="table table-hover align-middle table-stack mb-0"><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r||`<tr><td colspan="${h.length}" class="text-center py-4 subtitulo">${vazio}</td></tr>`}</tbody></table></div>`;
const campo=(i,n,p,t)=>`<div class="campo-icone"><i class="bi bi-${i}"></i><input class="form-control" name="${n}" type="${t}" placeholder="${p}" aria-label="${p}" required ${t=='tel'?'inputmode="tel" maxlength="15"':''}></div>`;
const alerta=m=>m?`<div class="alert-cortai mb-3" role="alert">${e(m)}</div>`:'';

/* ---------- Telas ---------- */
const entrada=()=>{const{tipo,modo,ok}=st,erro=st.erro||fl,cli=tipo=='cliente';
return pubNav()+`<div class="wrapper-split"><div class="card-cortai card-split"><div class="row g-0">
<div class="col-md-6 col-banner"><h2>Bem-vindo ao <span>Cortaí!</span></h2><p>Agende seus cortes, escolha seus profissionais favoritos e acompanhe seus horários em um só lugar.</p></div>
<div class="col-md-6 col-form"><div class="abas">${['cliente','barbeiro'].map(t=>`<a href="#" class="aba ${t==tipo?'active':''}" data-tab="${t}">${t=='cliente'?'Cliente':'Barbeiro'}</a>`).join('')}</div>
<h3>${modo=='login'?'Entrar':'Criar conta'}</h3><div class="mt-3">${alerta(erro)}${ok?`<div class="alert-sucesso mb-3">${e(ok)}</div>`:''}</div>
<form data-f="entrada"><input type="hidden" name="tipo" value="${tipo}"><input type="hidden" name="modo" value="${modo}">
${modo=='cadastro'?campo('person','nome','Nome completo','text'):''}
${cli?campo('whatsapp','telefone','(14) 99999-9999','tel'):campo('person-badge','usuario','Usuário','text')+campo('lock','senha','Sua senha','password')}
<button class="btn btn-cortai w-100">${modo=='login'?'ENTRAR':'CADASTRAR'}</button></form>
<div class="text-center mt-4 small subtitulo">${modo=='login'?'Novo por aqui?':'Já possui conta?'} <a href="#" class="link-rodape" data-modo="${modo=='login'?'cadastro':'login'}">${modo=='login'?'Crie uma conta':'Faça login'}</a></div></div></div></div></div>
<footer class="rodape"><div class="container">© 2026 Cortaí — Mais que um corte, é estilo.</div></footer>`};

const agenda=()=>{const c=gc(ses().c);
return pubNav()+`<div class="container pagina"><div class="row justify-content-center"><div class="col-md-8 col-lg-7">
<div class="mb-3"><button data-sair class="btn btn-voltar btn-sm"><i class="bi bi-person-x me-1"></i> Não sou ${e(c.nome.split(' ')[0])}</button></div>
<div class="card-cortai"><h2 class="titulo text-center mb-1">Agende seu <span>horário</span></h2>
<p class="subtitulo text-center mb-4">Olá, <strong>${e(c.nome)}</strong>! Escolha os detalhes do seu atendimento.</p>${alerta(fl)}
<form data-f="agenda">
<div class="mb-3"><label class="form-label" for="srv">Serviço</label><select id="srv" name="srv" class="form-select" required><option value="">Selecione um serviço</option>${db.servicos.map(s=>`<option value="${s.id}">${e(s.nome)} — ${brl(s.valor)} (${s.duracao} min)</option>`).join('')}</select></div>
<div class="mb-3"><label class="form-label" for="bar">Barbeiro</label><select id="bar" name="bar" class="form-select" required disabled><option value="">Escolha o serviço primeiro</option></select></div>
<div class="mb-3"><label class="form-label" for="dat">Data</label><input type="date" id="dat" name="dat" class="form-control" min="${hoje()}" required></div>
<div class="mb-4"><span class="form-label d-block">Horário</span><div id="slots" class="slots" role="radiogroup"></div><p id="aviso" class="slots-aviso" aria-live="polite"></p></div>
<button class="btn btn-cortai w-100" id="ok" disabled><i class="bi bi-check-lg me-1"></i> CONFIRMAR AGENDAMENTO</button></form></div></div></div></div>`};

const livres=(b,data,d)=>{const oc=db.agendamentos.filter(a=>a.bar==b&&a.data==data&&a.status!='Cancelado').map(a=>[min(a.hora),min(a.hora)+dur(a.srv)]),n=new Date(),ag=data==hoje()?n.getHours()*60+n.getMinutes():-1;
return HORAS.filter(h=>{const i=min(h),f=i+d;return i>ag&&f<=FECHA&&!oc.some(([x,y])=>i<y&&f>x)})};
const bindAgenda=()=>{const s=$('#srv'),b=$('#bar'),d=$('#dat'),sl=$('#slots'),av=$('#aviso'),ok=$('#ok');
const aviso=m=>{sl.innerHTML='';av.textContent=m;av.hidden=false;ok.disabled=true};
const horarios=()=>{if(!s.value||!b.value||!d.value)return aviso('Escolha o serviço, o barbeiro e a data para ver os horários livres.');
 const l=livres(b.value,d.value,dur(s.value));if(!l.length)return aviso('Sem horários livres neste dia. Tente outra data ou outro barbeiro.');
 av.hidden=true;ok.disabled=true;sl.innerHTML=l.map((h,i)=>`<input type="radio" name="hora" value="${h}" id="h${i}" class="slot-input" required><label for="h${i}" class="slot">${h}</label>`).join('')};
const barbeiros=()=>{const ant=b.value,l=db.barbeiros.filter(x=>x.status&&x.servicos.includes(+s.value));
 b.innerHTML=!s.value?'<option value="">Escolha o serviço primeiro</option>':l.length?'<option value="">Selecione um barbeiro</option>'+l.map(x=>`<option value="${x.id}">${e(x.nome)}${x.esp?` (${e(x.esp)})`:''}</option>`).join(''):'<option value="">Nenhum barbeiro disponível para este serviço</option>';
 b.disabled=!l.length;if(l.some(x=>x.id==ant))b.value=ant;horarios()};
s.onchange=barbeiros;b.onchange=d.onchange=horarios;sl.onchange=()=>ok.disabled=false;horarios()};

const resumo=q=>{const a=db.agendamentos.find(x=>x.id==q.get('id')),S=ses();
if(!a||!(S.u||a.cli==S.c))return pubNav()+'<div class="container pagina"><div class="card-cortai text-center">Agendamento não encontrado.</div></div>';
const c=gc(a.cli),s=gs(a.srv),it=(l,v,x='')=>`<div class="info-item"><span class="label">${l}</span><span class="valor ${x}">${v}</span></div>`;
return pubNav()+`<div class="container pagina"><div class="row justify-content-center"><div class="col-md-8 col-lg-6"><div class="card-cortai"><div class="icone-sucesso"><i class="bi bi-check-circle-fill"></i></div>
<h2 class="titulo text-center mb-2">Agendamento confirmado!</h2><p class="subtitulo text-center mb-4">Apresente seus dados ao chegar na barbearia.</p>
<div class="info-box">${it('Cliente',e(c.nome))}${it('Telefone',tel(c.tel))}${it('Serviço',e(s.nome))}${it('Barbeiro',e(gb(a.bar).nome))}${it('Data',dt(a.data))}${it('Horário',`${a.hora} (${s.duracao} min)`)}${it('Valor total',brl(s.valor),'destaque-valor')}</div>
<div class="d-grid gap-2 no-print">${S.u?'':'<a href="#agenda" class="btn btn-cortai">AGENDAR OUTRO HORÁRIO</a>'}<button onclick="print()" class="btn btn-cortai-outline"><i class="bi bi-printer me-1"></i> Imprimir comprovante</button><button data-sair class="btn btn-cortai-outline">Sair</button></div></div></div></div></div>`};

const painel=q=>{const d=q.get('data')||hoje();let tot=0;
const r=db.agendamentos.filter(a=>a.data==d).sort((a,b)=>a.hora<b.hora?-1:1).map(a=>{const c=gc(a.cli),s=gs(a.srv);if(a.status!='Cancelado')tot+=s.valor;
 const cl=a.status=='Concluído'?'bg-success':a.status=='Cancelado'?'bg-danger':'bg-info text-dark',bt=(t,i,k,ic)=>`<button class="btn btn-outline-${k}" data-act="${t}" data-id="${a.id}" title="${t}"><i class="bi bi-${ic}"></i></button>`;
 return `<tr><td data-label="Horário"><strong>${a.hora}</strong></td><td data-label="Cliente">${e(c.nome)}</td><td data-label="Telefone">${tel(c.tel)}</td><td data-label="Serviço">${e(s.nome)}</td><td data-label="Barbeiro">${e(gb(a.bar).nome)}</td><td data-label="Valor">${brl(s.valor)}</td><td data-label="Status"><span class="badge ${cl}">${a.status}</span></td><td data-label="Ações"><div class="btn-group btn-group-sm">${bt('Concluído',0,'success','check-lg')}${bt('Cancelado',0,'warning','x-lg')}${bt('excluir',0,'danger','trash')}</div></td></tr>`}).join('');
return adm('Agendamentos do <span>dia</span>',`<div class="d-flex align-items-center gap-2 mb-4"><label for="fd" class="mb-0 subtitulo">Filtrar data:</label><input type="date" id="fd" class="form-control" style="max-width:200px" value="${d}"></div>
${tabela(['Horário','Cliente','Telefone','Serviço','Barbeiro','Valor','Status','Ações'],r,'Nenhum agendamento encontrado para esta data.')}
<div class="mt-4 text-end"><div class="card-resumo-valor">Total previsto: <span>${brl(tot)}</span></div></div>`)};

const servicos=()=>adm('Lista de <span>serviços</span>',`<form data-f="srv" class="row g-2 mb-4"><div class="col-md-5"><input class="form-control" name="nome" placeholder="Nome do serviço" required></div><div class="col-6 col-md-2"><input class="form-control" name="valor" type="number" step="0.01" min="0.01" placeholder="Valor" required></div><div class="col-6 col-md-2"><input class="form-control" name="duracao" type="number" min="5" step="5" placeholder="Minutos" required></div><div class="col-md-3"><button class="btn btn-cortai w-100">Adicionar</button></div></form>
${tabela(['ID','Nome','Valor','Duração'],db.servicos.map(s=>`<tr><td data-label="ID">#${s.id}</td><td data-label="Nome">${e(s.nome)}</td><td data-label="Valor">${brl(s.valor)}</td><td data-label="Duração">${s.duracao} min</td></tr>`).join(''),'Nenhum serviço.')}`);

const barbeiros=()=>adm('Lista de <span>barbeiros</span>',`<form data-f="bar" class="mb-4"><div class="row g-2 mb-2"><div class="col-md-5"><input class="form-control" name="nome" placeholder="Nome do barbeiro" required></div><div class="col-md-4"><input class="form-control" name="esp" placeholder="Especialidade"></div><div class="col-md-3"><select class="form-select" name="status"><option value="1">Ativo</option><option value="0">Inativo</option></select></div></div>
<div class="mb-2"><span class="form-label d-block">Serviços que realiza</span>${db.servicos.map(s=>`<div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="sv" value="${s.id}" id="sv${s.id}" checked><label class="form-check-label" for="sv${s.id}">${e(s.nome)}</label></div>`).join('')}</div><button class="btn btn-cortai">Adicionar barbeiro</button></form>
${tabela(['ID','Nome','Especialidade','Serviços','Status'],db.barbeiros.map(b=>`<tr><td data-label="ID">#${b.id}</td><td data-label="Nome">${e(b.nome)}</td><td data-label="Especialidade">${e(b.esp||'-')}</td><td data-label="Serviços">${e(b.servicos.map(i=>gs(i)?.nome).filter(Boolean).join(', ')||'nenhum')}</td><td data-label="Status"><span class="badge ${b.status?'badge-ativo':'badge-inativo'}">${b.status?'Ativo':'Inativo'}</span></td></tr>`).join(''),'Nenhum barbeiro.')}`);

const clientes=()=>adm('Lista de <span>clientes</span>',tabela(['ID','Nome','Telefone'],db.clientes.map(c=>`<tr><td data-label="ID">#${c.id}</td><td data-label="Nome">${e(c.nome)}</td><td data-label="Telefone">${tel(c.tel)}</td></tr>`).join(''),'Nenhum cliente cadastrado.'));

/* ---------- Rotas ---------- */
const route=()=>{const[r,qs]=(location.hash.slice(1)||'entrada').split('?'),q=new URLSearchParams(qs),S=ses();fl=flash;flash='';
const logadoAdm=db.usuarios.some(u=>u.id==S.u),logadoCli=!!gc(S.c);
if(['painel','servicos','barbeiros','clientes'].includes(r)&&!logadoAdm){st={tipo:'barbeiro',modo:'login',erro:'',ok:''};return go('entrada')}
if(r=='agenda'&&!logadoCli)return go('entrada','Entre ou crie sua conta para agendar.');
if(r=='resumo'&&!logadoCli&&!logadoAdm)return go('entrada','Entre ou crie sua conta para agendar.');
if(r=='entrada'){if(logadoCli&&st.tipo=='cliente')return go('agenda');if(logadoAdm&&st.tipo=='barbeiro')return go('painel')}
const V={entrada,agenda,resumo,painel,servicos,barbeiros,clientes};A.innerHTML=(V[r]||entrada)(q);scrollTo(0,0);
if(r=='agenda')bindAgenda();st.erro='';st.ok=''};

/* ---------- Ações ---------- */
const entrar=f=>{st.erro=st.ok='';st.tipo=f.tipo;st.modo=f.modo;
if(f.tipo=='barbeiro'){const u=(f.usuario||'').trim(),s=f.senha||'',x=db.usuarios.find(v=>v.usuario==u);
 if(f.modo=='login'){if(!x)st.erro='Barbeiro não encontrado.';else if(x.senha!=s)st.erro='Senha incorreta.';else{setSes({u:x.id});return go('painel')}}
 else{const n=(f.nome||'').trim();if(!n||!u||!s)st.erro='Preencha todos os campos.';else if(x)st.erro='Esse usuário já existe. Escolha outro.';else{db.usuarios.push({id:nid('u'),nome:n,usuario:u,senha:s});save();st.ok='Barbeiro cadastrado! Faça login.';st.modo='login'}}}
else{const d=(f.telefone||'').replace(/\D/g,''),c=db.clientes.find(v=>v.tel==d);
 if(d.length<10||d.length>11)st.erro='Informe um telefone válido com DDD, por exemplo (14) 99999-9999.';
 else if(f.modo=='login'){if(c){setSes({c:c.id});return go('agenda')}st.erro='Telefone não encontrado. Crie sua conta abaixo.';st.modo='cadastro'}
 else{const n=(f.nome||'').trim();if(!n)st.erro='Informe seu nome completo.';else if(c){st.erro='Este telefone já possui cadastro. Faça login.';st.modo='login'}else{const x={id:nid('c'),nome:n,tel:d};db.clientes.push(x);save();setSes({c:x.id});return go('agenda')}}}
route()};

A.addEventListener('submit',ev=>{ev.preventDefault();const t=ev.target.dataset.f,F=new FormData(ev.target),f=Object.fromEntries(F);
if(t=='entrada')return entrar(f);
if(t=='agenda'){const S=ses(),srv=+f.srv,bar=+f.bar,b=gb(bar);
 if(!b||!b.status||!b.servicos.includes(srv)||f.dat<hoje()||!livres(bar,f.dat,dur(srv)).includes(f.hora)){flash='Esse horário não está mais disponível. Escolha outro.';return route()}
 const a={id:nid('a'),cli:S.c,bar,srv,data:f.dat,hora:f.hora,status:'Agendado'};db.agendamentos.push(a);save();return go('resumo?id='+a.id)}
if(t=='srv'){const s={id:nid('s'),nome:f.nome.trim(),valor:+f.valor,duracao:+f.duracao};db.servicos.push(s);db.barbeiros.filter(b=>b.status).forEach(b=>b.servicos.push(s.id));save();return route()}
if(t=='bar'){db.barbeiros.push({id:nid('b'),nome:f.nome.trim(),esp:(f.esp||'').trim(),status:+f.status,servicos:F.getAll('sv').map(Number)});save();route()}});

A.addEventListener('click',ev=>{const t=ev.target.closest('[data-tab],[data-modo],[data-sair],[data-act]');if(!t)return;
if(t.dataset.tab){ev.preventDefault();st={tipo:t.dataset.tab,modo:st.modo,erro:'',ok:''};return route()}
if(t.dataset.modo){ev.preventDefault();st.modo=t.dataset.modo;st.erro=st.ok='';return route()}
if('sair' in t.dataset){setSes({});st={tipo:'cliente',modo:'login',erro:'',ok:''};return go('entrada')}
const i=db.agendamentos.findIndex(a=>a.id==t.dataset.id);if(i<0)return;
if(t.dataset.act=='excluir'){if(!confirm('Excluir este agendamento?'))return;db.agendamentos.splice(i,1)}else db.agendamentos[i].status=t.dataset.act;save();route()});
A.addEventListener('change',ev=>{if(ev.target.id=='fd'&&ev.target.value)go('painel?data='+ev.target.value)});
A.addEventListener('input',ev=>{const i=ev.target;if(i.name!='telefone')return;const d=i.value.replace(/\D/g,'').slice(0,11);
i.value=d.length>10?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:d.length>6?`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`:d.length>2?`(${d.slice(0,2)}) ${d.slice(2)}`:d?`(${d}`:''});
addEventListener('hashchange',route);route();
})();
