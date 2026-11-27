/* RouteSystem — sete rotas reais, com engajamento, descobertas e consequências. */
(function (RW) {
  'use strict';

  var ROUTES = ['vestigio', 'frequencia', 'retrato', 'vigilia', 'legado', 'silencio', 'maquina'];

  function engaged(route) {
    var st = RW.state;
    return !!(st.routeFlags && st.routeFlags[route]);
  }

  // Chamar quando o jogador fizer a ação-chave da rota (examina de verdade).
  function engage(route) {
    var st = RW.state;
    if (!st.routeFlags) st.routeFlags = {};
    if (st.routeFlags[route]) return false;
    st.routeFlags[route] = true;
    var def = RW.Data.routes[route];
    if (def && def.engage) RW.UI.caption(def.engage);
    return true;
  }

  function discover(route) {
    var st = RW.state;
    if (!st.routeDiscoveries) st.routeDiscoveries = {};
    if (st.routeDiscoveries[route]) return false;
    st.routeDiscoveries[route] = true;
    var def = RW.Data.routes[route];
    RW.UI.caption(def ? def.discovery : '');
    if (def && def.vela) {
      RW.Dialogs.say({ who: 'vela', text: def.vela[0], tone: 'CORDIAL' });
    }
    RW.Portal && RW.Portal.report && RW.Portal.report('rewind', 'rota: ' + (def ? def.name : route));
    RW.SaveSystem.save('current', RW.state);
    return true;
  }

  function countEngaged() {
    var st = RW.state, n = 0;
    ROUTES.forEach(function (r) { if (engaged(r)) n++; });
    return n;
  }

  function countDiscovered() {
    var st = RW.state, n = 0;
    ROUTES.forEach(function (r) { if (st.routeDiscoveries && st.routeDiscoveries[r]) n++; });
    return n;
  }

  function routeEngagementLabel() {
    var st = RW.state;
    var names = [];
    ROUTES.forEach(function (r) {
      if (st.routeFlags && st.routeFlags[r]) names.push(RW.Data.routes[r].name);
    });
    return names;
  }

  RW.Routes = {
    ALL: ROUTES,
    engage: engage,
    discover: discover,
    engaged: engaged,
    countEngaged: countEngaged,
    countDiscovered: countDiscovered,
    routeEngagementLabel: routeEngagementLabel
  };
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
