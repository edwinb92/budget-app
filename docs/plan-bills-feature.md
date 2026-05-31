# Plan — Feature Bills

Plan de trabajo pendiente para terminar el feature de **Bills** (cuentas recurrentes del household). Pausado para retomar después.

## Estado actual

**Ya existe**:
- Tabla `public.bills` en Supabase (creada en Paso 8 del setup) con columnas: `id`, `household_id`, `name`, `icon_key`, `accent`, `amount`, `due_day` (1-31), `status` (`paid` | `pending`), `created_at`.
- Policy RLS `bills_all` (cualquier miembro del household puede CRUD).
- `bills` incluidas en la publication `supabase_realtime`.
- `budgetStore.bills` ya hace fetch real desde Supabase con aliasing.
- Componente `BillCard` ya renderiza cada bill en el Dashboard.
- Sección "Bills" en el Dashboard con su empty state ("No bills yet…").

**Lo que falta**:
- Form para **crear** bills.
- UI para **editar / borrar** bills.
- Toggle de **status** (paid ↔ pending).
- **Integración con Activity**: al marcar una bill como pagada, generar automáticamente un expense en la categoría que esa bill tiene asociada.

## Decisiones de producto ya tomadas

1. **Bills se atan a una categoría al momento de crearlas**. Ej: "Internet" → categoría Home, "Spotify" → categoría Entertainment. Esto define dónde va el expense auto-generado cuando se paga.
2. **Pagar bill = genera expense automático** en la categoría linkeada, con monto + nombre de la bill, y `paid_by_id = currentUser`. Así aparece en Activity y suma al `spent` de la categoría.
3. **Cambiar status paid → pending** NO borra el expense generado. Es asimétrico pero pragmático (sin tracking mensual de pagos individuales). Para "deshacer" el usuario borra el expense desde Activity manualmente.
4. **Sin tracking mensual histórico**. Una bill tiene UN status actual (no historial mes a mes). Esa funcionalidad sería un feature aparte con tabla `bill_payments`.

## Cambios técnicos a implementar

### 1. Schema migration (Supabase SQL Editor)

```sql
alter table public.bills
  add column category_id uuid references public.categories(id) on delete restrict;

create index bills_category_idx on public.bills(category_id);
```

- **Nullable** intencional — bills viejas (del Paso 8) no tienen categoría todavía, no queremos romperlas.
- `on delete restrict` — no se puede borrar una categoría que sea referenciada por bills (mismo principio que expenses).

### 2. Types

[src/types/index.ts](src/types/index.ts) — agregar a `Bill`:

```ts
export interface Bill {
  id: string;
  name: string;
  iconKey: string;
  accent: AccentName;
  amount: number;
  status: BillStatus;
  dueDay: number;
  categoryId: string | null;  // NUEVO
}
```

### 3. `budgetStore` ([src/store/budgetStore.ts](src/store/budgetStore.ts))

**a)** Actualizar `fetchForActiveHousehold` para incluir `category_id` en el select de bills:
```ts
.select('id, name, iconKey:icon_key, accent, amount, status, dueDay:due_day, categoryId:category_id')
```

**b)** Agregar nuevas acciones:

```ts
addBill: (input: {
  name: string;
  iconKey: string;
  accent: AccentName;
  amount: number;
  dueDay: number;
  categoryId: string;     // requerido en el form de creación
  status?: 'paid' | 'pending';
}) => Promise<void>;

updateBill: (id: string, patch: Partial<{
  name: string;
  iconKey: string;
  accent: AccentName;
  amount: number;
  dueDay: number;
  categoryId: string | null;
  status: 'paid' | 'pending';
}>) => Promise<void>;

deleteBill: (id: string) => Promise<void>;

// Helper de alto nivel — encapsula toggle + auto-expense
markBillPaid: (id: string) => Promise<void>;
markBillPending: (id: string) => Promise<void>;
```

**c)** Lógica de `markBillPaid`:
1. Buscar la bill por id.
2. Si no tiene `categoryId` → no generar expense (loguear warning, igual cambiar status a paid). Idealmente surfacear un mensaje al usuario.
3. Si tiene `categoryId` → insertar expense en `expenses` table con:
   - `household_id` = bill.household_id (o el active)
   - `category_id` = bill.categoryId
   - `paid_by_id` = currentUserId
   - `amount` = bill.amount
   - `note` = bill.name (o `Bill: ${bill.name}` para distinguir)
4. Actualizar bill.status a 'paid'.
5. Refetch.

`markBillPending` solo cambia status, sin tocar expenses.

### 4. Store para estado del editor

[src/store/billEditorStore.ts](src/store/billEditorStore.ts) — nuevo, mismo patrón que `categoryEditorStore` y `expenseEditorStore`:

```ts
type EditorMode = 'closed' | 'create' | 'edit';

interface BillEditorState {
  mode: EditorMode;
  editingId: string | null;
  draft: {
    name: string;
    iconKey: string;
    accent: AccentName;
    amount: number;
    dueDay: number;
    categoryId: string | null;
    status: 'paid' | 'pending';
  };

  openCreate: () => void;
  openEdit: (id: string) => void;
  close: () => void;
  // setters individuales por campo
}
```

