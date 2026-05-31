# Plan — Feature Profile (Settings → Account)

Plan de trabajo para construir la pantalla de Profile en Settings. Priorizado de mayor a menor impacto/esfuerzo.

## Resumen del orden

| # | Feature | Estado | Esfuerzo | Cambios en Supabase |
|---|---------|--------|----------|---------------------|
| 1 | Editar nombre + accent color | ✅ Listo | Bajo | ✗ Ninguno (schema y RLS ya lo soportan) |
| 2 | Cambiar contraseña | ✅ Listo | Bajo | ✗ Ninguno (Supabase Auth nativo) |
| 3 | Borrar cuenta | ⏳ Pendiente | Medio | ✓ RPC `delete_my_account` |

---

## Prioridad 1 — Editar nombre + accent color  ✅ COMPLETADO

### Por qué primero
Es lo más útil y rápido. Hoy el nombre viene del signup y no cambia. El accent es tu identidad visual (badge, avatar, color en "Paid by"). Bajo riesgo.

### Cambios en Supabase
**Ninguno.** La tabla `profiles` ya tiene `name` y `accent`. La policy `profiles_self_update` ya permite que cada user actualice su propia fila.

### Cambios en código
1. **Store** ([src/store/householdStore.ts](src/store/householdStore.ts)):
   - Generalizar `updateUser` para que acepte también `accent` en el `patch` (hoy solo soporta `name` y `email`).
   - Después del update, `fetchAll()` ya refresca todo (incluyendo el currentUser).

2. **Componente nuevo — `ProfileEditorSheet`** ([src/components/profile/ProfileEditorSheet.tsx](src/components/profile/ProfileEditorSheet.tsx)):
   - Bottom sheet (mismo patrón de `EditMemberModal`).
   - Header con avatar circular usando el accent actual (preview en vivo del cambio).
   - Input para nombre (validación: no vacío).
   - `AccentPicker` reusado del editor de categorías.
   - Email mostrado solo lectura abajo (no editable).
   - Botón "Save changes" deshabilitado si nada cambió o el nombre está vacío.

3. **Store de estado** ([src/store/profileEditorStore.ts](src/store/profileEditorStore.ts)):
   - `open` / `close` / `isOpen`. Igual a `householdEditorStore`.

4. **[src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx)**:
   - El `SettingsRow` "Profile" (que hoy no hace nada) llama a `profileEditorStore.open()`.

5. **[App.tsx](App.tsx)**:
   - Montar `<ProfileEditorSheet />` junto a los otros modales globales.

### Test esperado
- Abrir Settings → tap Profile → cambiar nombre y/o accent → save.
- Verificar:
  - El saludo del Dashboard ("Hi, [nombre]") cambia.
  - El badge en SettingsScreen cambia de color.
  - En Activity, los expenses que pagaste (badge oculto porque sos vos), pero los expenses de OTROS no se ven afectados.
  - El "Paid by: You" del ExpenseEditorSheet sigue tomando tu accent nuevo.
  - En Supabase: `select name, accent from profiles where id = auth.uid()` muestra los nuevos valores.

---

## Prioridad 2 — Cambiar contraseña  ✅ COMPLETADO

### Por qué segundo
Esencial de seguridad. Casi gratis con Supabase Auth (`supabase.auth.updateUser({ password })`). Sin cambios de schema.

### Cambios en Supabase
**Ninguno.** Supabase Auth maneja passwords internamente.

### Cambios en código
1. **Componente nuevo — `ChangePasswordSheet`** ([src/components/profile/ChangePasswordSheet.tsx](src/components/profile/ChangePasswordSheet.tsx)):
   - Bottom sheet con dos inputs: "New password" + "Confirm new password".
   - Validación: ambos iguales, mínimo 6 caracteres.
   - Botón "Update password" → llama `supabase.auth.updateUser({ password: newPass })`.
   - Maneja el error (ej. password idéntica a la actual, password débil) y muestra mensaje.
   - En éxito: muestra confirmación breve y cierra.

2. **Store de estado** ([src/store/profileEditorStore.ts](src/store/profileEditorStore.ts)):
   - Agregar `passwordOpen: boolean` + `openPassword` / `closePassword`. (O store separado, decisión menor.)

3. **[src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx)**:
   - Agregar nuevo `SettingsRow` "Change password" en la sección Account, con un ícono tipo `Lock` o `KeyRound`.

4. **[App.tsx](App.tsx)**:
   - Montar `<ChangePasswordSheet />`.

### Decisión a tomar
- **¿Pedimos la contraseña actual antes de cambiar?** Supabase no lo requiere por defecto (el token de sesión basta como autorización), pero es buena práctica. Mi recomendación: **omitirlo por ahora** (un solo campo + confirmación). Si necesitamos endurecer, se agrega después.

### Test esperado
- Tap "Change password" → ingresar nueva (2 veces) → save.
- Hacer logout, intentar login con la vieja → falla.
- Login con la nueva → entra.

---

## Prioridad 3 — Borrar cuenta  ⏳ PENDIENTE

### Por qué tercero
Importante para higiene de UX y cumplimiento, pero el más delicado: hay que cascadear bien los datos relacionados respetando las FKs.

### Cambios en Supabase

#### Cascadeo actual (lo que ya tenemos)
- `profiles.id → auth.users(id) ON DELETE CASCADE`
- `memberships.user_id → profiles(id) ON DELETE CASCADE`
- `memberships.household_id → households(id) ON DELETE CASCADE`
- `households.created_by → profiles(id) ON DELETE RESTRICT` ⚠️
- `categories.household_id → households(id) ON DELETE CASCADE`
- `expenses.household_id → households(id) ON DELETE CASCADE`
- `expenses.category_id → categories(id) ON DELETE RESTRICT`
- `expenses.paid_by_id → profiles(id) ON DELETE RESTRICT` ⚠️
- `bills.household_id → households(id) ON DELETE CASCADE`

