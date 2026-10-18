(() => {
  const search=document.getElementById('product-search');
  const category=document.getElementById('product-category');
  const sort=document.getElementById('product-sort');
  if(search && category && sort){
    const grid=document.getElementById('products');
    const cards=Array.from(grid.querySelectorAll('.product-card'));
    cards.forEach((card,i)=>{card.dataset.order=i;});
    const update=()=>{
      const query=search.value.toLowerCase().trim();let count=0;
      for(const card of cards){card.hidden=!!((category.value && card.dataset.category!==category.value)||(query && !card.dataset.search.includes(query)));if(!card.hidden)count++;}
      const ordered=cards.slice().sort((a,b)=>sort.value==='low'?Number(a.dataset.price)-Number(b.dataset.price):sort.value==='name'?a.querySelector('h2').textContent.localeCompare(b.querySelector('h2').textContent):Number(a.dataset.order)-Number(b.dataset.order));
      ordered.forEach(card=>grid.appendChild(card));
      document.getElementById('product-count').textContent=count;
      document.getElementById('no-products').hidden=count>0;
    };
    search.addEventListener('input',update);category.addEventListener('change',update);sort.addEventListener('change',update);
  }
  document.querySelectorAll('.cost-calculator').forEach(form=>{
    form.addEventListener('submit',e=>e.preventDefault());
    const update=()=>{
      const n=name=>Math.max(0,Number(form.elements.namedItem(name).value)||0);
      const total=Math.max(0,n('item')+n('shipping')+n('tax')-n('discount'));
      form.querySelector('output').textContent='$'+total.toFixed(2);
    };
    form.addEventListener('input',update);update();
  });
  document.querySelectorAll('[data-checked]').forEach(el=>{
    if(Date.now()-Date.parse(el.dataset.checked+'T00:00:00Z')>7*86400000){el.textContent='This price snapshot is from '+el.dataset.checked+'. Check the seller for today’s price and stock.';el.classList.add('older-price');}
  });
})();
