
    // Configuración mensual pública. Sin planillas ni claves en el navegador del docente.
    const { DEFAULT_PERIOD, periodLabel } = SalarySchema;
    let periodos = {};
    let activeMonth = null;
    let lastCalculatedRates = null;
    const SAVED_PREFIX = 'docentesbrown.calculadora.mes.v1.';
    const LAST_MONTH_KEY = 'docentesbrown.calculadora.ultimoMes.v1';
    let cargosList = new Set(Object.keys(DEFAULT_PERIOD.indicesBasico));

    const monthSelect = document.getElementById('monthSelect');
    const basicDisplay = document.getElementById('basicSalaryDisplay');
    const positionCount = document.getElementById('positionCount');
    const cardsContainer = document.getElementById('cardsContainer');
    const addCargoBtn = document.getElementById('addCargoBtn');
    const resultEmpty = document.getElementById('resultEmpty');
    const breakdownDisclosure = document.getElementById('breakdownDisclosure');
    const resultActions = document.getElementById('resultActions');
    const printPDFBtn = document.getElementById('printPDFBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDisplay = document.getElementById('resultDisplay');
    const salaryBreakdown = document.getElementById('salaryBreakdown');
    const globalAntig = document.getElementById('globalAntig');

    const monthLoading = document.getElementById("monthLoading");
    const monthBadge = document.getElementById("monthBadge");

    const money = (n) => {
      const num = Number(n) || 0;
      try{
        return new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits: 2 }).format(num);
      }catch(e){
        return '$' + num.toFixed(2);
      }
    };

    function toast(msg){
      const el = document.getElementById("toast");
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
    }

    function porcentajeAntiguedad(sueldoMes, antiguedad){
      const years = Number(antiguedad);
      const key = Number.isFinite(years) && years >= 24 ? 'mas de 24' : String(antiguedad);
      return sueldoMes.antiguedad[key] || 0;
    }

    function getTopeModulosConectividad(cargo, sueldoMes) {
      if (cargo.includes('Inicial')) return sueldoMes.topeModulosConectividad.Inicial;
      if (cargo.includes('Primaria')) return sueldoMes.topeModulosConectividad.Primaria;
      if (cargo.includes('Secundaria')) return sueldoMes.topeModulosConectividad.Secundaria;
      if (cargo.includes('Superior')) return sueldoMes.topeModulosConectividad.Superior;
      return null;
    }

    function calcularCompensacionConectividadBase(cargo, modulos, sueldoMes) {
      if (!cargo.includes('Módulos')) return sueldoMes.compensacionConectividadPorCargo;
      const topeNivel = getTopeModulosConectividad(cargo, sueldoMes);
      const cantidadModulos = Math.max(0, Number(modulos) || 0);
      if (!topeNivel) return 0;
      const proporcional = sueldoMes.compensacionConectividadMaxGlobal * (cantidadModulos / topeNivel);
      return Math.min(sueldoMes.compensacionConectividadMaxGlobal, proporcional);
    }

    function aplicarTopeGlobalConectividad(compensacionCalculada, totalYaAplicado, sueldoMes) {
      const saldoDisponible = Math.max(0, sueldoMes.compensacionConectividadMaxGlobal - totalYaAplicado);
      return Math.min(Math.max(0, Number(compensacionCalculada) || 0), saldoDisponible);
    }

    function syncResultView(){
      const hasResult = !!(resultDisplay.innerHTML.trim() && salaryBreakdown.innerHTML.trim());
      resultEmpty.hidden = hasResult;
      resultActions.hidden = !hasResult;
      breakdownDisclosure.hidden = !hasResult;
      printPDFBtn.disabled = !hasResult;
      // Automatically collapse detail on change, but allow opening it for inspection.
    }

    function updateModuleVisibility(){
      cardsContainer.querySelectorAll('.cargo-card').forEach((card,i) => {
        const cargo = document.getElementById('cargo'+i)?.value || '';
        const modField = card.querySelector('.module-field');
        if(modField) modField.hidden = !cargo.includes('Módulos');
      });
    }

    function captureCargos(){
      return Array.from(cardsContainer.querySelectorAll('.cargo-card'), (_,i) => ({
        cargo: document.getElementById('cargo'+i)?.value || '',
        desf: document.getElementById('desf'+i)?.value || '0',
        modulos: document.getElementById('modulos'+i)?.value || ''
      }));
    }

    function saveActiveMonth(){
      if(!activeMonth)return;
      const record = {
        antiguedad: globalAntig.value,
        positionCount: positionCount.value,
        cargos: captureCargos(),
        resultHTML: resultDisplay.innerHTML,
        breakdownHTML: salaryBreakdown.innerHTML,
        calculatedRates: lastCalculatedRates
      };
      try {
        localStorage.setItem(SAVED_PREFIX+activeMonth,JSON.stringify(record));
        localStorage.setItem(LAST_MONTH_KEY,activeMonth);
        document.getElementById('monthSaveStatus').textContent='✓ Datos de '+periodLabel(activeMonth)+' guardados en este dispositivo.';
      } catch(e){
        document.getElementById('monthSaveStatus').textContent='No se pudieron guardar los datos. Revisá el espacio o permisos del navegador.';
      }
    }

    function clearResultAfterEdit(){
      resultDisplay.innerHTML='';
      salaryBreakdown.innerHTML='';
      lastCalculatedRates=null;
      breakdownDisclosure.open=false;
      syncResultView();
      saveActiveMonth();
    }

    function restoreMonth(month){
      activeMonth=month;
      let stored=null;
      try { stored=JSON.parse(localStorage.getItem(SAVED_PREFIX+month)||'null'); }catch(e){}
      globalAntig.value=stored?.antiguedad ?? '';
      positionCount.value=stored?.positionCount ?? 1;
      updateCards(stored?.cargos || []);
      resultDisplay.innerHTML=stored?.resultHTML || '';
      salaryBreakdown.innerHTML=stored?.breakdownHTML || '';
      lastCalculatedRates=stored?.calculatedRates || null;
      breakdownDisclosure.open=false;
      syncResultView();
      basicDisplay.innerHTML=`<span><span class="k">Básico de referencia</span><span class="hint">Según escala del período</span></span><span class="v">${money(periodos[month].basicoReferencia)}</span>`;
      monthBadge.textContent=periodLabel(month);
      try {localStorage.setItem(LAST_MONTH_KEY,month);}catch(e){}
      const stale=!!(stored?.resultHTML && lastCalculatedRates && lastCalculatedRates!==JSON.stringify(periodos[month]));
      document.getElementById('monthSaveStatus').textContent=stale
        ? '⚠ Hay valores salariales actualizados para este mes. El resultado recuperado es el cálculo anterior; tocá Calcular para actualizarlo.'
        : stored ? '✓ Información recuperada de este mes. Guardada solo en este dispositivo.'
        : 'Tus datos de este mes se guardarán automáticamente en este dispositivo.';
    }

    function monthChanged(){
      if(activeMonth)saveActiveMonth();
      if(monthSelect.value && periodos[monthSelect.value])restoreMonth(monthSelect.value);
    }
    monthSelect.addEventListener('change',monthChanged);

    async function loadSalaryPeriods(){
      const status=document.getElementById('monthSaveStatus');
      let db;
      let fromCache=false;
      try{
        const response=await fetch('salarios.json?t='+Date.now(),{cache:'no-store'});
        if(!response.ok)throw new Error('HTTP '+response.status);
        db=await response.json();
        if(db.schemaVersion!==1||!db.periodos||typeof db.periodos!=='object')throw new Error('Archivo de salarios inválido');
        try{localStorage.setItem('docentesbrown.salarios.cache.v1',JSON.stringify(db));}catch(e){}
      }catch(err){
        try{db=JSON.parse(localStorage.getItem('docentesbrown.salarios.cache.v1')||'null');}catch(e){}
        fromCache=!!db;
        if(!db){
          monthLoading.style.display='none';
          status.textContent='No se pudo cargar la información salarial. Revisá la conexión.';
          monthBadge.textContent='📅 Sin conexión';
          calculateBtn.disabled=true;
          return;
        }
      }
      periodos={};
      for(const [month,data] of Object.entries(db.periodos)){
        if(data?.estado==='publicado' && SalarySchema.validate(data)===null && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)){
          periodos[month]=data;
        }
      }
      monthLoading.style.display='none';
      monthSelect.innerHTML='';
      const keys=Object.keys(periodos).sort().reverse();
      if(!keys.length){
        monthSelect.style.display='none';
        monthBadge.textContent='Aún sin períodos';
        status.textContent='Todavía no hay escalas salariales publicadas. El administrador debe publicar al menos un mes.';
        calculateBtn.disabled=true;
        basicDisplay.innerHTML='<span><span class="k">Básico de referencia</span><span class="hint">Según escala del período</span></span><span class="v">—</span>';
        updateCards();
        syncResultView();
        return;
      }
      for(const m of keys) monthSelect.appendChild(new Option(periodLabel(m),m));
      monthSelect.style.display='block';
      const previous=(()=>{try{return localStorage.getItem(LAST_MONTH_KEY);}catch(e){return null;}})();
      monthSelect.value=periodos[previous]?previous:keys[0];
      calculateBtn.disabled=false;
      restoreMonth(monthSelect.value);
      if(fromCache)status.textContent='⚠ Sin conexión: se usan los últimos valores salariales guardados en este navegador.';
    }
    updateCards();
    syncResultView();
    loadSalaryPeriods();

    positionCount.addEventListener('input', () => {
      const currentCargos=captureCargos();
      updateCards(currentCargos);
      clearResultAfterEdit();
    });
    globalAntig.addEventListener('input',clearResultAfterEdit);
    cardsContainer.addEventListener('input',clearResultAfterEdit);
    cardsContainer.addEventListener('change',(event) => {
      if(event.target.matches('select[id^="cargo"]')) updateModuleVisibility();
      clearResultAfterEdit();
    });
    cardsContainer.addEventListener('click',(event) => {
      const btn=event.target.closest('button[data-remove-cargo]');
      if(!btn) return;
      const current=captureCargos();
      if(current.length<=1)return;
      current.splice(Number(btn.dataset.removeCargo),1);
      positionCount.value=current.length;
      updateCards(current);
      clearResultAfterEdit();
      toast('Cargo eliminado');
    });
    addCargoBtn.addEventListener('click',() => {
      const current=captureCargos();
      if(current.length>=12){toast('Podés cargar hasta 12 cargos.');return;}
      positionCount.value=current.length+1;
      updateCards(current);
      clearResultAfterEdit();
      cardsContainer.lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'});
    });

    function updateCards(existingCargos = []) {
      cardsContainer.innerHTML = '';
      const count = Math.max(1, Math.min(12, parseInt(positionCount.value) || 1));
      positionCount.value=count;

      for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'cargo-card';

        const header = document.createElement('div');
        header.className = 'row';
        header.innerHTML = `
          <div class="cargo-heading"><span class="cargo-index">${String(i+1).padStart(2,'0')}</span><strong>Cargo ${i + 1}</strong></div>
          ${count > 1 ? `<button type="button" class="remove-cargo" data-remove-cargo="${i}" aria-label="Eliminar cargo ${i+1}">✕ <span>Quitar</span></button>` : `<span class="cargo-count">Principal</span>`}
        `;

        const grid = document.createElement('div');
        grid.className = 'grid two';

        const fieldCargo = document.createElement('div');
        fieldCargo.className = 'field';
        const labelCargo = document.createElement('label');
        labelCargo.setAttribute('for', 'cargo' + i);
        labelCargo.textContent = 'Tipo de cargo';
        const selectCargo = document.createElement('select');
        selectCargo.id = 'cargo' + i;
        selectCargo.setAttribute('aria-label', 'Cargo ' + (i + 1));
        cargosList.forEach(cargo => selectCargo.appendChild(new Option(cargo, cargo)));
        fieldCargo.appendChild(labelCargo);
        fieldCargo.appendChild(selectCargo);

        const fieldDesf = document.createElement('div');
        fieldDesf.className = 'field';
        const labelDesf = document.createElement('label');
        labelDesf.setAttribute('for', 'desf' + i);
        labelDesf.textContent = 'Desfavorabilidad';
        const selectDesf = document.createElement('select');
        selectDesf.id = 'desf' + i;
        for (let j = 0; j <= 5; j++) selectDesf.appendChild(new Option(j, j));
        fieldDesf.appendChild(labelDesf);
        fieldDesf.appendChild(selectDesf);

        const fieldMod = document.createElement('div');
        fieldMod.className = 'field';
        fieldMod.style.gridColumn = "1 / -1";
        const labelMod = document.createElement('label');
        labelMod.setAttribute('for', 'modulos' + i);
        labelMod.textContent = 'Cantidad de módulos';
        fieldMod.classList.add('module-field');
        const modulosInput = document.createElement('input');
        modulosInput.type = 'number';
        modulosInput.id = 'modulos' + i;
        modulosInput.placeholder = 'Ej.: 10';
        modulosInput.min = 0;
        modulosInput.inputMode = "numeric";
        fieldMod.appendChild(labelMod);
        fieldMod.appendChild(modulosInput);

        grid.appendChild(fieldCargo);
        grid.appendChild(fieldDesf);
        grid.appendChild(fieldMod);

        card.appendChild(header);
        card.appendChild(grid);

        cardsContainer.appendChild(card);
        if(existingCargos[i]){
          const saved=existingCargos[i];
          if(Array.from(selectCargo.options).some(o=>o.value===saved.cargo))selectCargo.value=saved.cargo;
          selectDesf.value=saved.desf ?? '0';
          modulosInput.value=saved.modulos ?? '';
        }
      }
      updateModuleVisibility();
    }

    calculateBtn.addEventListener('click', () => {
      const salarioMes = periodos[monthSelect.value];
      if(!salarioMes){toast('Elegí un mes publicado.');return;}
      const c = salarioMes.conceptos;
      const basico = Number(salarioMes.basicoReferencia);
      salaryBreakdown.innerHTML = '';
      let total = 0;
      let breakdownHTML = '<h3>Detalle del sueldo</h3><ul>';

      const antig = globalAntig.value;
      const antigPorcentaje = porcentajeAntiguedad(salarioMes,antig);

      const count = parseInt(positionCount.value) || 0;

      // Topes globales de módulos (según tu código actual)
      let totalAdicional455 = 0;
      let totalAdicional667 = 0;
      const maxAdicional455 = salarioMes.maxAdicional455;
      const maxAdicional667 = salarioMes.maxAdicional667;
      let totalConectividad = 0;
      let totalConectividadSinTope = 0;
      let conectividadFueTopada = false;

      for (let i = 0; i < count; i++) {
        const cargo = document.getElementById('cargo' + i).value;
        const desf = parseInt(document.getElementById('desf' + i).value) || 0;
        const modulos = parseInt(document.getElementById('modulos' + i).value) || 0;

        breakdownHTML += `<li><strong>Cargo ${i + 1} - ${cargo}</strong></li>`;

        let subtotal = 0;
        let detalle = '';
        let basicoCargo = basico * (salarioMes.indicesBasico[cargo] || 1);

        if (['Maestro de Grado', 'Maestro de Inicial', 'Bibliotecario Inicial & Primaria'].includes(cargo)) {
          subtotal = basicoCargo + c.maestro_0641 + c.maestro_0455 + c.maestro_0438 + c.maestro_2761;
          detalle += `
            <li>0110 Básico: ${money(basicoCargo)}</li>
            <li>0641 Bonificación 1º y 2º ciclo: ${money(c.maestro_0641)}</li>
            <li>0455 Bonificación Docente Agosto 2008: ${money(c.maestro_0455)}</li>
            <li>0438 Bonificación remunerativa: ${money(c.maestro_0438)}</li>
            <li>2761 Garantía sin aportes: ${money(c.maestro_2761)}</li>
          `;
        } else if (['Bibliotecario Secundaria & Superior', 'EMATP'].includes(cargo)) {
          subtotal = basicoCargo + c.biblio_0455 + c.biblio_0667 + c.biblio_0451;
          detalle += `
            <li>0110 Básico: ${money(basicoCargo)}</li>
            <li>0455 Bonificación Docente Agosto 2008: ${money(c.biblio_0455)}</li>
            <li>0667 Bonificación Hs/Mod. Media: ${money(c.biblio_0667)}</li>
            <li>0451 Suma No Bonificable: ${money(c.biblio_0451)}</li>
          `;
        } else if (cargo === 'Maestro Especial') {
          subtotal = basicoCargo + c.especial_0623 + c.especial_0640 + c.especial_0455 + c.especial_0438;
          detalle += `
            <li>0110 Básico: ${money(basicoCargo)}</li>
            <li>0623 Plus Enseñanza: ${money(c.especial_0623)}</li>
            <li>0640 Bonificación Función Especial: ${money(c.especial_0640)}</li>
            <li>0455 Bonif. Docente agosto 2008: ${money(c.especial_0455)}</li>
            <li>0438 Bonificación remunerativa no bonificante: ${money(c.especial_0438)}</li>
          `;
        } else if (cargo === 'Preceptor (Inicial)') {
          subtotal = basicoCargo + c.precepInicial_0623 + c.precepInicial_0455 + c.precepInicial_2761 + c.precepInicial_0648;
          detalle += `
            <li>0110 Básico: ${money(basicoCargo)}</li>
            <li>0623 Plus Enseñanza: ${money(c.precepInicial_0623)}</li>
            <li>0455 Bonif. Docente agosto 2008: ${money(c.precepInicial_0455)}</li>
            <li>2761 Garantía Sin aportes: ${money(c.precepInicial_2761)}</li>
            <li>0648 Garantía Con aportes: ${money(c.precepInicial_0648)}</li>
          `;
        } else if (cargo === 'Preceptor (Sec/Sup)') {
          subtotal = basicoCargo + c.precepSec_0653 + c.precepSec_0455;
          detalle += `
            <li>0110 Básico: ${money(basicoCargo)}</li>
            <li>0653 Bonificación PR: ${money(c.precepSec_0653)}</li>
            <li>0455 Bonif. Docente agosto 2008: ${money(c.precepSec_0455)}</li>
          `;
        } else if (cargo === 'Equipo de Orientación') {
          subtotal = basicoCargo + c.equipo_0438 + c.equipo_0623 + c.equipo_0455 + c.equipo_2761;
          detalle += `
            <li>0110 Básico: ${money(basicoCargo)}</li>
            <li>0438 Bonf. Remun. 2014: ${money(c.equipo_0438)}</li>
            <li>0623 Plus de Enseñanza: ${money(c.equipo_0623)}</li>
            <li>0455 Bonif. Docente agosto 2008: ${money(c.equipo_0455)}</li>
            <li>2761 Garantía Sin aportes 930: ${money(c.equipo_2761)}</li>
          `;
        } else if (cargo.includes('Módulos')) {
          const valorModulo = basicoCargo;
          basicoCargo = valorModulo * modulos;

          const proporcional455 = valorModulo * modulos * salarioMes.porcentaje455;
          const proporcional667 = valorModulo * modulos * salarioMes.porcentaje667;

          const disponible455 = maxAdicional455 - totalAdicional455;
          const disponible667 = maxAdicional667 - totalAdicional667;

          const adicional455 = Math.min(proporcional455, Math.max(0, disponible455));
          const adicional667 = Math.min(proporcional667, Math.max(0, disponible667));

          totalAdicional455 += adicional455;
          totalAdicional667 += adicional667;

          const adicionalDesf = valorModulo * (salarioMes.desfavorabilidad[desf] || 0) * modulos;
          const adicionalAntig = valorModulo * porcentajeAntiguedad(salarioMes,antig) * modulos;

          subtotal = basicoCargo + adicional667 + adicional455 + adicionalDesf + adicionalAntig;

          detalle += `
            <li>Valor por módulo: ${money(valorModulo)}</li>
            <li>Módulos: ${modulos} × ${money(valorModulo)} = ${money(basicoCargo)}</li>
            <li>667 Bonificación No Jerárquica (${(salarioMes.porcentaje667*100).toLocaleString('es-AR')}%): ${money(adicional667)}</li>
            <li>455 Bonif. Docente agosto 2008 (${(salarioMes.porcentaje455*100).toLocaleString('es-AR')}%): ${money(adicional455)}</li>
            <li>Adicional desfavorabilidad: ${money(adicionalDesf)}</li>
            <li>Antigüedad (${antig} años): ${money(adicionalAntig)}</li>
          `;

          if (proporcional455 > disponible455 || proporcional667 > disponible667) {
            detalle += `<li class="warning">¡ATENCIÓN! Se aplicó tope máximo global para este cargo</li>`;
          }
        } else {
          subtotal = basicoCargo;
          detalle += `<li>Salario básico ajustado: ${money(subtotal)}</li>`;
        }

        if (!cargo.includes('Módulos')) {
          const adicionalDesf = basico * (salarioMes.desfavorabilidad[desf] || 0);
          subtotal += adicionalDesf;
          detalle += `<li>Adicional desfavorabilidad: ${money(adicionalDesf)}</li>`;

          const adicionalAntig = basicoCargo * antigPorcentaje;
          subtotal += adicionalAntig;
          detalle += `<li>Antigüedad (${antig} años): ${money(adicionalAntig)}</li>`;
        }

        const compensacionConectividadCalculada = calcularCompensacionConectividadBase(cargo, modulos, salarioMes);
        const compensacionConectividadAplicada = aplicarTopeGlobalConectividad(
          compensacionConectividadCalculada,
          totalConectividad,
          salarioMes
        );

        totalConectividadSinTope += compensacionConectividadCalculada;
        totalConectividad += compensacionConectividadAplicada;
        subtotal += compensacionConectividadAplicada;

        detalle += `<li><strong>Compensación por conectividad aplicada:</strong> ${money(compensacionConectividadAplicada)}</li>`;

        if (compensacionConectividadAplicada < compensacionConectividadCalculada) {
          conectividadFueTopada = true;
          detalle += `
            <li class="warning">
              Se aplicó el tope global de conectividad. Para este cargo se habían calculado
              ${money(compensacionConectividadCalculada)}, pero solo quedaban disponibles
              ${money(compensacionConectividadAplicada)}.
            </li>
          `;
        }

        breakdownHTML += detalle;
        total += subtotal;
      }

      const descuentoIPS = total * salarioMes.descuentoIPS;
      const descuentoIOMA = total * salarioMes.descuentoIOMA;
      const salarioBolsi = total - descuentoIPS - descuentoIOMA;

      breakdownHTML += `
        </ul>
        <h3>Resumen de adicionales para módulos</h3>
        <ul>
          <li>Total 455 Bonif. Docente: ${money(totalAdicional455)} / ${money(maxAdicional455)}</li>
          <li>Total 667 Bonif. No Jerárquica: ${money(totalAdicional667)} / ${money(maxAdicional667)}</li>
        </ul>
        <h3>Resumen de compensación por conectividad</h3>
        <ul>
          <li>
            Total Compensación por conectividad aplicada:
            ${money(totalConectividad)} / ${money(salarioMes.compensacionConectividadMaxGlobal)}
          </li>
          ${conectividadFueTopada ? `
            <li>Total calculado antes del tope: ${money(totalConectividadSinTope)}</li>
            <li class="warning">Se aplicó el tope máximo global de conectividad.</li>
          ` : ''}
        </ul>
        <h3>Descuentos</h3>
        <ul>
          <li>IPS (${(salarioMes.descuentoIPS*100).toLocaleString('es-AR')}%): -${money(descuentoIPS)}</li>
          <li>IOMA (${(salarioMes.descuentoIOMA*100).toLocaleString('es-AR')}%): -${money(descuentoIOMA)}</li>
        </ul>
      `;

      resultDisplay.innerHTML = `
        <div class="total-box">
          <div class="k">Salario total estimado</div>
          <div class="v mono">${money(total)}</div>
        </div>
        <div class="total-box">
          <div class="k">Salario de bolsillo</div>
          <div class="v mono">${money(salarioBolsi)}</div>
        </div>
      `;
      salaryBreakdown.innerHTML = breakdownHTML;
      lastCalculatedRates=JSON.stringify(salarioMes);
      syncResultView();
      saveActiveMonth();

      // UX: bajar a resultados (sin tocar cálculos)
      setTimeout(() => {
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });

    // Compartir (igual a tu versión, con fallback más amable)
    async function compartirApp() {
      const payload = {
        title: 'Calculadora Salarial Docente',
        text: 'Mirá esta calculadora gratuita para docentes de la Provincia de Buenos Aires.',
        url: window.location.href
      };

      if (navigator.share) {
        try { await navigator.share(payload); } catch (e) {}
      } else {
        try{
          await navigator.clipboard.writeText(window.location.href);
          toast("Link copiado ✅");
        }catch(e){
          alert('La función de compartir no está disponible. Copiá el enlace manualmente:\n\n' + window.location.href);
        }
      }
    }
    window.compartirApp = compartirApp;
    document.getElementById('shareBtn').addEventListener('click', compartirApp);
  

    const VISIT_COUNTER_URL = "https://script.google.com/macros/s/AKfycbyj9hY6xRX6XZzmTIpGPJiyo_WA6z3XiEAstn4Nsb5R4N8u0OvUpUcfZI-tqZqu3Rci7w/exec";

    async function fetchJSON(url, options) {
      const res = await fetch(url, options);
      return await res.json();
    }

    async function cargarContadorVisitas() {
      const el = document.getElementById("visit-counter");
      try {
        const data = await fetchJSON(`${VISIT_COUNTER_URL}?t=${Date.now()}`, {
          method: "POST",
          redirect: "follow",
          mode: "cors",
          cache: "no-store"
        });

        if (data && data.visitas !== undefined) {
          el.innerHTML = `👀 <span style="color:#4d3069;font-weight:900;">Visitas acumuladas</span>: <strong class="mono">${data.visitas}</strong>`;
          return;
        }
        throw new Error("Respuesta sin 'visitas'");
      } catch (err) {
        try {
          const data = await fetchJSON(`${VISIT_COUNTER_URL}?t=${Date.now()}`, {
            method: "GET",
            redirect: "follow",
            mode: "cors",
            cache: "no-store"
          });

          if (data && data.visitas !== undefined) {
            el.innerHTML = `👀 <span style="color:#4d3069;font-weight:900;">Visitas acumuladas</span>: <strong class="mono">${data.visitas}</strong>`;
          } else {
            el.innerText = "No se pudo cargar el contador de visitas.";
          }
        } catch (err2) {
          el.innerText = "Error al cargar el contador de visitas.";
        }
      }
    }

    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) requestIdleCallback(cargarContadorVisitas, {timeout:4000});
      else setTimeout(cargarContadorVisitas,300);
    }, {once:true});
  

    function buildReceiptData() {
      const resumenEl = document.getElementById("resultDisplay");
      const breakdownEl = document.getElementById("salaryBreakdown");

      const resumenLines = [];
      resumenEl.querySelectorAll("div").forEach(d => {
        const t = d.innerText.replace(/\s+/g, " ").trim();
        if (t) resumenLines.push(t);
      });

      const sections = [];
      let current = null;

      Array.from(breakdownEl.children).forEach(node => {
        if (node.tagName === "H3") {
          if (current) sections.push(current);
          current = { title: node.innerText.trim(), items: [] };
        } else if (node.tagName === "UL") {
          const lis = Array.from(node.querySelectorAll("li"));
          lis.forEach(li => {
            const txt = li.innerText.replace(/\s+/g, " ").trim();
            if (txt) {
              if (!current) current = { title: "Detalle", items: [] };
              current.items.push({ text: txt, isWarning: li.classList.contains("warning") });
            }
          });
        }
      });
      if (current) sections.push(current);

      return { resumenLines, sections };
    }

    function makeWatermarkLayer() {
      const wm = document.createElement("div");
      wm.style.position = "absolute";
      wm.style.inset = "0";
      wm.style.opacity = "0.10";
      wm.style.pointerEvents = "none";
      wm.style.zIndex = "0";
      wm.style.display = "grid";
      wm.style.gridTemplateColumns = "repeat(3, 1fr)";
      wm.style.gridAutoRows = "120px";
      wm.style.transform = "rotate(-28deg) scale(1.08)";
      wm.style.transformOrigin = "center";
      for (let i = 0; i < 18; i++) {
        const t = document.createElement("div");
        t.style.display = "flex";
        t.style.alignItems = "center";
        t.style.justifyContent = "center";
        t.style.fontSize = "32px";
        t.style.fontWeight = "700";
        t.style.color = "#4d3069";
        t.innerText = "DOCENTES BROWN";
        wm.appendChild(t);
      }
      return wm;
    }

    function buildReceiptDOM() {
      const data = buildReceiptData();

      const wrap = document.createElement("div");
      wrap.id = "db-pdf-wrap";
      wrap.style.position = "fixed";
      wrap.style.left = "-10000px";
      wrap.style.top = "0";
      wrap.style.width = "794px";
      wrap.style.background = "#ffffff";
      wrap.style.color = "#1c1c1c";
      wrap.style.fontFamily = "Segoe UI, sans-serif";
      wrap.style.padding = "22px";
      wrap.style.boxSizing = "border-box";

      const sheet = document.createElement("div");
      sheet.style.position = "relative";
      sheet.style.border = "2px solid #24496e";
      sheet.style.borderRadius = "12px";
      sheet.style.padding = "18px";
      sheet.style.overflow = "hidden";
      sheet.style.minHeight = "1050px";
      sheet.style.boxSizing = "border-box";
      sheet.appendChild(makeWatermarkLayer());

      const header = document.createElement("div");
      header.style.position = "relative";
      header.style.zIndex = "2";
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "flex-start";
      header.style.gap = "14px";

      const left = document.createElement("div");
      left.innerHTML = `
        <div style="font-size:22px;font-weight:800;color:#4d3069;letter-spacing:0.3px;">RECIBO DE SUELDO</div>
        <div style="margin-top:4px;font-size:13px;color:#24496e;font-weight:700;">DOCENTES BROWN</div>
        <div style="margin-top:6px;font-size:12px;color:#444;">
          Documento generado por la calculadora salarial (estimativo).
        </div>
      `;

      const right = document.createElement("div");
      const now = new Date();
      right.innerHTML = `
        <div style="text-align:right;font-size:12px;color:#444;">
          <div><span style="font-weight:700;color:#24496e;">Fecha:</span> ${now.toLocaleDateString()}</div>
          <div style="margin-top:2px;"><span style="font-weight:700;color:#24496e;">Hora:</span> ${now.toLocaleTimeString()}</div>
        </div>
      `;

      header.appendChild(left);
      header.appendChild(right);

      const summaryRow = document.createElement("div");
      summaryRow.style.position = "relative";
      summaryRow.style.zIndex = "2";
      summaryRow.style.display = "grid";
      summaryRow.style.gridTemplateColumns = "1fr 1fr";
      summaryRow.style.gap = "12px";
      summaryRow.style.marginTop = "14px";

      const boxStyle = `
        border: 1.5px solid #3d8fb0;
        border-radius: 10px;
        padding: 12px;
        box-sizing: border-box;
        background: #fbfbfb;
      `;

      const box1 = document.createElement("div");
      box1.style = boxStyle;
      box1.innerHTML = `
        <div style="font-weight:800;color:#24496e;margin-bottom:6px;">RESUMEN</div>
        ${data.resumenLines.map(l => `<div style="font-size:13px;margin:3px 0;">${l}</div>`).join("")}
      `;

      const box2 = document.createElement("div");
      box2.style = boxStyle;
      const basicoTxt = (document.getElementById("basicSalaryDisplay")?.innerText || "").trim();
      const mesSel = document.getElementById("monthSelect");
      const mesTxt = mesSel && mesSel.selectedOptions.length ? mesSel.selectedOptions[0].textContent.trim() : "";
      box2.innerHTML = `
        <div style="font-weight:800;color:#24496e;margin-bottom:6px;">PERÍODO</div>
        <div style="font-size:13px;margin:3px 0;"><span style="font-weight:700;">Mes:</span> ${mesTxt || "-"}</div>
        <div style="font-size:13px;margin:3px 0;">${basicoTxt || ""}</div>
        <div style="font-size:12px;color:#666;margin-top:8px;">
          * Este recibo replica el detalle mostrado en pantalla.
        </div>
      `;

      summaryRow.appendChild(box1);
      summaryRow.appendChild(box2);

      const details = document.createElement("div");
      details.style.position = "relative";
      details.style.zIndex = "2";
      details.style.marginTop = "14px";

      data.sections.forEach(sec => {
        const secBox = document.createElement("div");
        secBox.style.cssText = boxStyle + " margin-top: 12px;";

        const title = document.createElement("div");
        title.style.fontWeight = "900";
        title.style.color = "#4d3069";
        title.style.marginBottom = "8px";
        title.style.fontSize = "14px";
        title.innerText = (sec.title || "").toUpperCase();

        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "12.5px";

        sec.items.forEach(it => {
          const tr = document.createElement("tr");

          const td1 = document.createElement("td");
          td1.style.padding = "6px 6px";
          td1.style.borderTop = "1px solid #e6e6e6";
          td1.style.verticalAlign = "top";
          td1.style.color = it.isWarning ? "#da6863" : "#222";
          td1.style.fontWeight = it.isWarning ? "800" : "400";
          td1.innerText = it.text;

          tr.appendChild(td1);
          table.appendChild(tr);
        });

        secBox.appendChild(title);
        secBox.appendChild(table);
        details.appendChild(secBox);
      });

      const footer = document.createElement("div");
      footer.style.position = "relative";
      footer.style.zIndex = "2";
      footer.style.marginTop = "14px";
      footer.style.borderTop = "1px dashed #3d8fb0";
      footer.style.paddingTop = "10px";
      footer.style.fontSize = "11px";
      footer.style.color = "#555";
      footer.innerHTML = `
        <div><strong style="color:#24496e;">Docentes Brown</strong> • Calculadora Salarial Docente • @docentesbrown</div>
        <div style="margin-top:4px;">Este PDF es estimativo y no reemplaza el recibo oficial emitido por el empleador.</div>
      `;

      sheet.appendChild(header);
      sheet.appendChild(summaryRow);
      sheet.appendChild(details);
      sheet.appendChild(footer);

      wrap.appendChild(sheet);
      document.body.appendChild(wrap);

      return { wrap, sheet };
    }

    async function exportReceiptPDF() {
      const breakdownText = (document.getElementById("salaryBreakdown")?.innerText || "").trim();
      if (!breakdownText) {
        alert("Primero calculá el salario para poder imprimir el recibo.");
        return;
      }

      if(!window.jspdf?.jsPDF || typeof window.html2canvas!=='function'){
        alert('No se pudo cargar la herramienta de PDF. Conectate a internet e intentá nuevamente.');
        return;
      }
      const { jsPDF } = window.jspdf;

      const { wrap, sheet } = buildReceiptDOM();

      const canvas = await html2canvas(sheet, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("recibo_docentes_brown.pdf");

      document.body.removeChild(wrap);
    }

    document.getElementById("printPDFBtn").addEventListener("click", exportReceiptPDF);
  