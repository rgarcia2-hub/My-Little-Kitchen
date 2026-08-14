const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Replace settings strings
code = code.replace('UI Beta / Funciones Experimentales', 'UI Beta / Experimental Features');
code = code.replace('Nueva UI de Pedidos', 'New Orders UI');
code = code.replace('Diseño alternativo compacto para el panel de comandas', 'Compact alternative layout for the orders dispatch panel');
code = code.replace('UI Beta: Activada', 'Beta UI: Enabled');
code = code.replace('UI Beta: Desactivada', 'Beta UI: Disabled');

// Replace beta orders console strings
code = code.replace('Panel de Pedidos', 'Orders Panel');
code = code.replace('Control de comandas de la cocina', 'Kitchen orders control matrix');
code = code.replace('Todos (', 'All (');
code = code.replace('Activos (', 'Active (');
code = code.replace('Pendientes (', 'Pending (');
code = code.replace('● En cocina', '● In Kitchen');
code = code.replace('En espera', 'Waiting');
code = code.replace('En espera...', 'Waiting...');
code = code.replace('▶ Iniciar Pedido', '▶ Start Order');
code = code.replace('⚡ Cocinar con Gemini', '⚡ Cook with Gemini');
code = code.replace('🔍 Verificar Platillo', '🔍 Verify Dish');
code = code.replace('+ Nuevo Pedido:', '+ New Order:');
code = code.replace('Nombre del platillo (ej. Pizza, Ramen)...', 'Dish name (e.g. Pizza, Ramen)...');
code = code.replace('Añadir', 'Add');
code = code.replace('Ver pasos para', 'Get steps for');
code = code.replace('> Pensando...', '> Thinking...');
code = code.replace('> Pedir Pista', '> Get Hint');

fs.writeFileSync('App.tsx', code);
console.log("Translations applied.");
