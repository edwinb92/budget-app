# Plan — Feature Invitaciones de miembros

Plan para que invitar a alguien a un presupuesto realmente funcione (no solo un `Alert.alert`).

## Decisión de producto

**Solo se puede invitar a usuarios que ya tengan cuenta en la app.** Si el email no está registrado, la invitación falla con un mensaje claro: "Ese email no está registrado. Pedile que se registre primero y volvé a intentar."

Esto se decidió así porque:

- ✅ Elimina la fricción de comunicación out-of-band (no hay que mandarle un mensaje al invitado explicando "bajá la app y registrate con este email exacto").
- ✅ Elimina el hueco de discrepancia: si invitás `juan@gmail.com` pero Juan se registra con `juan_perez@gmail.com`, en un sistema de "pending invitations" la invitación quedaría fantasma para siempre.
- ✅ No necesita Edge Functions, providers de email, ni nada externo.
- ✅ Es un flujo nativo de mobile (sin links web).
- ❌ El owner no puede "preinvitar" a alguien que aún no se bajó la app — hay que esperar a que se registre primero.

## Estado actual

- ✅ `InviteMemberSheet` UI lista: campo email + validación regex + botón "Send invitation".
- ✅ Botón "Invite" en `ManageHouseholdModal` que abre el sheet.
- ❌ El `handleSend` solo muestra un `Alert.alert` con "Invitation sent" — **no hace nada real**.

---

## Flujo end-to-end del invitado

### Caso A — El invitado YA tiene cuenta

1. Owner abre `ManageHouseholdModal` → tap "Invite" → escribe el email → toca "Send".
2. El RPC `invite_member` busca un profile con ese email, lo encuentra, e inserta la membership.
3. UI del owner: "Added [email] to this budget" ✓
4. El invitado, gracias a **Realtime** (Paso 11 del setup), ve el budget aparecer en su HouseholdSelector / lista de budgets **al instante** sin recargar.

Cero pasos extra del invitado. Es completamente automático.

### Caso B — El invitado NO tiene cuenta

1. Owner abre el sheet, escribe el email, toca "Send".
2. El RPC no encuentra profile.
3. UI del owner: "[email] isn't registered yet. Ask them to sign up first and try again." (mensaje informativo, no error).
4. Owner avisa por su propio canal (WhatsApp, lo que sea): "Bajate la app y registrate, después te agrego".
5. Una vez registrado, owner repite el invite → cae en Caso A.

---

## Cambios en Supabase

### 1. RPC `invite_member`

Encapsula toda la lógica del lado del servidor: validación de permisos, búsqueda de profile, inserción de membership.

```sql
create or replace function public.invite_member(
  p_household_id uuid,
  p_email text,
  p_role membership_role default 'member'
)
returns text  -- 'added' | 'not_registered' | 'already_member'
language plpgsql
security definer
set search_path = public
as $$
declare
  my_id uuid := auth.uid();
  normalized_email text := lower(trim(p_email));
  target_profile_id uuid;
  is_owner boolean;
begin
  if my_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Solo owners pueden invitar
  select exists (
    select 1 from memberships
    where household_id = p_household_id
      and user_id = my_id
      and role = 'owner'
  ) into is_owner;

  if not is_owner then
    raise exception 'Only owners can invite';
  end if;

  -- ¿El email tiene profile?
  select id into target_profile_id
  from profiles
  where lower(email) = normalized_email
  limit 1;

  if target_profile_id is null then
    return 'not_registered';
  end if;

  -- ¿Ya es miembro?
  if exists (
    select 1 from memberships
    where household_id = p_household_id and user_id = target_profile_id
  ) then
    return 'already_member';
  end if;

  -- Inserción real
  insert into memberships (household_id, user_id, role)
  values (p_household_id, target_profile_id, p_role);
  return 'added';
end;
$$;

grant execute on function public.invite_member(uuid, text, membership_role) to authenticated;
```

**Por qué `security definer`**: el rol `authenticated` no puede leer profiles de personas con las que no comparte household (por la policy `profiles_self_read` del Paso 9). Esto bloquea la búsqueda por email desde el cliente. La función corre como `postgres` y puede leer todos los profiles.

**Lo único que filtra**: la existencia o no de un email en la DB (el outcome `not_registered` vs `added/already_member` lo revela). Para una app de presupuestos es información mínima y aceptable.

### 2. No hace falta nada más

Sin tabla nueva, sin policies nuevas, sin tocar el trigger `handle_new_user`. La policy `memberships_insert_owner` ya permite que un owner agregue memberships, pero como la lógica corre dentro del RPC con `security definer`, también funcionaría sin esa policy. La RPC es la única vía soportada para invitar.