Los dos `RESTRICT` marcados son los que bloquean el borrado simple. Hay que limpiar manualmente en orden.

#### Función RPC para hacer el borrado en orden

```sql
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  my_id uuid := auth.uid();
begin
  if my_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Borrar households que YO creé. Esto cascadea categories, expenses,
  --    bills y memberships de esos households. Después de esto ya no soy
  --    creator de nada.
  delete from public.households where created_by = my_id;

  -- 2. Borrar mis expenses en households donde era miembro (no owner).
  --    Esos households siguen existiendo (los borrarían sus owners).
  delete from public.expenses where paid_by_id = my_id;

  -- 3. Mis memberships en households ajenos (las que cascadearon en el
  --    paso 1 ya no existen). Estas son "salirme" de budgets de otros.
  delete from public.memberships where user_id = my_id;

  -- 4. Borrar el row de auth.users. Esto cascadea al profile (porque
  --    profiles.id → auth.users(id) ON DELETE CASCADE).
  delete from auth.users where id = my_id;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
```

**Por qué `security definer`**: el rol `authenticated` no tiene permisos para tocar `auth.users` ni para saltar las RLS policies. El `security definer` hace que la función corra como `postgres` (admin), bypasseando todo eso. Crucial: el `if my_id is null` previene que un cliente sin sesión llame esta función y borre cosas con UUID nulo.

#### Decisión de diseño
- **Mis expenses en budgets de otros se BORRAN** (no se reasignan al owner). Eso significa que si yo registré que pagué $100 en un budget compartido y borro mi cuenta, esos $100 desaparecen del historial del grupo. Es la opción más simple. Alternativa más justa: reasignar a otro miembro o al owner — pero implica decisión de UX adicional.

### Cambios en código

1. **Componente nuevo — `DeleteAccountSheet`** ([src/components/profile/DeleteAccountSheet.tsx](src/components/profile/DeleteAccountSheet.tsx)):
   - Bottom sheet con tono peligroso (rojo).
   - Texto claro: "Esto va a borrar permanentemente tu cuenta, todos los budgets que creaste y tus gastos en budgets compartidos. No se puede deshacer."
   - Para confirmar: pedir que el user **tipee su email** en un input (anti-accidente). Botón "Delete account" deshabilitado hasta que el email matchee.
   - Al confirmar: `supabase.rpc('delete_my_account')` → `supabase.auth.signOut()` → app vuelve al AuthScreen.

2. **[src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx)**:
   - Agregar `SettingsRow` "Delete account" al final de la sección Account, en rojo (con `destructive` prop), ícono `Trash2`.

3. **[App.tsx](App.tsx)**:
   - Montar `<DeleteAccountSheet />`.

### Limitación conocida
- Si el user borra y vuelve a registrarse con el mismo email, va a empezar con un profile nuevo (cero datos, cero budgets). El email queda libre.
- Si el RPC falla a mitad de camino (ej. timeout), los datos quedan en estado inconsistente. Para mejorar más adelante: envolver todo en una transacción explícita y/o agregar logging.

### Test esperado
- Crear una cuenta de prueba con datos: un household propio + un household compartido + algunos expenses.
- En Profile → Delete account → tipear email → confirmar.
- En Supabase:
  ```sql
  select * from auth.users where email = 'test@ejemplo.com';
  select * from public.profiles where email = 'test@ejemplo.com';
  select * from public.households where name = 'Mi Household';
  ```
  Todo debe estar vacío.
- Otros miembros del household compartido deben seguir viendo el household, pero sin tus expenses.

---

## Orden de ataque sugerido

1. ✅ **Implementar Prioridad 1** — hecho y probado.
2. ✅ **Implementar Prioridad 2** — hecho y probado.
3. ⏳ **Correr la migration de Prioridad 3** en Supabase (el `create or replace function`).
4. ⏳ **Implementar Prioridad 3** (con DB). Verificar end-to-end con cuenta de prueba descartable.

## Resumen de lo implementado (P1 + P2)

**Archivos nuevos**:
- [src/store/profileEditorStore.ts](src/store/profileEditorStore.ts) — estado para ambos sheets
- [src/components/profile/ProfileEditorSheet.tsx](src/components/profile/ProfileEditorSheet.tsx) — nombre + accent con preview en vivo + email read-only
- [src/components/profile/ChangePasswordSheet.tsx](src/components/profile/ChangePasswordSheet.tsx) — cambiar contraseña con validación
- [src/components/profile/index.ts](src/components/profile/index.ts)

**Archivos modificados**:
- [src/store/householdStore.ts](src/store/householdStore.ts) — `updateUser` acepta `accent`
- [src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx) — Profile abre editor, nuevo row "Change password"
- [App.tsx](App.tsx) — ambos sheets montados

---

## Pendientes que NO entran en esta iteración

(Por si los querés agendar después)

- **Idioma (ES/EN)**: necesita setup de i18n. Iteración aparte.
- **Tema light/dark**: necesita rediseño de paleta. Iteración aparte.
- **Foto de perfil**: necesita Supabase Storage + UI de upload.
- **Permiso de edición de gastos por miembros no-owner**: NO es Profile — es setting de Household. Va en *Manage budget*.
- **Editar email**: complica auth (Supabase requiere reverificación). Se hace cuando haya flujo de verificación implementado.
