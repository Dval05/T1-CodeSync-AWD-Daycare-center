// js/dynamic-sidebar.js

$(document).ready(function () {
  function loadSidebar() {
    $.ajax({
      url: "../PHP/api/get_menu.php", // Ajuste de ruta (Windows no sensible, pero consistente)
      type: "GET",
      dataType: "json",
      success: function (response) {
        const sidebar = $("#accordionSidebar");
        sidebar.empty();

        // Brand link
        sidebar.append(`
                    <a class="sidebar-brand d-flex align-items-center justify-content-center" href="../index.php">
                        <div class="sidebar-brand-icon rotate-n-15">
                            <i class="fas fa-laugh-wink"></i>
                        </div>
                        <div class="sidebar-brand-text mx-3">${KINDERGARTEN_NAME}</div>
                    </a>
                `);

        // Divider
        sidebar.append('<hr class="sidebar-divider my-0">');

        // Dashboard Item
        sidebar.append(`
                    <li class="nav-item active">
                        <a class="nav-link" href="dashboard.html">
                            <i class="fas fa-fw fa-tachometer-alt"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                `);

        // Divider
        sidebar.append('<hr class="sidebar-divider">');

        // Agrupar por secciones
        const items = response && response.success ? response.menu || [] : [];

        function sectionOf(route, name) {
          const r = (route || "").toLowerCase();
          const n = (name || "").toLowerCase();
          if (
            r.includes("students") ||
            r.includes("student") ||
            r.includes("attendance") ||
            r.includes("observations") ||
            r.includes("grades") ||
            n.includes("student")
          )
            return "Alumnos";
          if (r.includes("teachers") || n.includes("teacher"))
            return "Docentes";
          if (
            r.includes("parents") ||
            r.includes("guardian") ||
            n.includes("parent")
          )
            return "Padres/Tutores";
          if (r.includes("activities") || r.includes("activity-calendar"))
            return "Actividades";
          if (r.includes("communication")) return "Comunicación";
          if (r.includes("notifications")) return "Notificaciones";
          if (
            r.includes("users-roles") ||
            r.includes("permissions") ||
            r.includes("roles") ||
            n.includes("permission")
          )
            return "Administración";
          if (r.includes("reports")) return "Reportes";
          if (r.includes("invoices") || r.includes("payments"))
            return "Finanzas";
          if (r.includes("profile")) return "Perfil";
          return "";
        }

        // Derivar entidad y acción desde Name o ruta
        function parseActionEntity(name, route) {
          const n = (name || "").toLowerCase();
          const parts = n.split("_");
          let action = parts[0] || "";
          let entity = parts.slice(1).join("_") || "";
          if (!entity) {
            const r = (route || "").toLowerCase();
            const match = r.match(/([a-z\-]+)\.html$/);
            if (match) entity = match[1].replace(/-/g, "_");
          }
          return { action, entity };
        }

         function displayLabelForEntity(entity) {
          const e = (entity || "").toLowerCase();
          if (e.includes("student")) return "Estudiantes";
          if (e.includes("teacher")) return "Maestros";
          if (e.includes("parent") || e.includes("guardian"))
            return "Padres/Tutores";
          if (e.includes("grade")) return "Grados";
          if (e.includes("activit")) return "Actividades";
          if (e.includes("attendance")) return "Asistencia";
          if (e.includes("observation")) return "Observaciones";
          if (e.includes("notification")) return "Notificaciones";
          if (e.includes("communication") || e.includes("message"))
            return "Comunicación";
          if (e.includes("report")) return "Reportes";
           if (e.includes("staff") || e.includes("performance")) return "Rendimiento del Personal";
           if (e.includes("audit") || e.includes("log")) return "Registro de Auditoría";
          if (e.includes("invoice")) return "Facturas";
          if (e.includes("payment")) return "Pagos";
          if (e.includes("profile")) return "Perfil";
          if (e.includes("permission")) return "Permisos";
          if (e.includes("role")) return "Roles";
          if (e.includes("user")) return "Usuarios";
          return entity || "Gestión";
        }

        function isMgmtAction(action) {
          return ["create", "edit", "delete", "manage", "add"].includes(
            (action || "").toLowerCase()
          );
        }

        function actionLabelEs(action) {
          const a = (action || "").toLowerCase();
          if (a === "view") return "Ver";
          if (a === "add") return "Agregar";
          if (a === "create") return "Crear";
          if (a === "edit") return "Editar";
          if (a === "delete") return "Eliminar";
          if (a === "manage") return "Gestionar";
          return "";
        }

        const groups = {};
        items
          .sort((a, b) => (a.MenuOrder || 0) - (b.MenuOrder || 0))
          .forEach(function (item) {
            const sec = sectionOf(item.MenuRoute, item.Name);
            if (!sec) return; // Omitir sección 'Otros'
            if (!groups[sec]) groups[sec] = [];
            groups[sec].push(item);
          });

        const sectionOrder = [
          "Alumnos",
          "Docentes",
          "Padres/Tutores",
          "Actividades",
          "Comunicación",
          "Notificaciones",
          "Reportes",
          "Finanzas",
          "Administración",
          "Perfil",
        ];
        sectionOrder.forEach(function (sec) {
          if (!groups[sec] || groups[sec].length === 0) return;
          const itemsInSection = groups[sec];

          // Consolidar permisos en "Gestión X" si hay acciones editables; si solo hay vista, usar "X"
          const mgmtMap = {}; // entity -> { repItem, hasEdit }
          const others = [];
          itemsInSection.forEach(function (it) {
            const pe = parseActionEntity(it.Name, it.MenuRoute);
            if (isMgmtAction(pe.action) || pe.action === "view") {
              if (!pe.entity) {
                others.push(it);
                return;
              }
              const key = pe.entity;
              const current = mgmtMap[key] || { repItem: null, hasEdit: false };
              if (isMgmtAction(pe.action)) current.hasEdit = true;
              // Elegir una ruta representativa (preferir listados/plural/HTML)
              const better = function (a, b) {
                if (!a) return true;
                const score = (r) =>
                  (r.includes("list") ? 3 : 0) +
                  (r.includes("students") ||
                  r.includes("teachers") ||
                  r.includes("parents") ||
                  r.includes("grades") ||
                  r.includes("activities") ||
                  r.includes("attendance")
                    ? 2
                    : 0) +
                  (r.endsWith(".html") ? 1 : 0);
                return (
                  score((b.MenuRoute || "").toLowerCase()) >
                  score((a.MenuRoute || "").toLowerCase())
                );
              };
              if (better(current.repItem, it)) current.repItem = it;
              mgmtMap[key] = current;
            } else {
              others.push(it);
            }
          });

           let consolidated = [];
           Object.keys(mgmtMap).forEach(function (key) {
            const entry = mgmtMap[key];
            const rep = entry.repItem;
            const title =
              (entry.hasEdit ? "Gestión " : "") + displayLabelForEntity(key);
            consolidated.push({
              MenuRoute: rep.MenuRoute,
              MenuIcon:
                rep.MenuIcon || (entry.hasEdit ? "fas fa-tools" : "fas fa-eye"),
               MenuTitle: title,
               Name: rep.Name || ''
            });
          });
          // Añadir otros ítems no gestionables (ej. Dashboard, Calendario, Notificaciones, etc.)
           others.forEach(function (o) {
             consolidated.push(o);
          });

           // Regla especial: en Alumnos, si existen 'daily_report' y 'periodic_summaries' (ambos apuntan a asistencia), dejar solo uno (preferir 'Reportes')
           if (sec === 'Alumnos') {
             const hasReport = consolidated.some(function(it){ return /report/i.test(it.Name || ''); });
             if (hasReport) {
               consolidated = consolidated.filter(function(it){ return !/periodic|summary/i.test(it.Name || ''); });
             }
           }

          if (consolidated.length === 1) {
            const item = consolidated[0];
            const peSingle = parseActionEntity(item.Name, item.MenuRoute);
            const labelSingle =
              peSingle && peSingle.entity
                ? (actionLabelEs(peSingle.action) || item.MenuTitle || "") +
                  (actionLabelEs(peSingle.action)
                    ? " " + displayLabelForEntity(peSingle.entity)
                    : "")
                : item.MenuTitle || "";
            // Si solo hay un ítem, actuar como principal (sin collapse)
            sidebar.append(`<div class="sidebar-heading">${sec}</div>`);
            sidebar.append(`
                            <li class="nav-item">
                                <a class="nav-link" href="${item.MenuRoute}">
                                    <i class="${item.MenuIcon}"></i>
                                    <span>${
                                      labelSingle || item.MenuTitle
                                    }</span>
                                </a>
                            </li>
                            <hr class="sidebar-divider">
                        `);
          } else {
            const collapseId = "collapse" + sec.replace(/[^a-z0-9]+/gi, "");
            sidebar.append(`<div class="sidebar-heading">${sec}</div>`);
            sidebar.append(`
                            <li class="nav-item">
                                <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                                    <i class="fas fa-folder-open"></i>
                                    <span>${sec}</span>
                                </a>
                                <div id="${collapseId}" class="collapse" aria-labelledby="heading${collapseId}" data-parent="#accordionSidebar">
                                    <div class="bg-white py-2 collapse-inner rounded" id="inner-${collapseId}"></div>
                                </div>
                            </li>
                        `);
            const inner = sidebar.find("#inner-" + collapseId);
            consolidated.forEach(function (item) {
              const pe = parseActionEntity(item.Name, item.MenuRoute);
              let label = item.MenuTitle || "";
              if (pe && pe.entity) {
                const act = actionLabelEs(pe.action);
                if (act) label = act + " " + displayLabelForEntity(pe.entity);
              }
              inner.append(`
                                <a class="collapse-item" href="${item.MenuRoute}"><i class="${item.MenuIcon} mr-2"></i>${label}</a>
                            `);
            });
            sidebar.append('<hr class="sidebar-divider">');
          }
        });

        // Divider
        sidebar.append('<hr class="sidebar-divider d-none d-md-block">');

        // Sidebar Toggler
        sidebar.append(`
                    <div class="text-center d-none d-md-inline">
                        <button class="rounded-circle border-0" id="sidebarToggle"></button>
                    </div>
                `);

        // Re-vincular toggler al crear el sidebar
        $("#sidebarToggle, #sidebarToggleTop")
          .off("click")
          .on("click", function (e) {
            $("body").toggleClass("sidebar-toggled");
            $(".sidebar").toggleClass("toggled");
            if ($(".sidebar").hasClass("toggled")) {
              $(".sidebar .collapse").collapse("hide");
            }
          });
      },
      error: function (xhr, status, error) {},
    });
  }

  // Call loadSidebar on page load
  loadSidebar();

  // Attach logout functionality
  $("#logoutButton").on("click", function (e) {
    e.preventDefault();
    $.ajax({
      url: "../php/auth.php", // Relative path from html/ folder
      type: "POST",
      data: { action: "logout" },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          window.location.href = "../login.html"; // Redirect to login page
        } else {
          alert("Error al cerrar sesión: " + response.message);
        }
      },
      error: function (xhr, status, error) {
        alert("Error de conexión al intentar cerrar sesión.");
      },
    });
  });
});

// Define KINDERGARTEN_NAME globally for use in JS
const KINDERGARTEN_NAME = "NICEKIDS"; // This should ideally be loaded from config.php via an API or embedded in a meta tag
