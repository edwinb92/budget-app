# Future enhancements

Notas sueltas de mejoras que descubrimos mientras iteramos pero que no resolvimos en el momento. Esto es un "backlog blando" — no es plan formal, solo memoria para no perderlas.

## Web compatibility — reemplazar `Alert.alert` por feedback custom

### El problema

`Alert.alert` es API nativa de React Native. En **mobile** muestra el diálogo del sistema operativo, pero **en `react-native-web` es un no-op silencioso**: la lógica se ejecuta perfecto pero no aparece ningún diálogo visible.

### Dónde nos afecta hoy

Componentes que usan `Alert.alert` y por lo tanto no dan feedback visual en navegador:

- [InviteMemberSheet](src/components/household/InviteMemberSheet.tsx) — outcomes del invite (added / not_registered / already_member / error).
- [ExpenseEditorSheet](src/components/activity/ExpenseEditorSheet.tsx) — confirmación de delete expense.
- [ManageHouseholdModal](src/components/household/ManageHouseholdModal.tsx) — confirmaciones de remove member, leave budget, delete budget.
- [ChangePasswordSheet](src/components/profile/ChangePasswordSheet.tsx) — confirmación "Password updated".
- [DeleteAccountSheet](docs/plan-profile-feature.md) (cuando se implemente) — confirmación destructiva.

En mobile todos funcionan bien. En web la lógica corre pero el usuario no ve nada → confuso.

### Direcciones para resolverlo

1. **Toast inline** — componente fijo arriba o abajo de la pantalla con auto-dismiss. Útil para outcomes informativos (added, password updated, etc.).
2. **Sheet/modal de confirmación custom** — para confirmaciones destructivas (delete X / remove Y). Reemplaza el "Cancel / Delete" del `Alert.alert` por una sheet con dos botones, cross-platform.
3. **Híbrido**: toast para feedback rápido + mini sheet para confirmaciones.

### Alcance

Es un trabajo transversal a todos los flujos destructivos / informativos. Una vez que tengamos el componente base (`<Toast />` o `<ConfirmSheet />`), ir reemplazando los `Alert.alert` uno por uno.

---

## Invitaciones por email real (con magic link)

El flujo actual de invitaciones requiere que el invitado ya tenga cuenta (ver [plan-invitations-feature.md](docs/plan-invitations-feature.md)). Para invitar a alguien que aún no se bajó la app, necesitaríamos:

- Supabase Edge Function que llame a un provider de email (Resend, SendGrid, Postmark).
- Tabla `invitations` con tokens / expiración.
- Magic link en el email que pre-llene el signup y autoacepte el join.

Por ahora aceptamos la restricción de "tiene que estar registrado primero".

---

## Feature Bills (cuentas recurrentes)

Plan completo en [plan-bills-feature.md](docs/plan-bills-feature.md). Incluye schema migration, CRUD, integración con Activity vía expense auto-generado al marcar como paid.

---

## Profile — borrar cuenta

Punto 3 del [plan-profile-feature.md](docs/plan-profile-feature.md) (los 2 primeros ya están hechos). Requiere el RPC `delete_my_account` para cascade en orden correcto + UI con confirmación por email.

---

## Otros polish menores anotados a lo largo del camino

- **"Edit member" en ManageHouseholdModal**: solo funciona para tu propio profile (RLS bloquea editar el de otros). Decidir si restringir el botón solo a tu propia row o quitarlo. Ver limitación en plan-profile-feature / supabase-setup.
- **`createHousehold` no es atómico**: dos `insert` separados (household + membership). Si fallara el segundo dejaría un budget sin miembros. Mover a una RPC `create_household_with_owner` que haga ambos en una transacción.
- **`deleteCategory` con expenses**: hoy falla silenciosamente por FK `ON DELETE RESTRICT`. Decidir: cambiar a CASCADE (borra historial) o mostrar mensaje claro al usuario ("primero borrá los gastos de esta categoría").
- **Summary no filtra por mes**: el `spent` del Dashboard suma TODOS los gastos de la categoría, no solo los del mes actual. Si queremos vista mensual real, agregar filtro por rango de fecha.
- **Cambio de moneda del budget**: si cambiás de USD a CRC en un budget existente, los montos almacenados no se convierten (el 100 sigue siendo 100 pero ahora se interpreta como ₡100). Decidir: bloquear cambio si hay datos, o agregar conversión manual.
- **Search/filter en IconPicker**: 53+ íconos son mucho para escanear. Un input de búsqueda al tope haría el picker más rápido.
- **Activity filter persistence**: hoy el filtro se mantiene hasta que el usuario toca la X. Alternativa: limpiarlo al tocar el tab "Activity" directamente desde la tab bar (los toques desde Dashboard sí setean filtro). Decisión de UX pendiente.
- **Reactivar "Confirm email" en Supabase Auth antes de producción**: lo desactivamos para desarrollar más rápido (Paso 14 del setup). Antes de salir a usuarios reales hay que volver a activarlo.
- **Idioma sincronizado entre devices**: hoy la preferencia de idioma vive en AsyncStorage (per-device). Si querés sincronizar entre celular y compu, mover a `profiles.language` en Supabase.
- **Tema dark mode**: la paleta actual es cálida (beiges, violeta). Dark mode necesita rediseño de colores.
- **Foto de perfil**: requiere Supabase Storage + UI de upload.

---

## Cómo usar este doc

Cuando aparezca una idea o limitación que no entra en el scope inmediato, agregala acá con:
- Qué es
- Por qué no se hizo ahora
- Si tiene un plan formal en otro doc, linkearlo