---

## Cambios en código (cliente)

### 1. Acción `inviteMember` en `householdStore`

[src/store/householdStore.ts](src/store/householdStore.ts):

```ts
inviteMember: async (householdId: string, email: string) => {
  return withMutation(async () => {
    const { data, error } = await supabase.rpc('invite_member', {
      p_household_id: householdId,
      p_email: email,
    });
    if (error) {
      console.warn('inviteMember failed:', error.message);
      return 'error' as const;
    }
    await get().fetchAll();
    return (data ?? 'error') as 'added' | 'not_registered' | 'already_member' | 'error';
  });
},
```

Notar: usa `withMutation` para que aparezca el spinner global mientras se ejecuta.

### 2. Refactor de `InviteMemberSheet`

[src/components/household/InviteMemberSheet.tsx](src/components/household/InviteMemberSheet.tsx):

- Recibir el `householdId` por prop (no solo `householdName`).
- Reemplazar el `Alert.alert` fake por una llamada real a `inviteMember`.
- Manejar los 4 outcomes posibles y mostrar el mensaje correspondiente al owner:

```ts
const handleSend = async () => {
  if (!isValid) return;
  const target = trimmed;
  const outcome = await inviteMember(householdId, target);
  onClose();

  const messages = {
    added: t('invite.outcomeAdded', { email: target }),
    not_registered: t('invite.outcomeNotRegistered', { email: target }),
    already_member: t('invite.outcomeAlreadyMember', { email: target }),
    error: t('invite.outcomeError'),
  };
  Alert.alert(t('invite.title'), messages[outcome]);
};
```

(Sigue el patrón ya conocido de **cerrar la sheet ANTES de mostrar el Alert** — descubrimos antes que Android trata el Alert sobre un Modal abierto mal.)

### 3. `ManageHouseholdModal` — pasar el `householdId` al sheet

Hoy ya pasa el `householdName`. Solo agregar también el `id`:

```tsx
<InviteMemberSheet
  visible={inviteOpen}
  householdId={household.id}
  householdName={household.name}
  onClose={() => setInviteOpen(false)}
/>
```

### 4. Traducciones

`en.json` bajo `invite`:
- `outcomeAdded`: "Added {{email}} to this budget."
- `outcomeNotRegistered`: "{{email}} isn't registered yet. Ask them to sign up first and try again."
- `outcomeAlreadyMember`: "{{email}} is already a member of this budget."
- `outcomeError`: "Something went wrong. Please try again."

`es.json` bajo `invite`:
- `outcomeAdded`: "Se agregó {{email}} a este presupuesto."
- `outcomeNotRegistered`: "{{email}} todavía no tiene cuenta. Pedile que se registre y volvé a intentar."
- `outcomeAlreadyMember`: "{{email}} ya es miembro de este presupuesto."
- `outcomeError`: "Algo salió mal. Volvé a intentar."

---

## Limitaciones conocidas

- **El invitado tiene que estar registrado primero** — por diseño. Es la decisión de producto que simplifica todo lo demás.
- **No hay manera de "pre-invitar"** a alguien antes de que se registre. El owner tiene que coordinar fuera de la app que la persona se registre y después invitarla.
- **Filtra mínimamente la existencia de un email**: el outcome `not_registered` vs `added/already_member` revela si un email tiene cuenta. Aceptable para una app de presupuestos.

---

## Mejoras futuras (cuando justifique)

- **Pre-invitaciones con email**: si más adelante queremos permitir invitar a no-usuarios, agregar Edge Function + Resend + tabla `invitations`. Es un proyecto aparte.
- **Compartir budget vía link**: el owner toca "Share invite link" y se genera un token que la otra persona usa al registrarse. Misma complejidad que pre-invitations.

---

## Orden de implementación

1. **Backend (Supabase)**: correr el SQL del RPC `invite_member` en el SQL Editor.
2. **Cliente**:
   1. Agregar acción `inviteMember` al `householdStore`.
   2. Modificar `InviteMemberSheet` para llamar al RPC y mostrar el outcome.
   3. Pasar `householdId` desde `ManageHouseholdModal`.
   4. Agregar las traducciones.

3. **Test end-to-end** (con 2 cuentas):
   - Cuenta A invita a cuenta B (que ya existe) → outcome `added`, B ve el budget aparecer al instante por Realtime.
   - Cuenta A invita a B de nuevo → outcome `already_member`.
   - Cuenta A invita a un email random `naexiste@x.com` → outcome `not_registered`.