### 5. Componentes nuevos

- **`CategoryPicker`** ([src/components/categories/CategoryPicker.tsx](src/components/categories/CategoryPicker.tsx)) — lista horizontal de categorías del household activo (chips con ícono + nombre). Reusable más adelante en otros flows.
- **`DueDayInput`** ([src/components/bills/DueDayInput.tsx](src/components/bills/DueDayInput.tsx)) — un input numérico 1-31. Puede ser un número simple o un picker. Empezar con TextInput numérico validado.
- **`BillEditorSheet`** ([src/components/bills/BillEditorSheet.tsx](src/components/bills/BillEditorSheet.tsx)) — bottom sheet (patrón igual a `ExpenseEditorSheet` y `CategoryEditor`). Maneja create y edit. Campos:
  - Nombre (TextInput)
  - Monto (input con prefijo de símbolo de moneda, formateo de miles — reusar la lógica del wizard)
  - Día de vencimiento (DueDayInput, 1-31)
  - Ícono (reusar `IconPicker` existente)
  - Color de acento (reusar `AccentPicker` existente)
  - Categoría (nuevo `CategoryPicker`)
  - Status toggle (en modo edit solamente): paid / pending. Cuando lo cambia a paid → llama `markBillPaid`. A pending → `markBillPending`.
  - Botón Save
  - Botón Delete (solo en edit, con `Alert.alert` de confirmación)

### 6. UI updates

- **[src/components/dashboard/BillCard.tsx](src/components/dashboard/BillCard.tsx)** — hacer `Pressable` (similar a como hicimos con `ExpenseRow`). El `onPress` abre el editor en modo edit (`billEditorStore.openEdit(bill.id)`).
- **[src/screens/DashboardScreen.tsx](src/screens/DashboardScreen.tsx)** — reemplazar el `actionLabel="Manage"` de la sección Bills por `"+ New"`, con `onAction` que llama a `billEditorStore.openCreate()`. Verificar que `SectionTitle` ya acepte `onAction`.
- **[App.tsx](App.tsx)** — montar `<BillEditorSheet />` junto con los otros modales globales.

### 7. Verificación end-to-end

Después de implementar:
1. Crear una categoría "Home" (si no existe).
2. Crear una bill "Internet" con amount 25000, due_day 3, categoría Home, status pending.
3. Verificar que aparece en el Dashboard.
4. Tocar la card → abre editor → cambiar status a paid → save.
5. Ir a Activity → debería aparecer un expense "Internet" de 25000 en la categoría Home, paid_by_id = tu user.
6. El `spent` de la categoría Home debería subir 25000.
7. En Supabase SQL:
   ```sql
   select b.name, b.status, c.name as categoria, e.id as expense_id
   from public.bills b
   left join public.categories c on c.id = b.category_id
   left join public.expenses e
     on e.category_id = b.category_id
    and e.amount = b.amount
    and e.note = b.name
   order by b.created_at desc;
   ```

### 8. Documentación

Agregar una sección "Bills feature" al final de [docs/supabase-setup.md](docs/supabase-setup.md) que cubra:
- La migration del category_id (con su SQL).
- La decisión de "pagar bill = auto-expense" como diseño.
- Las limitaciones conocidas (sin tracking mensual, status pending no borra expense, etc.).

## Limitaciones conocidas que vamos a aceptar

- **No hay historial mensual**: cada bill tiene UN status. Si pagás Internet en marzo y abril, vas a tener el mismo `status: paid` (no se vuelve pending automáticamente cada mes). Futura mejora: tabla `bill_payments` con `bill_id`, `month`, `paid_at`.
- **Toggle status no es idempotente del lado de los expenses**: cada vez que vas paid → pending → paid generaría un expense nuevo. Para evitar duplicados podríamos chequear si ya hay un expense linkeado antes de crear, pero para empezar lo dejamos simple.
- **Categoría nullable**: las bills sin categoría no generan expense al marcarse paid (con warning). El form de creación va a forzar elegir una, así que esto solo aplica a bills viejas del Paso 8 (a las que se les puede asignar categoría editándolas).
- **El expense generado lleva el nombre de la bill como `note`** y no tiene marca explícita de "este vino de una bill". Si se borra la bill, el expense queda (es un evento histórico válido).

## Orden sugerido de implementación

1. Migration (Supabase)
2. Tipo `Bill` y mapping en `fetchForActiveHousehold`
3. `billEditorStore`
4. `CategoryPicker`
5. `BillEditorSheet`
6. Mutaciones en `budgetStore` (`addBill`, `updateBill`, `deleteBill`, `markBillPaid`, `markBillPending`)
7. `BillCard` pressable + Dashboard "+ New"
8. Montar el sheet en `App.tsx`
9. Test end-to-end
10. Documentar
